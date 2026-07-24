import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileData } = body || {};
    if (!fileName || !fileData) return NextResponse.json({ error: 'Missing fileName or fileData' }, { status: 400 });

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    const match = /^data:(.+);base64,(.+)$/.exec(fileData);
    if (!match) return NextResponse.json({ error: 'Invalid fileData' }, { status: 400 });
    const contentType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    // Enforce size limit (2MB) and allowed content types
    const maxSize = 2 * 1024 * 1024;
    if (buffer.length > maxSize) return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(contentType)) return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });

    const ext = (fileName.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
    const id = `prod-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const path = `products/${id}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return NextResponse.json({ publicUrl: data?.publicUrl || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
