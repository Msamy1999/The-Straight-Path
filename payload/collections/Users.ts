import type { CollectionConfig } from "payload";
import { APIError } from "payload";
import {
  ownerOnly,
  ownerOrFirstUser,
  ownerOrSelf,
  userRole,
} from "../access/editorial";

/**
 * Admin users for the editorial workflow. Auth-enabled; the first user is
 * created at /admin on first run.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    create: ownerOrFirstUser,
    read: ownerOrSelf,
    update: ownerOrSelf,
    delete: ownerOnly,
    // Account recovery must not let a reviewer reset another user's lockout.
    unlock: ownerOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === "create" && !req.user) {
          return { ...data, role: "owner" };
        }
        if (
          operation === "update" &&
          userRole(req.user) === "reviewer" &&
          Object.hasOwn(data ?? {}, "role") &&
          data?.role !== originalDoc?.role
        ) {
          throw new APIError("Reviewers cannot change their account role.", 403);
        }
        if (
          operation === "update" &&
          originalDoc?.role === "owner" &&
          Object.hasOwn(data ?? {}, "role") &&
          data?.role !== "owner"
        ) {
          const owners = await req.payload.count({
            collection: "users",
            overrideAccess: true,
            where: { role: { equals: "owner" } },
          });
          if (owners.totalDocs <= 1) {
            throw new APIError("The final owner cannot be demoted.", 400);
          }
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({
          collection: "users",
          id,
          overrideAccess: true,
        });
        if (userRole(user) !== "owner") return;
        const owners = await req.payload.count({
          collection: "users",
          overrideAccess: true,
          where: { role: { equals: "owner" } },
        });
        if (owners.totalDocs <= 1) {
          throw new APIError("The final owner cannot be deleted.", 400);
        }
      },
    ],
  },
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      // New collaborators receive the least-privileged editorial role. The
      // bootstrap hook above promotes only the very first account to owner.
      defaultValue: "reviewer",
      required: true,
      access: {
        update: ({ req }) => userRole(req.user) === "owner",
      },
      options: [
        // Owner can publish; reviewer can move content to under-review but
        // not publish. Even solo, this encodes the two-step verification
        // workflow for future collaborators.
        { label: "Owner", value: "owner" },
        { label: "Reviewer", value: "reviewer" },
      ],
    },
  ],
};
