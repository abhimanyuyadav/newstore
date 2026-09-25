import { NextResponse } from "next/server";
import { publicUser } from "@/lib/server/auth";
import { readValue } from "@/lib/server/store";
import { failure, requireAdmin } from "@/lib/server/http";
import type { UserAccount } from "@/lib/types";
export async function GET() {
  try { await requireAdmin(); return NextResponse.json((await readValue<UserAccount[]>("9teen_user_accounts", [])).map(publicUser)); }
  catch (error) { return failure(error); }
}
export async function POST() { return NextResponse.json({ error: "Create accounts through registration; bulk account imports are disabled" }, { status: 405 }); }
