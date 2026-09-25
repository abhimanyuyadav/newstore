import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { requireAdmin, sameOrigin, jsonBody, failure } from "@/lib/server/http";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Rate limiting
const uploadCounts = new Map<string, { count: number; resetTime: number }>();

function checkUploadLimit(ip: string, limit = 10, windowMs = 3600000): boolean {
  const now = Date.now();
  const record = uploadCounts.get(ip);

  if (!record || now > record.resetTime) {
    uploadCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    sameOrigin(req);
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    if (!checkUploadLimit(ip, 10, 3600000)) {
      return NextResponse.json(
        { error: 'Upload limit exceeded' },
        { status: 429 }
      );
    }

    const body = await jsonBody(req, 3 * 1024 * 1024);
    const { fileName, fileData } = body || {};

    if (!fileName || typeof fileData !== 'string') {
      return NextResponse.json(
        { error: 'Missing file data' },
        { status: 400 }
      );
    }

    // Validate fileName
    if (typeof fileName !== 'string' || fileName.length === 0 || fileName.length > 255) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    // Prevent path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

    if (process.env.STORE_BACKEND !== "convex" && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE)) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }



    const match = /^data:(.+);base64,(.+)$/.exec(fileData);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    const contentType = match[1];
    const base64 = match[2];

    // Validate MIME type
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(contentType)) {
      return NextResponse.json(
        { error: 'Unsupported image type' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64, 'base64');

    // Enforce size limit (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    if (process.env.STORE_BACKEND === "convex") {
      if (!process.env.CONVEX_URL || !process.env.STORE_SERVER_SECRET) throw new Error("Configure Convex storage");
      const client = new ConvexHttpClient(process.env.CONVEX_URL, { logger: false });
      const publicUrl = await client.action(makeFunctionReference<"action">("serverStore:uploadImage"), { secret: process.env.STORE_SERVER_SECRET, data: Uint8Array.from(buffer).buffer, contentType });
      return NextResponse.json({ publicUrl });
    }
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE!);
    // Generate secure random filename
    const randomId = crypto.randomBytes(16).toString('hex');
    const ext = contentType.split('/')[1];
    const path = `categories/${randomId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from('category-images').getPublicUrl(path);
    return NextResponse.json({ publicUrl: data?.publicUrl || null });
  } catch (err: unknown) { return failure(err); }
}
