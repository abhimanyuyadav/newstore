import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Fallback file-based storage
const storageFile = path.join(process.cwd(), ".data", "admin-storage.json");

async function readFallbackStore() {
  try {
    const raw = await fs.readFile(storageFile, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

async function writeFallbackStore(store: Record<string, unknown>) {
  try {
    await fs.mkdir(path.dirname(storageFile), { recursive: true });
    await fs.writeFile(storageFile, JSON.stringify(store, null, 2));
  } catch (error) {
    // Silently fail for fallback
  }
}

// Validate storage key to prevent injection
function isValidStorageKey(key: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(key) && key.length > 0 && key.length <= 255;
}

// Add rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    if (!checkRateLimit(ip, 100, 60000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key && !isValidStorageKey(key)) {
      return NextResponse.json(
        { error: "Invalid storage key" },
        { status: 400 }
      );
    }

    // Try Supabase first
    if (supabase) {
      try {
        if (key) {
          const { data, error } = await supabase
            .from("admin_storage")
            .select("value")
            .eq("key", key)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Supabase error");
          } else if (data) {
            return NextResponse.json(data.value ?? null);
          }
        } else {
          const { data, error } = await supabase
            .from("admin_storage")
            .select("key, value");

          if (!error && data) {
            const store = data.reduce((acc, item) => {
              acc[item.key] = item.value;
              return acc;
            }, {} as Record<string, unknown>);
            return NextResponse.json(store);
          }
        }
      } catch (error) {
        // Fall through to fallback
      }
    }

    // Fallback to file-based storage
    const store = await readFallbackStore();
    if (key) {
      return NextResponse.json(store[key] ?? null);
    }
    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json(
      { error: "Storage service unavailable" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    if (!checkRateLimit(ip, 50, 60000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { key, value } = await request.json();

    if (!key || !isValidStorageKey(key)) {
      return NextResponse.json(
        { error: "Invalid storage key" },
        { status: 400 }
      );
    }

    // Validate value isn't too large (1MB limit)
    const valueStr = JSON.stringify(value);
    if (valueStr.length > 1024 * 1024) {
      return NextResponse.json(
        { error: "Value too large" },
        { status: 400 }
      );
    }

    let supabaseSuccess = false;

    // Try Supabase first
    if (supabase) {
      try {
        const { error } = await supabase.from("admin_storage").upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

        if (!error) {
          supabaseSuccess = true;
        }
      } catch (error) {
        // Fall through to fallback
      }
    }

    // Always also save to fallback storage
    try {
      const store = await readFallbackStore();
      store[key] = value;
      await writeFallbackStore(store);
    } catch (error) {
      // Ignore fallback failures
    }

    return NextResponse.json({
      ok: true,
      key,
      supabaseSuccess,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Storage service unavailable" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    if (!checkRateLimit(ip, 50, 60000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { key } = await request.json();

    if (!key || !isValidStorageKey(key)) {
      return NextResponse.json(
        { error: "Invalid storage key" },
        { status: 400 }
      );
    }

    let supabaseSuccess = false;

    // Try Supabase first
    if (supabase) {
      try {
        const { error } = await supabase.from("admin_storage").delete().eq("key", key);

        if (!error) {
          supabaseSuccess = true;
        }
      } catch (error) {
        // Fall through to fallback
      }
    }

    // Always also delete from fallback storage
    try {
      const store = await readFallbackStore();
      delete store[key];
      await writeFallbackStore(store);
    } catch (error) {
      // Ignore fallback failures
    }

    return NextResponse.json({
      ok: true,
      key,
      supabaseSuccess,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Storage service unavailable" },
      { status: 500 }
    );
  }
}
