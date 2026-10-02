import assert from "node:assert/strict";
import {
  authenticated,
  ownerOnly,
  ownerOrFirstUser,
  ownerOrSelf,
} from "../payload/access/editorial";
import { Articles } from "../payload/collections/Articles";
import { AnalyticsEvents } from "../payload/collections/AnalyticsEvents";
import { Citations } from "../payload/collections/Citations";
import { ComparisonArticles } from "../payload/collections/ComparisonArticles";
import { GlossaryTerms } from "../payload/collections/Glossary";
import { BibleVerses, QuranVerses } from "../payload/collections/Scripture";
import {
  SourceLibraryCategories,
  SourceLibraryItems,
} from "../payload/collections/SourceLibrary";
import { Users } from "../payload/collections/Users";
import { enforceEditorialRole } from "../payload/hooks/enforceEditorialRole";
import { blockUnverifiedPublish } from "../payload/hooks/blockUnverifiedPublish";
import { safeExternalUrl, validateExternalUrl } from "../lib/external-url";

type AccessFunction = (args: unknown) => unknown;
type HookFunction = (args: unknown) => unknown;

function invoke(access: unknown, req: object) {
  assert.equal(typeof access, "function");
  return (access as AccessFunction)({ req });
}

const owner = { id: 1, role: "owner" };
const reviewer = { id: 2, role: "reviewer" };
const anonymous = undefined;

assert.equal(invoke(authenticated, { user: owner }), true);
assert.equal(invoke(authenticated, { user: anonymous }), false);
assert.equal(invoke(ownerOnly, { user: owner }), true);
assert.equal(invoke(ownerOnly, { user: reviewer }), false);
assert.equal(invoke(Users.access?.unlock, { user: owner }), true);
assert.equal(invoke(Users.access?.unlock, { user: reviewer }), false);
assert.equal(invoke(Users.access?.unlock, { user: anonymous }), false);
assert.deepEqual(invoke(ownerOrSelf, { user: reviewer }), {
  id: { equals: reviewer.id },
});

assert.equal(
  await invoke(ownerOrFirstUser, {
    user: anonymous,
    payload: { count: async () => ({ totalDocs: 0 }) },
  }),
  true,
);
assert.equal(
  await invoke(ownerOrFirstUser, {
    user: anonymous,
    payload: { count: async () => ({ totalDocs: 1 }) },
  }),
  false,
);

await assert.rejects(
  async () =>
    enforceEditorialRole({
      data: { status: "published" },
      req: { user: reviewer },
    } as never),
  /Only an owner can publish/,
);
await assert.rejects(
  async () =>
    enforceEditorialRole({
      data: { title: "A partial update" },
      originalDoc: { status: "published" },
      req: { user: reviewer },
    } as never),
  /Only an owner can publish/,
);
await assert.rejects(
  async () =>
    enforceEditorialRole({
      data: { status: "reviewed" },
      originalDoc: { status: "published" },
      req: { user: reviewer },
    } as never),
  /Only an owner can publish/,
);
assert.deepEqual(
  await enforceEditorialRole({
    data: { status: "reviewed" },
    req: { user: reviewer },
  } as never),
  { status: "reviewed" },
);
assert.deepEqual(
  await enforceEditorialRole({
    data: { status: "published" },
    req: { user: owner },
  } as never),
  { status: "published" },
);

for (const collection of [Articles, ComparisonArticles]) {
  assert.equal(collection.access?.create, authenticated);
  assert.equal(collection.access?.update, authenticated);
  assert.equal(collection.access?.delete, ownerOnly);
  assert.equal(collection.hooks?.beforeChange?.[0], enforceEditorialRole);
  assert.equal(collection.hooks?.beforeChange?.[1], blockUnverifiedPublish);
}

await assert.rejects(
  async () =>
    blockUnverifiedPublish({
      data: { citations: [99] },
      originalDoc: { status: "published", title: "Published article" },
      req: {
        payload: { find: async () => ({ docs: [] }) },
      },
    } as never),
  /references are missing: 99/i,
);
await assert.rejects(
  async () =>
    blockUnverifiedPublish({
      data: { title: "[SOURCE PENDING]" },
      originalDoc: { status: "published" },
      req: {
        payload: { find: async () => assert.fail("placeholder should fail first") },
      },
    } as never),
  /placeholder marker/i,
);
await assert.rejects(
  async () =>
    blockUnverifiedPublish({
      data: { citations: [7] },
      originalDoc: { status: "published", title: "Published article" },
      req: {
        payload: {
          find: async () => ({ docs: [{ id: 7, status: "pending", title: "Draft source" }] }),
        },
      },
    } as never),
  /not yet verified/i,
);

// Publication source reads must share the exact owner request/transaction;
// otherwise bulk SQLite publication can self-block on a second connection.
type SourceRead = {
  collection: string;
  req: unknown;
  overrideAccess: boolean;
  depth: number;
  where: { id: { in: string[] } };
};
const sourceReadCalls: { collection: string; ids: string[] }[] = [];
const transactionReq = {
  user: owner,
  transactionID: "editorial-publication-transaction",
  locale: "en",
  payload: {
    find: async (options: SourceRead) => {
      assert.equal(options.req, transactionReq);
      assert.equal(options.overrideAccess, false);
      assert.equal(options.depth, 0);
      sourceReadCalls.push({ collection: options.collection, ids: options.where.id.in });
      return { docs: options.where.id.in.map(id => ({ id, status: "verified" })) };
    },
  },
};
const verifiedData = {
  status: "published",
  citations: [1, "1", { id: 2 }],
  sections: [{ citations: [3] }],
  sources: [4],
  quranVerses: [5],
  bibleVerses: [6],
};
assert.equal(await blockUnverifiedPublish({ data: verifiedData, req: transactionReq } as never), verifiedData);
assert.deepEqual(sourceReadCalls, [
  { collection: "citations", ids: ["1", "2", "3", "4"] },
  { collection: "quran-verses", ids: ["5"] },
  { collection: "bible-verses", ids: ["6"] },
]);
for (const collection of ["citations", "quran-verses", "bible-verses"]) {
  const pendingReq = {
    user: owner,
    transactionID: `pending-source-${collection}`,
    payload: {
      find: async (options: SourceRead) => {
        assert.equal(options.req, pendingReq);
        assert.equal(options.overrideAccess, false);
        return { docs: options.where.id.in.map(id => ({ id, status: options.collection === collection ? "pending" : "verified" })) };
      },
    },
  };
  await assert.rejects(
    async () => blockUnverifiedPublish({ data: verifiedData, req: pendingReq } as never),
    /not yet verified/i,
  );
  const missingReq = {
    user: owner,
    transactionID: `missing-source-${collection}`,
    payload: {
      find: async (options: SourceRead) => {
        assert.equal(options.req, missingReq);
        assert.equal(options.overrideAccess, false);
        return { docs: options.collection === collection ? [] : options.where.id.in.map(id => ({ id, status: "verified" })) };
      },
    },
  };
  await assert.rejects(
    async () => blockUnverifiedPublish({ data: verifiedData, req: missingReq } as never),
    /references are missing/i,
  );
}

for (const collection of [
  Citations,
  GlossaryTerms,
  QuranVerses,
  BibleVerses,
  SourceLibraryCategories,
  SourceLibraryItems,
]) {
  assert.equal(collection.access?.create, authenticated);
  assert.equal(collection.access?.update, authenticated);
  assert.equal(collection.access?.delete, ownerOnly);
  assert.equal(invoke(collection.access?.create, { user: anonymous }), false);
  assert.equal(invoke(collection.access?.update, { user: anonymous }), false);
  assert.equal(invoke(collection.access?.delete, { user: reviewer }), false);
}

assert.equal(AnalyticsEvents.access?.read, ownerOnly);
assert.equal(AnalyticsEvents.access?.create?.({} as never), false);
assert.equal(AnalyticsEvents.access?.update?.({} as never), false);
assert.equal(AnalyticsEvents.access?.delete, ownerOnly);
assert.equal(invoke(AnalyticsEvents.access?.read, { user: reviewer }), false);

assert.equal(safeExternalUrl("https://example.com/source"), "https://example.com/source");
assert.equal(safeExternalUrl("http://example.com/source"), undefined);
assert.equal(safeExternalUrl("javascript:alert(1)"), undefined);
assert.equal(safeExternalUrl("https://user:secret@example.com/source"), undefined);
assert.equal(validateExternalUrl(undefined), true);
assert.equal(typeof validateExternalUrl("/relative-source"), "string");

assert.equal(Users.access?.create, ownerOrFirstUser);
assert.equal(Users.access?.read, ownerOrSelf);
assert.equal(Users.access?.update, ownerOrSelf);
assert.equal(Users.access?.delete, ownerOnly);
assert.deepEqual(invoke(Users.access?.update, { user: reviewer }), {
  id: { equals: reviewer.id },
});
const roleField = Users.fields.find(
  (field) => "name" in field && field.name === "role",
);
assert.ok(roleField && "defaultValue" in roleField);
assert.equal(roleField.defaultValue, "reviewer");
assert.ok("access" in roleField && roleField.access?.update);
assert.equal(
  invoke(roleField.access?.update, { user: reviewer }),
  false,
);
assert.equal(invoke(roleField.access?.update, { user: owner }), true);

const userBeforeChange = Users.hooks?.beforeChange?.[0];
assert.equal(typeof userBeforeChange, "function");
assert.deepEqual(
  await (userBeforeChange as HookFunction)({
    data: { name: "Updated owner name" },
    operation: "update",
    originalDoc: owner,
    req: {
      user: owner,
      payload: { count: async () => assert.fail("role count should not run") },
    },
  }),
  { name: "Updated owner name" },
);
assert.deepEqual(
  await (userBeforeChange as HookFunction)({
    data: { role: "reviewer" },
    operation: "create",
    req: { user: undefined },
  }),
  { role: "owner" },
);
await assert.rejects(
  async () =>
    (userBeforeChange as HookFunction)({
      data: { role: "reviewer" },
      operation: "update",
      originalDoc: owner,
      req: {
        user: owner,
        payload: { count: async () => ({ totalDocs: 1 }) },
      },
    }),
  /final owner cannot be demoted/i,
);
await assert.rejects(
  async () =>
    (userBeforeChange as HookFunction)({
      data: { role: "owner" },
      operation: "update",
      originalDoc: reviewer,
      req: {
        user: reviewer,
        payload: { count: async () => assert.fail("owner count should not run") },
      },
    }),
  /reviewers cannot change their account role/i,
);
assert.deepEqual(
  await (userBeforeChange as HookFunction)({
    data: { name: "Updated reviewer name" },
    operation: "update",
    originalDoc: reviewer,
    req: {
      user: reviewer,
      payload: { count: async () => assert.fail("owner count should not run") },
    },
  }),
  { name: "Updated reviewer name" },
);

console.log("Editorial owner/reviewer access rules verified.");
