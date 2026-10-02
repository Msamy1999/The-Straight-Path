import assert from "node:assert/strict";
import test from "node:test";
import type { PayloadRequest } from "payload";
import { prepareReleaseReaderConcurrency, verifyReleaseReaderConcurrency, type ReleaseSQLiteConnection } from "./approved-release-sqlite";

function fixture() {
  const calls: string[] = [], db = {}, sessions: NonNullable<ReleaseSQLiteConnection["sessions"]> = {};
  let clientSpill = 483, sessionSpill = 0;
  const adapter: ReleaseSQLiteConnection = {
    sessions,
    client: { execute: async statement => { calls.push(statement); if (statement === "PRAGMA cache_spill=OFF") clientSpill = 0; return { rows: [{ cache_spill: clientSpill }] }; } },
    execute: async options => { assert.equal(options.db, db); assert.equal(options.raw, "PRAGMA cache_spill"); calls.push("registered-session:PRAGMA cache_spill"); return { rows: [{ cache_spill: sessionSpill }] }; },
  };
  return { adapter, calls, sessions, db, setSessionSpill: (v: number) => { sessionSpill = v; } };
}

test("reader tuning uses only connection-local cache_spill before BEGIN and verifies the actual session", async () => {
  const f = fixture();
  await prepareReleaseReaderConcurrency(f.adapter);
  assert.deepEqual(f.calls, ["PRAGMA cache_spill=OFF", "PRAGMA cache_spill"]);
  f.sessions.active = { db: f.db };
  await verifyReleaseReaderConcurrency(f.adapter, { transactionID: "active" } as Partial<PayloadRequest>, "active");
  assert.equal(f.calls[2], "registered-session:PRAGMA cache_spill");
  assert.ok(f.calls.every(c => !/journal_mode|synchronous|schema|cache_size|foreign_keys/i.test(c)));
});

test("setting only after a transaction opens is rejected before any pragma", async () => {
  const f = fixture(); f.sessions.active = { db: f.db };
  await assert.rejects(prepareReleaseReaderConcurrency(f.adapter), /before opening/);
  assert.deepEqual(f.calls, []);
});

test("ignored setting, wrong request and an unconfigured session all fail closed", async () => {
  const f = fixture();
  const ignored: ReleaseSQLiteConnection = { ...f.adapter, client: { execute: async () => ({ rows: [{ cache_spill: 1 }] }) } };
  await assert.rejects(prepareReleaseReaderConcurrency(ignored), /did not accept/);
  f.sessions.active = { db: f.db };
  await assert.rejects(verifyReleaseReaderConcurrency(f.adapter, { transactionID: "other" } as Partial<PayloadRequest>, "active"), /transaction changed/);
  f.setSessionSpill(1);
  await assert.rejects(verifyReleaseReaderConcurrency(f.adapter, { transactionID: "active" } as Partial<PayloadRequest>, "active"), /not configured/);
});

test("a new phase configures its new client connection again", async () => {
  const f = fixture();
  await prepareReleaseReaderConcurrency(f.adapter);
  await prepareReleaseReaderConcurrency(f.adapter);
  assert.deepEqual(f.calls, ["PRAGMA cache_spill=OFF", "PRAGMA cache_spill", "PRAGMA cache_spill=OFF", "PRAGMA cache_spill"]);
});
