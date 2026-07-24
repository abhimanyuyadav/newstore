import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const getValue = queryGeneric({
  args: { key: v.string() },
  handler: async (ctx: any, args: { key: string }) => {
    const record = await ctx.db
      .query("appData")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .first();

    return record ?? null;
  },
});

export const listValues = queryGeneric({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db.query("appData").collect();
  },
});

export const setValue = mutationGeneric({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx: any, args: { key: string; value: unknown }) => {
    const existing = await ctx.db
      .query("appData")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("appData", {
      key: args.key,
      value: args.value,
      updatedAt: Date.now(),
    });
  },
});

export const deleteValue = mutationGeneric({
  args: { key: v.string() },
  handler: async (ctx: any, args: { key: string }) => {
    const existing = await ctx.db
      .query("appData")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }

    return false;
  },
});
