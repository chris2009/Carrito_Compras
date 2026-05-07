-- ================================================================
-- SHOPFLOW — SCHEMA COMPLETO MULTI-TENANT
-- ================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- ================================================================
-- PLANES DE SUSCRIPCIÓN
-- ================================================================
create table plans (
  id           text primary key,
  name         text not null,
  price_usd    numeric(10,2) default 0,
  max_products int default 50,        -- -1 = ilimitado
  max_images   int default 3,
  features     jsonb default '[]',
  is_active    boolean default true
);

insert into plans values
  ('free',       'Free',        0,    50, 3,  '["Tienda básica","Stripe checkout","Import CSV 50 filas"]'),
  ('pro',        'Pro',        29,    -1, 10, '["Productos ilimitados","Import Excel ilimitado","Analytics","Dominio custom","Soporte prioritario"]'),
  ('enterprise', 'Enterprise', 99,    -1, 20, '["Todo Pro","Multi-usuario","API","SLA 99.9%"]');

-- ================================================================
-- STORES (un row por tenant/vendedor)
-- ================================================================
create table stores (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid references auth.users(id) on delete cascade not null,
  plan_id       text references plans(id) default 'free',
  slug          text unique not null
                  check (slug ~ '^[a-z0-9][a-z0-9\-]{2,30}[a-z0-9]$'),
  name          text not null,
  description   text,
  logo_url      text,
  banner_url    text,
  custom_domain text unique,
  currency      text default 'USD',
  locale        text default 'es',
  country       text default 'PE',
  theme         jsonb default '{"primary":"#6366f1","secondary":"#06b6d4","accent":"#f59e0b","font":"inter"}',
  contact       jsonb default '{}',
  social        jsonb default '{}',
  settings      jsonb default '{"allow_guest_checkout":true,"show_stock":true,"low_stock_threshold":5,"shipping_enabled":true,"tax_rate":0}',
  is_active     boolean default true,
  onboarding_completed boolean default false,
  products_count int default 0,
  orders_count   int default 0,
  revenue_total  numeric(12,2) default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ================================================================
-- CATEGORIES
-- ================================================================
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  store_id    uuid references stores(id) on delete cascade not null,
  parent_id   uuid references categories(id) on delete set null,
  name        text not null,
  slug        text not null,
  image_url   text,
  description text,
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  unique(store_id, slug)
);

-- ================================================================
-- PRODUCTS
-- ================================================================
create table products (
  id              uuid primary key default uuid_generate_v4(),
  store_id        uuid references stores(id) on delete cascade not null,
  category_id     uuid references categories(id) on delete set null,
  name            text not null,
  slug            text not null,
  description     text,
  short_desc      text,
  price           numeric(10,2) not null check (price >= 0),
  compare_price   numeric(10,2) check (compare_price >= 0),
  cost_price      numeric(10,2) check (cost_price >= 0),
  sku             text,
  barcode         text,
  weight_grams    int,
  images          jsonb default '[]',
  tags            text[] default '{}',
  attributes      jsonb default '{}',
  is_active       boolean default true,
  is_featured     boolean default false,
  stock           int default 0 check (stock >= 0),
  low_stock_alert int default 5,
  import_batch_id uuid,
  search_vector   tsvector,
  view_count      int default 0,
  sale_count      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(store_id, slug)
);

create index products_store_idx    on products(store_id, is_active);
create index products_category_idx on products(category_id);
create index products_featured_idx on products(store_id, is_featured) where is_featured = true;
create index products_search_idx   on products using gin(search_vector);
create index products_tags_idx     on products using gin(tags);

create or replace function products_search_update() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(new.name,''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(new.short_desc,''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(new.description,''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(array_to_string(new.tags,' '))), 'D');
  return new;
end $$ language plpgsql;

create trigger products_search_trigger
  before insert or update on products
  for each row execute function products_search_update();

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

create trigger stores_updated_at   before update on stores   for each row execute function set_updated_at();
create trigger products_updated_at before update on products for each row execute function set_updated_at();

-- ================================================================
-- IMPORT BATCHES
-- ================================================================
create type import_status as enum ('pending','processing','completed','failed');

create table import_batches (
  id           uuid primary key default uuid_generate_v4(),
  store_id     uuid references stores(id) on delete cascade not null,
  filename     text not null,
  file_type    text not null,
  total_rows   int default 0,
  processed    int default 0,
  succeeded    int default 0,
  failed       int default 0,
  status       import_status default 'pending',
  errors       jsonb default '[]',
  created_by   uuid references auth.users(id),
  completed_at timestamptz,
  created_at   timestamptz default now()
);

-- ================================================================
-- CUSTOMERS
-- ================================================================
create table customers (
  id           uuid primary key references auth.users(id) on delete cascade,
  store_id     uuid references stores(id) on delete cascade not null,
  first_name   text,
  last_name    text,
  phone        text,
  avatar_url   text,
  addresses    jsonb default '[]',
  total_orders int default 0,
  total_spent  numeric(12,2) default 0,
  created_at   timestamptz default now(),
  unique(id, store_id)
);

-- ================================================================
-- ORDERS
-- ================================================================
create type order_status as enum (
  'pending','confirmed','processing','shipped','delivered','cancelled','refunded'
);

create table orders (
  id                uuid primary key default uuid_generate_v4(),
  store_id          uuid references stores(id) on delete cascade not null,
  customer_id       uuid references auth.users(id) on delete set null,
  order_number      text unique not null,
  status            order_status default 'pending',
  items             jsonb not null,
  subtotal          numeric(10,2) not null,
  discount_code     text,
  discount_amount   numeric(10,2) default 0,
  shipping_cost     numeric(10,2) default 0,
  tax_amount        numeric(10,2) default 0,
  total             numeric(10,2) not null,
  currency          text default 'USD',
  shipping_addr     jsonb,
  customer_email    text,
  customer_phone    text,
  notes             text,
  stripe_session_id text,
  stripe_payment_id text,
  fulfillment_data  jsonb default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create sequence order_seq start 1000;
create function generate_order_number() returns trigger as $$
begin
  new.order_number := 'ORD-' || lpad(nextval('order_seq')::text, 6, '0');
  return new;
end $$ language plpgsql;
create trigger orders_number_trigger
  before insert on orders for each row execute function generate_order_number();
create trigger orders_updated_at
  before update on orders for each row execute function set_updated_at();

-- ================================================================
-- COUPONS
-- ================================================================
create type discount_type as enum ('percentage','fixed_amount','free_shipping');

create table coupons (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid references stores(id) on delete cascade not null,
  code          text not null,
  discount_type discount_type not null,
  value         numeric(10,2) not null,
  min_purchase  numeric(10,2) default 0,
  max_uses      int,
  uses_count    int default 0,
  expires_at    timestamptz,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Unique index case-insensitive: un código por tienda sin importar mayúsculas
create unique index coupons_store_code_idx on coupons(store_id, upper(code));

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table stores         enable row level security;
alter table categories     enable row level security;
alter table products       enable row level security;
alter table import_batches enable row level security;
alter table customers      enable row level security;
alter table orders         enable row level security;
alter table coupons        enable row level security;

create or replace function is_store_owner(p_store_id uuid) returns boolean as $$
  select exists (select 1 from stores where id = p_store_id and owner_id = auth.uid());
$$ language sql security definer;

-- Stores
create policy "owner_all"   on stores for all    using (owner_id = auth.uid());
create policy "public_read" on stores for select using (is_active = true);

-- Categories
create policy "owner_all"   on categories for all    using (is_store_owner(store_id));
create policy "public_read" on categories for select using (is_active = true);

-- Products
create policy "owner_all"   on products for all    using (is_store_owner(store_id));
create policy "public_read" on products for select using (is_active = true);

-- Import batches
create policy "owner_all"   on import_batches for all using (is_store_owner(store_id));

-- Orders
create policy "owner_all"    on orders for all    using (is_store_owner(store_id));
create policy "customer_own" on orders for select using (customer_id = auth.uid());
create policy "customer_ins" on orders for insert with check (customer_email is not null);

-- Customers
create policy "self_all"   on customers for all    using (id = auth.uid());
create policy "owner_read" on customers for select using (is_store_owner(store_id));

-- Coupons
create policy "owner_all"   on coupons for all    using (is_store_owner(store_id));
create policy "public_read" on coupons for select using (is_active = true);

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('store-assets',   'store-assets',   true),
  ('import-files',   'import-files',   false);

create policy "owner_upload" on storage.objects for insert
  with check (bucket_id in ('product-images','store-assets') and auth.uid() is not null);
create policy "public_read"  on storage.objects for select
  using (bucket_id in ('product-images','store-assets'));
