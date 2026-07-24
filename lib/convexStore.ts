type ConvexClientLike = {
  query: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
  mutation: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
};

let client: ConvexClientLike | null = null;

async function getConvexClient(): Promise<ConvexClientLike | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return null;
  }

  if (!client) {
    const { ConvexHttpClient } = await import("convex/browser");
    client = new ConvexHttpClient(convexUrl) as ConvexClientLike;
  }

  return client;
}

async function readFromStorageApi(key?: string) {
  try {
    const url = key ? `/api/storage?key=${encodeURIComponent(key)}` : "/api/storage";
    const response = await fetch(url);
    if (!response.ok) {
      return key ? null : {};
    }
    return await response.json();
  } catch {
    return key ? null : {};
  }
}

export async function readSharedValue(key: string) {
  try {
    const convex = await getConvexClient();
    if (convex) {
      const result = (await convex.query("appData:getValue", { key })) as { value?: unknown } | null;
      return result?.value ?? null;
    }
  } catch {
    // Fall back to the storage API below.
  }

  return readFromStorageApi(key);
}

export async function readAllSharedValues() {
  try {
    const convex = await getConvexClient();
    if (convex) {
      const rows = (await convex.query("appData:listValues", {})) as Array<{ key: string; value: unknown }>;
      return rows.reduce<Record<string, unknown>>((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
    }
  } catch {
    // Fall back to the storage API below.
  }

  return readFromStorageApi();
}

export async function writeSharedValue(key: string, value: unknown) {
  try {
    const convex = await getConvexClient();
    if (convex) {
      await convex.mutation("appData:setValue", { key, value });
      return true;
    }
  } catch {
    // Fall back to the storage API below.
  }

  try {
    const response = await fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteSharedValue(key: string) {
  try {
    const convex = await getConvexClient();
    if (convex) {
      const removed = (await convex.mutation("appData:deleteValue", { key })) as boolean;
      return removed;
    }
  } catch {
    // Fall back to the storage API below.
  }

  try {
    const response = await fetch("/api/storage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
