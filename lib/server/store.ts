import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

type Store = Record<string, unknown>;
const file = path.resolve(process.env.STORE_FILE || ".data/admin-storage.json");
let queue: Promise<unknown> = Promise.resolve();
function convexStore() {
  if (process.env.STORE_BACKEND !== "convex") return null;
  const url = process.env.CONVEX_URL;
  const secret = process.env.STORE_SERVER_SECRET;
  if (!url || !secret || secret.length < 32) throw new Error("Configure CONVEX_URL and STORE_SERVER_SECRET");
  return { client: new ConvexHttpClient(url, { logger: false }), secret };
}
function database() {
  if (process.env.STORE_BACKEND === "local") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configure server-side Supabase or explicitly select local storage");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function localStore(): Promise<Store> {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}; throw error; }
}
export async function readStore(): Promise<Store> {
  const convex = convexStore();
  if (convex) return convex.client.query(makeFunctionReference<"query">("serverStore:list"), { secret: convex.secret });
  const db = database();
  if (!db) return localStore();
  const { data, error } = await db.from("admin_storage").select("key,value");
  if (error) throw error;
  return Object.fromEntries(data.map(row => [row.key, row.value]));
}
export async function readValue<T>(key: string, fallback: T): Promise<T> {
  const convex = convexStore();
  if (convex) {
    const row = await convex.client.query(makeFunctionReference<"query">("serverStore:get"), { secret: convex.secret, key });
    return row?.value ?? fallback;
  }
  const db = database();
  if (!db) return (await localStore())[key] as T ?? fallback;
  const { data, error } = await db.from("admin_storage").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.value ?? fallback;
}
// Compare-and-swap prevents two server instances from dropping each other's orders/accounts.
export async function updateValue<T>(key: string, fallback: T, update: (value: T) => T): Promise<T> {
  const convex = convexStore();
  if (convex) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const row = await convex.client.query(makeFunctionReference<"query">("serverStore:get"), { secret: convex.secret, key });
      const next = update(row?.value ?? fallback);
      const saved = await convex.client.mutation(makeFunctionReference<"mutation">("serverStore:compareAndSwap"), { secret: convex.secret, key, revision: row?.revision ?? null, value: JSON.parse(JSON.stringify(next)) });
      if (saved) return next;
    }
    throw new Error("Concurrent update; please retry");
  }
  const db = database();
  if (db) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data, error } = await db.from("admin_storage").select("value,updated_at").eq("key", key).maybeSingle();
      if (error) throw error;
      const next = update(data?.value ?? fallback);
      const row = { key, value: next, updated_at: new Date(Math.max(Date.now(), data?.updated_at ? Date.parse(data.updated_at) + 1 : 0)).toISOString() };
      if (!data) {
        const result = await db.from("admin_storage").insert(row);
        if (!result.error) return next;
        if (result.error.code !== "23505") throw result.error;
      } else {
        const result = await db.from("admin_storage").update(row).eq("key", key).eq("updated_at", data.updated_at).select("key");
        if (result.error) throw result.error;
        if (result.data.length) return next;
      }
    }
    throw new Error("Concurrent update; please retry");
  }
  const work = queue.then(async () => {
    const store = await localStore();
    const next = update(store[key] as T ?? fallback);
    store[key] = next;
    await fs.mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(store), { mode: 0o600 });
    await fs.rename(temporary, file);
    return next;
  });
  queue = work.catch(() => undefined);
  return work;
}
export async function writeValue(key: string, value: unknown) {
  return updateValue(key, null, () => value);
}
