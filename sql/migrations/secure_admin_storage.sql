-- Apply deliberately in the intended Supabase project. The app uses server-side credentials.
begin;
create table if not exists public.admin_storage (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);
alter table public.admin_storage add column if not exists updated_at timestamptz default now();
update public.admin_storage set updated_at = now() where updated_at is null;
alter table public.admin_storage alter column updated_at set not null;
alter table public.admin_storage enable row level security;
revoke all on public.admin_storage from anon, authenticated;
grant all on public.admin_storage to service_role;

-- Retire direct browser access to the legacy customer/order tables, if they exist.
do $$
declare table_name text;
begin
  foreach table_name in array array['users', 'orders'] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on public.%I from anon, authenticated', table_name);
    end if;
  end loop;
end $$;
commit;
