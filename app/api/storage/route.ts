import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const storageFile = path.join(process.cwd(), ".data", "admin-storage.json");

async function readStore() {
  try {
    const raw = await fs.readFile(storageFile, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

async function writeStore(store: Record<string, unknown>) {
  await fs.mkdir(path.dirname(storageFile), { recursive: true });
  await fs.writeFile(storageFile, JSON.stringify(store, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const store = await readStore();

  if (key) {
    return NextResponse.json(store[key] ?? null);
  }

  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const store = await readStore();
    store[key] = value;
    await writeStore(store);

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const store = await readStore();
    delete store[key];
    await writeStore(store);

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}
