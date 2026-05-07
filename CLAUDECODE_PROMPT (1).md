# 🚀 SHOPFLOW — CLAUDECODE MASTER PROMPT
### SaaS Multi-Tenant E-Commerce · Next.js 14 · Supabase · Vercel

---

## ⚠️ INSTRUCCIÓN CRÍTICA ANTES DE EMPEZAR

**TRABAJA EN LA CARPETA ACTUAL.** No crees ninguna subcarpeta nueva para el proyecto.
Ejecuta todos los comandos desde el directorio donde está este archivo.
El `package.json`, `app/`, `supabase/` y todo lo demás va directo aquí, en `.`

```bash
# Verificar que estás en el lugar correcto
pwd
ls -la  # Debes ver este archivo .md en el listado
```

---

## VISIÓN DEL PRODUCTO

**ShopFlow** es un SaaS donde **cualquier persona puede crear su propia tienda online en minutos**, sin saber programar. El flujo es:

1. Usuario entra a `shopflow.app` → se registra gratis
2. Completa onboarding (nombre tienda, categoría, logo)
3. Obtiene su tienda en `{su-slug}.shopflow.app` lista para vender
4. Carga productos manualmente o **importa desde Excel/CSV**
5. Comparte el link y empieza a recibir pedidos con pago Stripe

Verticales soportadas desde el inicio: electrónica, ropa, deportes, repuestos, hogar, alimentos, servicios, y cualquier otra.

---

## STACK TECNOLÓGICO

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 14 App Router + TypeScript | SSR/ISR, file-based routing, Vercel-native |
| Estilos | Tailwind CSS v3 + Shadcn/ui | Mobile-first, componentes accesibles |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) | BaaS completo, RLS nativo |
| Estado global | Zustand | Carrito, sesión tenant |
| Server state | TanStack Query v5 | Cache, revalidación, optimistic updates |
| Pagos | Stripe Checkout + Webhooks | Seguro, hosted, multi-currency |
| Email | Resend + React Email | Transaccional: confirmaciones, alertas |
| Excel/CSV import | SheetJS (xlsx) + Papa Parse | Carga masiva de productos |
| Deploy | Vercel | Wildcard domains, edge network |

---

## FASE 0 — ARCHIVOS DE CONTEXTO + SCAFFOLD

### 0.1 Crear CLAUDE.md (contexto permanente para Claude Code)

```bash
cat > CLAUDE.md << 'EOF'
# ShopFlow — Claude Code Context

## Stack
- Frontend: Next.js 14 App Router, TypeScript strict, Tailwind CSS v3, Shadcn/ui
- Backend: Supabase (Auth, Postgres, Storage, Realtime, Edge Functions)
- Deploy: Vercel con wildcard domains *.shopflow.app
- Estado: Zustand (carrito + tenant), TanStack Query (server state)
- Pagos: Stripe Checkout Sessions + Webhooks
- Email: Resend + React Email
- Import masivo: SheetJS (xlsx) + PapaParse (csv)
- Validación: Zod + React Hook Form

## Modelo de negocio multi-tenant
- Cualquier usuario puede registrarse y crear su tienda (self-service)
- Cada store tiene: slug único, subdominio propio, catálogo aislado
- Un solo proyecto Supabase con RLS aísla los datos por store_id
- Planes: Free (hasta 50 productos), Pro ($29/mes, ilimitado)
- Super-admin panel en /superadmin para gestionar todos los tenants

## Convenciones de código
- Rutas storefront público: app/(store)/
- Rutas panel del vendedor: app/(dashboard)/
- Rutas landing/auth/onboarding: app/(marketing)/
- Rutas super-admin: app/(superadmin)/
- Componentes: PascalCase · Hooks: use* · Utils: camelCase
- Commits: feat|fix|chore|docs|refactor(scope): descripción

## Reglas de desarrollo — SIEMPRE
1. Mobile-first en TODO. Testear mentalmente en 375px primero
2. Toda tabla Supabase DEBE tener RLS habilitado con políticas
3. next/image con sizes responsive en TODA imagen
4. Loading state en TODOS los botones async (disabled + spinner)
5. Error boundaries en cada page segment (error.tsx)
6. TypeScript strict: prohibido usar `any`
7. Después de cada fase: type-check → build → update memory.md → commit

## Checklist de fases
- [ ] FASE 0: Archivos contexto + scaffold
- [ ] FASE 1: Schema Supabase + RLS + seed
- [ ] FASE 2: Auth + Onboarding de nuevas tiendas
- [ ] FASE 3: Middleware multi-tenant
- [ ] FASE 4: Storefront público (catálogo, producto, carrito)
- [ ] FASE 5: Import Excel/CSV masivo de productos
- [ ] FASE 6: Checkout Stripe
- [ ] FASE 7: Dashboard del vendedor
- [ ] FASE 8: Super-admin panel
- [ ] FASE 9: SEO + Performance + PWA
- [ ] FASE 10: Deploy Vercel
EOF
```

### 0.2 Crear memory.md (estado vivo — actualizar después de cada sesión)

```bash
cat > memory.md << 'EOF'
# ShopFlow — Project Memory

## Estado actual
- Fase activa: 0 — Inicialización
- Última actualización: HOY
- Último commit: ninguno aún

## Decisiones técnicas
_(se documentan aquí a medida que se toman)_

## Problemas conocidos / blockers
_(ninguno aún)_

## Variables de entorno pendientes
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_DOMAIN=shopflow.app
NEXT_PUBLIC_APP_URL=https://shopflow.app
SUPERADMIN_EMAIL=admin@shopflow.app

## Próximos pasos inmediatos
1. Scaffold Next.js en carpeta actual
2. Configurar Supabase proyecto
3. Aplicar migrations SQL
4. Seed con tienda demo + productos electrónica
EOF
```

### 0.3 Crear README.md

```bash
cat > README.md << 'EOF'
# ShopFlow 🛒

SaaS multi-tenant de e-commerce. Cualquier persona crea su tienda en minutos.

## Para vendedores
1. Regístrate en shopflow.app
2. Nombra tu tienda y obtén {tu-slug}.shopflow.app
3. Carga productos (manual o importa desde Excel/CSV)
4. Comparte y vende con cobro vía Stripe

## Stack
Next.js 14 · Supabase · Stripe · Vercel · TypeScript · Tailwind

## Desarrollo local

```bash
cp .env.example .env.local
# Completar variables en .env.local

npm install
npx supabase start
npx supabase db push
npx supabase db seed
npm run dev
```

## Estructura
```
├── app/
│   ├── (marketing)/      # Landing, login, registro, onboarding
│   ├── (store)/          # Storefront público del tenant
│   ├── (dashboard)/      # Panel del vendedor
│   ├── (superadmin)/     # Panel maestro ShopFlow
│   └── api/              # Route handlers
├── components/
│   ├── store/            # Componentes storefront
│   ├── dashboard/        # Componentes panel vendedor
│   └── ui/               # Shadcn base components
├── lib/
│   ├── supabase/         # Clients server/client + helpers
│   ├── stripe/           # Stripe helpers
│   ├── excel/            # Parser Excel/CSV + generador plantilla
│   └── utils/
├── supabase/
│   ├── migrations/       # SQL migrations versionadas
│   └── seed.sql
├── CLAUDE.md
├── memory.md
└── README.md
```

## Multi-tenant
Cada tienda tiene slug único. En prod: `{slug}.shopflow.app`.
En dev: `localhost:3000?store={slug}`.

## Import masivo de productos
- Sube Excel (.xlsx) o CSV desde Dashboard → Productos → Importar
- Plantilla descargable con columnas predefinidas
- Validación fila por fila con reporte de errores
- Preview antes de confirmar la importación
EOF
```

### 0.4 Scaffold Next.js en carpeta actual

```bash
# Inicializar Next.js EN LA CARPETA ACTUAL (no crea subcarpeta)
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias="@/*" \
  --yes

# Dependencias core
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  zustand \
  @tanstack/react-query \
  stripe \
  @stripe/stripe-js \
  resend \
  react-email \
  @react-email/components \
  zod \
  react-hook-form \
  @hookform/resolvers \
  lucide-react \
  clsx \
  tailwind-merge \
  date-fns \
  sharp \
  xlsx \
  papaparse \
  @types/papaparse \
  recharts \
  react-dropzone \
  sonner

npm install -D supabase @types/node

# Shadcn/ui
npx shadcn-ui@latest init --yes --defaults
npx shadcn-ui@latest add \
  button card badge input label select textarea \
  toast skeleton dialog sheet drawer tabs separator \
  avatar dropdown-menu progress table alert \
  popover command tooltip switch radio-group \
  checkbox scroll-area

# .env.example
cat > .env.example << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_DOMAIN=shopflow.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPERADMIN_EMAIL=admin@shopflow.app
ENVEOF

cp .env.example .env.local

git add -A
git commit -m "chore(init): scaffold Next.js 14 + dependencias en carpeta raíz"
```

---

## FASE 1 — DATABASE SCHEMA SUPABASE

Crea `supabase/migrations/001_schema.sql`:

```sql
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
  contact       jsonb default '{}',   -- {email, phone, whatsapp, address}
  social        jsonb default '{}',   -- {instagram, facebook, tiktok}
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
  images          jsonb default '[]',  -- [{url,alt,sort_order,is_primary}]
  tags            text[] default '{}',
  attributes      jsonb default '{}',  -- {marca,color,talla,modelo,...}
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
-- IMPORT BATCHES (rastrear cargas masivas Excel/CSV)
-- ================================================================
create type import_status as enum ('pending','processing','completed','failed');

create table import_batches (
  id           uuid primary key default uuid_generate_v4(),
  store_id     uuid references stores(id) on delete cascade not null,
  filename     text not null,
  file_type    text not null,         -- 'xlsx' | 'csv'
  total_rows   int default 0,
  processed    int default 0,
  succeeded    int default 0,
  failed       int default 0,
  status       import_status default 'pending',
  errors       jsonb default '[]',    -- [{row,column,message}]
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
  items             jsonb not null,   -- snapshot: [{product_id,name,price,qty,image,variant}]
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
  created_at    timestamptz default now(),
  unique(store_id, upper(code))
);

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
```

### 1.2 Seed — TechHub + 20 productos electrónica

Crea `supabase/seed.sql` con la tienda demo TechHub que incluye:
- 8 categorías: Smartphones, Laptops, Audio, Tablets, Gaming, Accesorios, Cámaras, Smart Home
- 20 productos con imágenes Unsplash estables (`?w=800&q=80`), precio real, compare_price, stock variable, atributos específicos por categoría, tags relevantes, is_featured en los mejores productos

Productos a incluir (usa imágenes de `images.unsplash.com`):
- Smartphones: iPhone 15 Pro ($1199), Samsung S24 Ultra ($1099), Google Pixel 8 Pro ($899), Xiaomi 14 Ultra ($999)
- Laptops: MacBook Pro 14" M3 ($1999), Dell XPS 15 ($2199), ASUS ROG G14 ($1799)
- Audio: Sony WH-1000XM5 ($349), AirPods Pro 2 ($249), JBL Charge 5 ($179)
- Tablets: iPad Pro 12.9" M2 ($1099), Samsung Tab S9 Ultra ($999)
- Gaming: PS5 Slim ($449), Xbox Series X ($499)
- Accesorios: Anker 67W GaN ($45), Apple MagSafe ($39)
- Cámaras: Sony a7 IV ($2499), GoPro HERO12 ($399)
- Smart Home: Echo Show 10 ($249), Ring Doorbell Pro 2 ($249)

```bash
npx supabase init
npx supabase db push
npx supabase db seed --file supabase/seed.sql
git add supabase/
git commit -m "feat(db): schema multi-tenant + seed 20 productos electrónica + RLS completo"
```

---

## FASE 2 — AUTH + ONBOARDING SELF-SERVICE

### 2.1 Landing page `app/(marketing)/page.tsx`
- Hero: "Tu tienda online en 3 minutos" + CTA "Crear mi tienda gratis"
- Features: importa Excel, cobra con Stripe, subdominio propio, mobile-ready
- Planes Free vs Pro con tabla comparativa
- Vertical examples: electrónica, ropa, repuestos, deportes, etc.
- Footer con links

### 2.2 Auth pages
- `app/(marketing)/registro/page.tsx` — email+pass o Google OAuth → redirect `/onboarding`
- `app/(marketing)/login/page.tsx` — login estándar → redirect `/dashboard`

### 2.3 Onboarding wizard `app/(marketing)/onboarding/page.tsx`

4 pasos con barra de progreso:

**Paso 1 — Nombre de tu tienda**:
- Input nombre → auto-genera slug en tiempo real
- Preview live: `{slug}.shopflow.app`
- Validación slug único (debounced query Supabase)
- Dropdown vertical del negocio

**Paso 2 — Personalización**:
- Upload logo drag & drop → Supabase Storage
- 6 colores predefinidos + color picker libre
- Descripción corta

**Paso 3 — Contacto**:
- WhatsApp (importante LATAM), email, país, moneda

**Paso 4 — ¡Listo!**:
- Confetti 🎉
- URL de la tienda clickeable
- Botones: "Ver mi tienda" / "Ir al panel" / "Agregar productos"
- Al completar: crear fila en `stores`, marcar `onboarding_completed = true`

```bash
git add app/\(marketing\)/
git commit -m "feat(auth): landing SaaS + registro + login + onboarding wizard 4 pasos"
```

---

## FASE 3 — MIDDLEWARE MULTI-TENANT

`middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'shopflow.app'

  // Detectar tenant
  let storeSlug: string | null = null
  if (process.env.NODE_ENV === 'production') {
    const isSubdomain = hostname.endsWith(`.${appDomain}`) && !hostname.startsWith('www.')
    if (isSubdomain) storeSlug = hostname.replace(`.${appDomain}`, '')
  } else {
    storeSlug = request.nextUrl.searchParams.get('store') ||
                request.headers.get('x-store-slug') ||
                'techhub'
  }

  const requestHeaders = new Headers(request.headers)
  if (storeSlug) requestHeaders.set('x-store-slug', storeSlug)

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        get: (n) => request.cookies.get(n)?.value,
        set: (n, v, o) => response.cookies.set({ name: n, value: v, ...o }),
        remove: (n, o) => response.cookies.set({ name: n, value: '', ...o }),
    }}
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (pathname.startsWith('/dashboard') && !user)
    return NextResponse.redirect(new URL('/login', request.url))
  if (pathname.startsWith('/onboarding') && !user)
    return NextResponse.redirect(new URL('/registro', request.url))

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
}
```

También crear `lib/supabase/server.ts`, `lib/supabase/client.ts` y `lib/supabase/store-context.ts` con helper `getCurrentStore(slug)` cacheado 60s.

```bash
git add middleware.ts lib/supabase/
git commit -m "feat(middleware): multi-tenant routing + protección de rutas + auth"
```

---

## FASE 4 — STOREFRONT PÚBLICO (Mobile-First)

### Layout `app/(store)/layout.tsx`
- Lee store desde `headers().get('x-store-slug')`
- CSS variables dinámicas con colores del tema del tenant
- Header: logo + nombre + búsqueda + 🛒 badge + avatar
- Mobile: hamburger menu + barra búsqueda colapsable + carrito sticky bottom

### Páginas

**`app/(store)/page.tsx`** — Homepage:
- Hero con banner o gradiente temático + CTA
- Carrusel categorías (scroll horizontal snap en mobile)
- Grid "Destacados" (2 cols mobile / 4 desktop)
- Sección "Novedades"

**`app/(store)/productos/page.tsx`** — Catálogo:
- Mobile: barra [Filtros ⬆] [Ordenar ⬇] sticky, grid 2 cols, infinite scroll
- Desktop: sidebar 280px filtros + grid 3-4 cols
- Filtros: categoría, rango precio (slider), en stock, tags
- Sort: relevancia, precio asc/desc, novedad
- Búsqueda con debounce 300ms → full-text search Supabase

**`app/(store)/productos/[slug]/page.tsx`** — Producto:
- Mobile: galería swipeable + dots + botón "Agregar" STICKY fondo
- Desktop: split 60/40, galería con thumbnails, botón inline
- Badge % descuento, badge "Últimas unidades", badge "Agotado"
- Tabs: Descripción | Especificaciones | Envío
- Productos relacionados (misma categoría)

### Componentes clave

**`components/store/ProductCard.tsx`**: imagen lazy, badges de oferta/stock, botón agregar con loading + éxito ✓, precio con moneda del store

**`components/store/CartDrawer.tsx`**: Sheet lateral (desktop) / bottom drawer (mobile), item con imagen+nombre+qty controls+precio, subtotal, cupón input, botón pagar sticky, estado vacío

**`lib/store/cart.ts`** — Zustand con persist localStorage:
```typescript
// items, total, subtotal, count, coupon
// addItem, removeItem, updateQty, applyCoupon, clearCart
```

```bash
git add app/\(store\)/ components/store/ lib/store/
git commit -m "feat(storefront): catálogo + producto + carrito + búsqueda mobile-first"
```

---

## FASE 5 — IMPORTACIÓN MASIVA EXCEL/CSV ⭐

### 5.1 Plantilla descargable `lib/excel/template.ts`

Generar con SheetJS un `.xlsx` con:
- **Hoja "Productos"**: headers en español bold/color azul, filas de ejemplo, columnas ajustadas
- **Hoja "Instrucciones"**: guía paso a paso con capturas de columnas
- **Hoja "Categorías"**: lista de categorías actuales de la tienda (para referencia)

Columnas de la plantilla:
```
nombre*  |  descripcion  |  descripcion_corta  |  precio*  |  precio_tachado
stock*  |  sku  |  categoria  |  tags (separados por coma)
imagen_url  |  imagen_url_2  |  imagen_url_3
marca  |  modelo  |  peso_gramos  |  activo(SI/NO)  |  destacado(SI/NO)
```

### 5.2 Parser + validador `lib/excel/parser.ts`

```typescript
// parseFile(file: File): Promise<ParseResult>
// Detecta automáticamente xlsx vs csv
// Valida cada fila:
//   - nombre: requerido, max 200 chars
//   - precio: requerido, número positivo
//   - stock: requerido, entero >= 0
//   - precio_tachado: si existe, debe ser > precio
//   - imagen_url: formato URL válido si existe
//   - Detecta filas duplicadas por nombre/SKU dentro del batch
// Retorna: { rows, errors: [{row, column, message}], warnings, summary }
```

### 5.3 UI `app/(dashboard)/productos/importar/page.tsx`

5 pasos con stepper visual:

**Paso 1 — Seleccionar archivo**:
```
[📥 Descargar plantilla Excel]  [📥 Descargar plantilla CSV]

┌─────────────────────────────────────────┐
│  Arrastra tu archivo aquí               │
│  .xlsx, .xls, .csv — máximo 10MB       │
│  [Seleccionar archivo]                  │
└─────────────────────────────────────────┘
```

**Paso 2 — Validación** (auto-aparece tras parsear):
```
✅ 47 filas válidas   ❌ 3 con errores   ⚠️ 8 advertencias

Tabla preview con scroll:
Fila | Nombre         | Precio | Stock | Estado
 2   | iPhone 15 Pro  | 1199   |  25   | ✅ Válido
 5   | (vacío)        | -      |  10   | ❌ Nombre requerido
 8   | Laptop X       | -999   |   5   | ❌ Precio inválido

Detalle de errores expandible
```

**Paso 3 — Confirmar**:
```
Se importarán 47 productos · Se omitirán 3 filas con errores
[Cancelar]  [Importar 47 productos →]
```

**Paso 4 — Progreso en tiempo real**:
```
Importando... 23 / 47
████████████░░░░░░░  49%
✅ iPhone 15 Pro
✅ Samsung S24 Ultra
⏳ MacBook Pro M3...
```

**Paso 5 — Resultado**:
```
🎉 ¡Importación completada!
✅ 47 productos importados   ❌ 0 errores
[Ver mis productos] [Importar otro archivo]
```

### 5.4 API `app/api/import/products/route.ts`
- Verificar límite del plan (free: max 50 productos total en la tienda)
- `supabase.from('products').upsert()` en batches de 50 para no timeout
- Crear categorías automáticamente si no existen
- Registrar resultado en `import_batches`
- Responder con streaming de progreso o endpoint de polling

```bash
git add app/\(dashboard\)/productos/importar/ lib/excel/ app/api/import/
git commit -m "feat(import): Excel/CSV upload con plantilla, validación, preview y progreso"
```

---

## FASE 6 — CHECKOUT STRIPE

**`app/(store)/checkout/page.tsx`**:
- Resumen pedido (readonly)
- Form: email, nombre, teléfono, dirección envío (react-hook-form + zod)
- Input cupón con validación live
- Totales: subtotal + envío + descuento + total
- Botón "Pagar {moneda}{total}" → POST /api/checkout

**`app/api/checkout/route.ts`**:
```typescript
// 1. Validar stock actual en BD (no confiar en el cliente)
// 2. Calcular totales con descuentos reales
// 3. Crear Stripe Checkout Session:
//    line_items, metadata: {store_id, coupon_code}
//    success_url: /checkout/exito?session_id={CHECKOUT_SESSION_ID}
//    cancel_url: /carrito
// 4. Return { url }
```

**`app/api/webhooks/stripe/route.ts`**:
```typescript
// Verificar firma Stripe (raw body)
// checkout.session.completed:
//   → Crear order en Supabase
//   → Descontar stock (transaction)
//   → Email confirmación comprador (Resend)
//   → Email notificación vendedor
//   → Incrementar stores.orders_count + revenue_total
```

**`app/(store)/checkout/exito/page.tsx`**: confetti, número de orden, CTA seguir comprando

```bash
git add app/\(store\)/checkout/ app/api/checkout/ app/api/webhooks/
git commit -m "feat(checkout): Stripe session + webhooks + stock update + emails"
```

---

## FASE 7 — DASHBOARD DEL VENDEDOR

**`app/(dashboard)/layout.tsx`**:
- Sidebar desktop (colapsable): Inicio · Productos · Importar · Pedidos · Clientes · Cupones · Configuración
- Mobile: bottom navigation bar con iconos
- Header: nombre tienda + plan badge + "Ver tienda ↗" + avatar

**`app/(dashboard)/page.tsx`** — Overview:
- Cards métricas: ventas hoy, pedidos pendientes, productos activos, visitantes
- Gráfico ventas 30 días (Recharts LineChart, responsive container)
- Últimos 5 pedidos con status badge
- Alertas stock bajo
- Quick actions: + Producto, 📥 Importar, Ver tienda

**`app/(dashboard)/productos/page.tsx`**:
- Tabla: imagen thumb + nombre + precio + stock + status + categoría + acciones
- Búsqueda, filtro activo/inactivo, filtro stock bajo
- Bulk select + bulk actions (activar, desactivar, eliminar, exportar CSV)
- Botones header: [+ Nuevo] [📥 Importar Excel]
- Export CSV de productos actuales

**`app/(dashboard)/productos/nuevo/page.tsx`** y **`/[id]/page.tsx`**:
- Tabs: General | Imágenes | Inventario | SEO
- General: nombre, slug (auto + editable), descripción, precio, precio tachado, costo, categoría, tags, destacado, activo
- Imágenes: dropzone multi-imagen → Supabase Storage, reordenar arrastrando, seleccionar principal
- Inventario: stock, SKU, barcode, peso, alerta bajo stock
- SEO: meta título, meta desc, preview de cómo se ve en Google y WhatsApp

**`app/(dashboard)/pedidos/page.tsx`**:
- Tabs: Todos | Pendientes | Confirmados | Enviados | Entregados | Cancelados
- Modal detalle: cliente, items, dirección, totales, timeline
- Cambiar status + nota interna
- Número de tracking
- Imprimir/PDF

**`app/(dashboard)/configuracion/page.tsx`**:
- Tabs: Tienda | Tema | Pagos | Envíos | Plan | Peligro
- Tienda: nombre, desc, logo, banner, contacto, social
- Tema: colores, fuente (preview live)
- Plan: plan actual + botón upgrade

```bash
git add app/\(dashboard\)/
git commit -m "feat(dashboard): panel vendedor completo + métricas + CRUD productos + pedidos"
```

---

## FASE 8 — SUPER-ADMIN PANEL

`app/(superadmin)/` — Solo accesible si `user.email === process.env.SUPERADMIN_EMAIL`

- Lista todos los stores con: slug, owner, plan, productos, pedidos, revenue, fecha creación
- Filtrar por plan, activo/inactivo, fecha
- Ver detalle de cualquier store
- Cambiar plan de un store
- Activar/desactivar store
- Logs de imports recientes
- Métricas globales: MRR, stores activos, productos totales

```bash
git add app/\(superadmin\)/
git commit -m "feat(superadmin): panel maestro con gestión de tenants y métricas globales"
```

---

## FASE 9 — SEO + PERFORMANCE + PWA

**SEO dinámico**:
- `generateMetadata()` en cada page con datos reales del store/producto
- `app/(store)/productos/[slug]/opengraph-image.tsx` — imagen OG dinámica
- `app/sitemap.ts` — sitemap por tenant
- `app/robots.ts`
- JSON-LD schema `Product` en página de producto

**Performance**:
- `loading.tsx` con Skeleton en cada segmento de ruta
- `error.tsx` con botón Reintentar
- `not-found.tsx` con buscador
- ISR: catálogo `revalidate = 60`, homepage `revalidate = 300`
- Lazy load recharts en dashboard

**PWA**:
- `public/manifest.json` con nombre, iconos, theme_color del tenant
- Service worker para cache de assets estáticos

```bash
git add app/ public/
git commit -m "feat(seo): metadata + sitemap + OG images + JSON-LD + PWA + performance"
```

---

## FASE 10 — DEPLOY VERCEL

```bash
npm i -g vercel
vercel login
vercel link

# Agregar todas las env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add NEXT_PUBLIC_APP_DOMAIN production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add SUPERADMIN_EMAIL production

cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
EOF

vercel --prod

# En Vercel Dashboard:
# - Agregar dominio shopflow.app
# - Agregar wildcard *.shopflow.app
# En Stripe Dashboard:
# - Webhook: https://shopflow.app/api/webhooks/stripe
# - Events: checkout.session.completed, payment_intent.payment_failed

git add vercel.json
git commit -m "chore(deploy): vercel config + env + wildcard domains"
git tag v1.0.0
git push origin main --tags
```

---

## REGLAS PARA CLAUDE CODE — APLICAR SIEMPRE

### ✅ Al terminar cada FASE:
```bash
npm run type-check          # Sin errores TypeScript
npm run build               # Build exitoso

# Actualizar memory.md:
# - Marcar fase completada
# - Decisiones técnicas tomadas
# - Problemas y soluciones
# - Próximos pasos exactos

# Actualizar CLAUDE.md: marcar checkbox de la fase

git add -A
git commit -m "feat(faseN): descripción concisa

- detalle 1
- detalle 2"
```

### ❌ Prohibido:
- Crear subcarpeta del proyecto (usar carpeta actual `.`)
- Usar `any` en TypeScript
- Tabla Supabase sin RLS
- `<img>` en lugar de `next/image`
- Botones async sin loading state
- Olvidar actualizar `memory.md` antes de cada commit

### 🚨 Si hay error bloqueante:
1. Anotar en `memory.md` → "Problemas conocidos"
2. Intentar resolver en contexto actual
3. Si es decisión arquitectural: escribir opciones en `memory.md`, elegir la mejor, documentar por qué
4. Continuar con tarea no bloqueada

---

## ORDEN DE EJECUCIÓN INMEDIATA

```
FASE 0 → FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5 → FASE 6 → FASE 7 → FASE 8 → FASE 9 → FASE 10
```

**¡Empezar YA con Fase 0.1 — crear CLAUDE.md en la carpeta actual!** 🚀
