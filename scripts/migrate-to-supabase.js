#!/usr/bin/env node
/**
 * CLI migration script to push JSON files from `data/` to Supabase using a service role key.
 * Usage: NODE_ENV=production NEXT_PUBLIC_SUPABASE_URL=... NEXT_SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.js
 * Expects files: data/products.json, data/orders.json, data/users.json
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function readJson(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function upsertProducts(products) {
  if (!products || !products.length) return { inserted: 0 };
  const { data, error } = await supabase.from('products').upsert(products);
  if (error) throw error;
  return { inserted: data?.length ?? 0 };
}

async function insertOrders(orders) {
  if (!orders || !orders.length) return { inserted: 0 };
  const { data, error } = await supabase.from('orders').insert(orders);
  if (error) throw error;
  return { inserted: data?.length ?? 0 };
}

async function insertUsers(users) {
  if (!users || !users.length) return { inserted: 0 };
  const { data, error } = await supabase.from('users').insert(users);
  if (error) throw error;
  return { inserted: data?.length ?? 0 };
}

(async function main(){
  try {
    const products = readJson('data/products.json');
    const orders = readJson('data/orders.json');
    const users = readJson('data/users.json');

    if (products) {
      const res = await upsertProducts(products);
      console.log('Products:', res);
    } else console.log('No data/products.json found');

    if (orders) {
      const res = await insertOrders(orders);
      console.log('Orders:', res);
    } else console.log('No data/orders.json found');

    if (users) {
      const res = await insertUsers(users);
      console.log('Users:', res);
    } else console.log('No data/users.json found');

    console.log('Migration complete');
  } catch (err) {
    console.error('Migration error', err.message || err);
    process.exit(2);
  }
})();
