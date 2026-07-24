import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json([]);
    }
    
    const { data, error } = await supabase.from('users').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ inserted: 0, fallback: true, message: 'Supabase not configured. Data was not persisted remotely.' });
    }
    
    const body = await req.json();
    const { data, error } = await supabase.from('users').insert(body instanceof Array ? body : [body]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inserted: (data as any)?.length ?? 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save users' }, { status: 500 });
  }
}
