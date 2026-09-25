import { actionGeneric, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

// Only the Next.js server holds this secret; browser requests use its session checks.
function authorize(secret: string) {
  const expected = process.env.STORE_SERVER_SECRET;
  if (!expected || expected.length < 32 || secret.length !== expected.length) throw new Error("Unauthorized");
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ secret.charCodeAt(i);
  if (difference) throw new Error("Unauthorized");
}

export const list = queryGeneric({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    authorize(secret);
    const rows = await ctx.db.query("appData").collect();
    return Object.fromEntries(rows.map(row => [row.key, row.value]));
  },
});

export const get = queryGeneric({
  args: { secret: v.string(), key: v.string() },
  handler: async (ctx, { secret, key }) => {
    authorize(secret);
    const row = await ctx.db.query("appData").withIndex("by_key", q => q.eq("key", key)).unique();
    return row ? { value: row.value, revision: row.updatedAt } : null;
  },
});

export const compareAndSwap = mutationGeneric({
  args: { secret: v.string(), key: v.string(), revision: v.union(v.number(), v.null()), value: v.any() },
  handler: async (ctx, { secret, key, revision, value }) => {
    authorize(secret);
    const row = await ctx.db.query("appData").withIndex("by_key", q => q.eq("key", key)).unique();
    if ((row?.updatedAt ?? null) !== revision) return false;
    const updatedAt = Math.max(Date.now(), (row?.updatedAt ?? 0) + 1);
    if (row) await ctx.db.patch(row._id, { value, updatedAt });
    else await ctx.db.insert("appData", { key, value, updatedAt });
    return true;
  },
});

export const uploadImage = actionGeneric({
  args: { secret: v.string(), data: v.bytes(), contentType: v.string() },
  handler: async (ctx, { secret, data, contentType }) => {
    authorize(secret);
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(contentType) || !data.byteLength || data.byteLength > 2 * 1024 * 1024) throw new Error("Invalid image");
    const id = await ctx.storage.store(new Blob([data], { type: contentType }));
    return await ctx.storage.getUrl(id);
  },
});
