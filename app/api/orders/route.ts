import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "Supabase not configured.",
      });
    }

    const body = await req.json();
    const rows = Array.isArray(body) ? body : [body];

    const { error } = await supabase
      .from("products")
      .upsert(rows);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: rows.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save products" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}