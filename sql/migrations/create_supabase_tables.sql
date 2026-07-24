-- Supabase / Postgres schema for minimal ecommerce persistence

-- products table
create table if not exists products (
  id text primary key,
  name text not null,
  category text,
  price numeric,
  original_price numeric,
  image text,
  description text,
  sizes jsonb,
  variants jsonb,
  featured boolean default false,
  in_stock boolean default true,
  discount_enabled boolean default false,
  new_arrival boolean default false,
  best_seller boolean default false,
  trending boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_featured on products(featured);

-- orders table
create table if not exists orders (
  id text primary key,
  customer jsonb,
  items jsonb,
  total numeric,
  status text default 'pending',
  payment_method text,
  created_at timestamptz default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);

-- users table (simple copy of accounts)
create table if not exists users (
  id text primary key,
  name text,
  email text unique,
  phone text,
  address text,
  city text,
  metadata jsonb,
  created_at timestamptz default now()
);
