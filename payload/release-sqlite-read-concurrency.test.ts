/** Isolated synthetic SQLite/installed-libsql tests. No editorial database is opened. */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { execute as sqliteExecute } from "@payloadcms/drizzle/sqlite";
import type { PayloadRequest } from "payload";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { prepareReleaseReaderConcurrency, verifyReleaseReaderConcurrency, type ReleaseSQLiteConnection } from "./approved-release-sqlite";

function adapterFor(client: Client): ReleaseSQLiteConnection {
  return { client, sessions: {}, execute: sqliteExecute as unknown as ReleaseSQLiteConnection["execute"] };
}

function fixture() {
  const directory = mkdtempSync(path.join(os.tmpdir(), "tsp-synthetic-read-concurrency-"));
  const filename = path.join(directory, "synthetic.db");
  const setup = new DatabaseSync(filename);
  setup.exec("CREATE TABLE synthetic (id INTEGER PRIMARY KEY, version TEXT NOT NULL, body BLOB); BEGIN IMMEDIATE;");
  const insert = setup.prepare("INSERT INTO synthetic VALUES (?, 'old', zeroblob(16384))");
  for (let i = 1; i <= 1200; i++) insert.run(i);
  setup.exec("COMMIT");
  assert.equal(setup.prepare("PRAGMA journal_mode").get()?.journal_mode, "delete");
  setup.close();
  return { filename, cleanup: () => {
    const resolved = path.resolve(directory), temporary = path.resolve(os.tmpdir());
    assert.equal(path.dirname(resolved), temporary);
    assert.ok(path.basename(resolved).startsWith("tsp-synthetic-read-concurrency-"));
    try { rmSync(resolved, { recursive: true, force: true }); }
    catch (error) {
      // Installed libsql's transaction.close() does not close its native
      // connection immediately on Windows. Preserve only this synthetic
      // temporary fixture for post-process cleanup; never mask assertions.
      if (!["EPERM", "EBUSY"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
      console.log(JSON.stringify({ syntheticFixtureCleanup: "deferred until libsql process exits" }));
    }
  } };
}

test("default spilling blocks a separate reader after writes exceed the tiny cache", async () => {
  const f = fixture(), client = createClient({ url: `file:${f.filename.replace(/\\/g, "/")}` });
  const reader = new DatabaseSync(f.filename, { readOnly: true });
  try {
    await client.execute("PRAGMA cache_size=32");
    const tx = await client.transaction("write");
    try {
      await tx.execute("UPDATE synthetic SET version='new', body=zeroblob(32768)");
      assert.throws(() => reader.prepare("SELECT version FROM synthetic WHERE id=1").get(), /database is locked/);
      await tx.rollback();
      assert.equal(reader.prepare("SELECT version FROM synthetic WHERE id=1").get()?.version, "old");
    } finally { tx.close(); }
  } finally { reader.close(); client.close(); f.cleanup(); }
});

test("transaction-only spill OFF preserves old readers, atomic commit and next-connection defaults", async () => {
  const f = fixture(), client = createClient({ url: `file:${f.filename.replace(/\\/g, "/")}` });
  const db = drizzle(client), reader = new DatabaseSync(f.filename, { readOnly: true });
  const adapter = adapterFor(client);
  const rssBefore = process.memoryUsage().rss;
  let rssDuring = rssBefore;
  try {
    await client.execute("PRAGMA cache_size=32");
    await prepareReleaseReaderConcurrency(adapter);
    await db.transaction(async tx => {
      adapter.sessions!.phaseOne = { db: tx };
      await verifyReleaseReaderConcurrency(adapter, { transactionID: "phaseOne" } as Partial<PayloadRequest>, "phaseOne");
      await tx.run(sql.raw("UPDATE synthetic SET version='new', body=randomblob(32768)"));
      rssDuring = process.memoryUsage().rss;
      assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='old'").get()?.count, 1200);
      assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='new'").get()?.count, 0);
      assert.equal(reader.prepare("PRAGMA journal_mode").get()?.journal_mode, "delete");
      // Installed libsql moves the transaction to its own connection. Setting
      // a client pragma once cannot configure the next publication transaction.
      const outside = await client.execute("PRAGMA cache_spill");
      assert.notEqual(Number(outside.rows[0]?.cache_spill), 0);
      assert.equal(Number((await tx.run(sql.raw("PRAGMA cache_spill"))).rows[0]?.cache_spill), 0);
    });
    delete adapter.sessions!.phaseOne;
    assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='new'").get()?.count, 1200);
    assert.equal(reader.prepare("PRAGMA integrity_check").get()?.integrity_check, "ok");
    console.log(JSON.stringify({ syntheticUpdatedPayloadMiB: 37.5, rssBeforeMiB: Math.ceil(rssBefore / 1048576), rssDuringMiB: Math.ceil(rssDuring / 1048576), observedPendingRssGrowthMiB: Math.ceil((rssDuring - rssBefore) / 1048576), memoryLimit: "Observed synthetic run, not a production upper bound", journalMode: "delete", readerObservedOnlyCommittedState: true }));
    await db.transaction(async tx => assert.notEqual(Number((await tx.run(sql.raw("PRAGMA cache_spill"))).rows[0]?.cache_spill), 0));
    // Reproduce the second publisher phase: the new client connection must
    // be configured BEFORE its BEGIN, then checked through the real execute.
    await prepareReleaseReaderConcurrency(adapter);
    await db.transaction(async tx => {
      adapter.sessions!.phaseTwo = { db: tx };
      await verifyReleaseReaderConcurrency(adapter, { transactionID: "phaseTwo" } as Partial<PayloadRequest>, "phaseTwo");
      await tx.run(sql.raw("UPDATE synthetic SET version='second', body=randomblob(32768)"));
      assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='new'").get()?.count, 1200);
    });
    delete adapter.sessions!.phaseTwo;
    assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='second'").get()?.count, 1200);
    assert.equal(reader.prepare("PRAGMA integrity_check").get()?.integrity_check, "ok");
  } finally { reader.close(); client.close(); f.cleanup(); }
});

test("spill OFF rollback remains atomic and writers still cannot run concurrently", async () => {
  const f = fixture(), client = createClient({ url: `file:${f.filename.replace(/\\/g, "/")}` });
  const db = drizzle(client), reader = new DatabaseSync(f.filename, { readOnly: true });
  const adapter = adapterFor(client);
  const competingWriter = new DatabaseSync(f.filename);
  try {
    await prepareReleaseReaderConcurrency(adapter);
    await assert.rejects(db.transaction(async tx => {
      adapter.sessions!.rollback = { db: tx };
      await verifyReleaseReaderConcurrency(adapter, { transactionID: "rollback" } as Partial<PayloadRequest>, "rollback");
      await tx.run(sql.raw("UPDATE synthetic SET version='new', body=zeroblob(32768)"));
      assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='old'").get()?.count, 1200);
      assert.throws(() => competingWriter.exec("INSERT INTO synthetic VALUES (1201, 'external', NULL)"), /database is locked/);
      throw new Error("Deliberate synthetic rollback");
    }), /Deliberate synthetic rollback/);
    assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic WHERE version='old'").get()?.count, 1200);
    competingWriter.exec("INSERT INTO synthetic VALUES (1201, 'external', NULL)");
    assert.equal(reader.prepare("SELECT count(*) AS count FROM synthetic").get()?.count, 1201);
    assert.equal(reader.prepare("PRAGMA integrity_check").get()?.integrity_check, "ok");
  } finally { reader.close(); competingWriter.close(); client.close(); f.cleanup(); }
});
