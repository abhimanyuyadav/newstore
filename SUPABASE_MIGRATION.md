# Supabase migration guide

1) Create tables
- Open your Supabase project, go to SQL Editor, and run the SQL in `sql/migrations/create_supabase_tables.sql`.

2) Browser migration (quick)
- Open the site in the admin browser where your `localStorage` contains app data.
- Visit `/admin/migrate` and click `Run Migration`. The page will POST data to the server API.

3) CLI migration (server-side, recommended for large datasets)
- Prepare JSON files (export from your source): `data/products.json`, `data/orders.json`, `data/users.json`.
- Set env vars and run the script with a service role key (server only):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co NEXT_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/migrate-to-supabase.js
```

Notes:
- The CLI script uses the Supabase service role key — keep it secret and run only on trusted servers.
- After migration, verify data in the Supabase dashboard.
- Consider adding constraints / indices depending on your needs.
