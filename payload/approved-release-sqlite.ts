import type { PayloadRequest } from "payload";
import { assertRegisteredReleaseTransaction, type ReleaseTransactionRegistry } from "./approved-release-transaction";

interface PragmaResult { rows: readonly unknown[] }
export interface ReleaseSQLiteConnection extends ReleaseTransactionRegistry {
  client: { execute(statement: string): Promise<PragmaResult> };
  execute(options: { db: unknown; raw: string }): PromiseLike<PragmaResult>;
}
const spillValue = (result: PragmaResult): number => {
  const row = result.rows?.[0];
  return typeof row === "object" && row !== null && "cache_spill" in row ? Number(row.cache_spill) : NaN;
};

/**
 * Connection-local only: do this BEFORE EACH BEGIN. Installed libsql moves
 * the current connection into a transaction and opens a fresh one on next use.
 * Changing the flag only after BEGIN does not prevent the observed spill lock.
 */
export async function prepareReleaseReaderConcurrency(adapter: ReleaseSQLiteConnection): Promise<void> {
  if (Object.values(adapter.sessions ?? {}).some(session => session.db)) throw new Error("Reader concurrency must be configured before opening a release transaction.");
  await adapter.client.execute("PRAGMA cache_spill=OFF");
  if (spillValue(await adapter.client.execute("PRAGMA cache_spill")) !== 0) throw new Error("Publisher connection did not accept cache_spill=OFF; no release writes are allowed.");
}

/** Verify the actual registered session, never the client's next connection. */
export async function verifyReleaseReaderConcurrency(adapter: ReleaseSQLiteConnection, req: Partial<PayloadRequest>, transaction: number | string): Promise<void> {
  assertRegisteredReleaseTransaction(req, adapter, transaction);
  const db = adapter.sessions![String(transaction)].db;
  if (spillValue(await adapter.execute({ db, raw: "PRAGMA cache_spill" })) !== 0) throw new Error("Registered publication session is not configured to defer cache spilling; no release writes are allowed.");
}
