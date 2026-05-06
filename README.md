# ShopFlow

SaaS multi-tenant de e-commerce. Cualquier persona crea su tienda online en minutos, con su propio subdominio, catálogo, carrito y cobro vía Stripe.

---

## Módulos y funcionalidades

### Marketing / Acceso público
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con hero, features, precios y testimonios |
| `/registro` | Crear cuenta (email/password + Google OAuth) |
| `/login` | Iniciar sesión |
| `/onboarding` | Wizard 4 pasos: nombre tienda, colores, contacto, ¡listo! |

### Storefront público `{slug}.shopflow.app`
| Ruta | Descripción |
|------|-------------|
| `/` | Portada de la tienda con banner y productos destacados |
| `/productos` | Catálogo con búsqueda full-text, filtros por categoría, precio, stock y orden |
| `/productos/[slug]` | Detalle de producto con imágenes, descripción, stock y botón agregar al carrito |
| `/checkout` | Formulario de datos del cliente + resumen del carrito + cupón de descuento |
| `/checkout/exito` | Confirmación de pedido post-pago |

### Dashboard del vendedor `/dashboard`
| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Panel principal: métricas del día, pedidos recientes, alertas de stock bajo |
| `/dashboard/productos` | Lista de productos con búsqueda, estado y acciones |
| `/dashboard/productos/nuevo` | Crear producto con form completo (nombre, precio, stock, imágenes, categoría, tags) |
| `/dashboard/productos/[id]` | Editar producto existente |
| `/dashboard/productos/importar` | Import masivo desde Excel/CSV con preview y validación |
| `/dashboard/pedidos` | Lista de pedidos filtrable por estado (pendiente, enviado, entregado, etc.) |
| `/dashboard/clientes` | Lista de clientes con total gastado y número de pedidos |
| `/dashboard/cupones` | Lista de cupones de descuento (% off, monto fijo, envío gratis) |
| `/dashboard/configuracion` | Editar nombre, descripción, colores, dominio, contacto y ajustes de tienda |

### Super-Admin `/superadmin`
| Ruta | Descripción |
|------|-------------|
| `/superadmin` | Panel maestro: tiendas activas, MRR estimado, revenue total, productos totales |

### API Routes
| Endpoint | Descripción |
|----------|-------------|
| `POST /api/checkout` | Crear Stripe Checkout Session con validación de stock |
| `POST /api/webhooks/stripe` | Webhook Stripe: crea pedido en BD al completarse el pago |
| `POST /api/import/products` | Procesa archivo Excel/CSV y crea productos masivamente |
| `POST /api/coupons/validate` | Valida cupón (activo, no vencido, con usos disponibles) |

### SEO + PWA
- `/robots.txt` — dinámico por dominio (store vs marketing)
- `/sitemap.xml` — dinámico: productos + categorías por tienda
- `/manifest.webmanifest` — PWA manifest con nombre/color por tienda
- Open Graph images generadas dinámicamente con `ImageResponse`
- Favicon e Apple icon generados en runtime

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 App Router + TypeScript strict |
| Estilos | Tailwind CSS v3 + Shadcn/ui (@base-ui/react) |
| Base de datos | Supabase (Postgres + Auth + Storage + RLS) |
| Estado cliente | Zustand (carrito) |
| Formularios | React Hook Form + Zod |
| Pagos | Stripe Checkout Sessions + Webhooks |
| Import masivo | SheetJS (xlsx) + PapaParse (csv) |
| Gráficos | Recharts |
| Emails | Resend + React Email |
| Deploy | Vercel + wildcard domains `*.shopflow.app` |

---

## Modelo multi-tenant

- Un solo proyecto Supabase — cada fila en `stores` es un tenant
- RLS aísla datos por `store_id` en todas las tablas
- En producción: subdominio `{slug}.shopflow.app` (detectado en middleware)
- En desarrollo: query param `?store={slug}` o header `x-store-slug`

### Planes
| Plan | Precio | Productos | Imágenes/producto |
|------|--------|-----------|-------------------|
| Free | Gratis | Hasta 50 | 3 |
| Pro | $29/mes | Ilimitados | 10 |
| Enterprise | $99/mes | Ilimitados | 20 |

---

## Desarrollo local

### 1. Variables de entorno

```bash
cp .env.example .env.local
```

Completar en `.env.local`:

```env
# ─── SUPABASE ─────────────────────────────────────────────────────
# supabase.com → tu proyecto → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ─── STRIPE ───────────────────────────────────────────────────────
# dashboard.stripe.com → Developers → API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# dashboard.stripe.com → Developers → Webhooks → signing secret
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── RESEND ───────────────────────────────────────────────────────
# resend.com → API Keys → Create API Key
RESEND_API_KEY=re_...

# ─── APP ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email con acceso a /superadmin
SUPERADMIN_EMAIL=admin@shopflow.app
```

| Variable | Dónde conseguirla |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → proyecto → **Settings → API → Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → proyecto → **Settings → API → anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com → proyecto → **Settings → API → service_role** ⚠️ nunca exponerla al cliente |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com → **Developers → API keys → Publishable key** |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → **Developers → API keys → Secret key** |
| `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → **Developers → Webhooks → Add endpoint → signing secret** |
| `RESEND_API_KEY` | resend.com → **API Keys → Create API Key** |
| `NEXT_PUBLIC_APP_DOMAIN` | Tu dominio en producción (`shopflow.app`) o `localhost:3000` en local |
| `NEXT_PUBLIC_APP_URL` | URL completa con protocolo (`https://shopflow.app` en prod) |
| `SUPERADMIN_EMAIL` | Email del usuario que accede a `/superadmin` |

### 2. Supabase — ejecutar SQL

Tienes dos opciones:

#### Opción A — SQL Editor en supabase.com (recomendado para empezar rápido)

1. Abre tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor**
2. Ejecuta primero el schema:
   - Abre `supabase/migrations/001_schema.sql`
   - Pega el contenido completo → **Run**
3. Ejecuta el seed (tienda demo TechHub + 20 productos):
   - Abre `supabase/seed.sql`
   - **Antes de pegar**: crea un usuario en **Authentication → Users → Invite user** con el email que quieras
   - Copia el `UUID` del usuario recién creado
   - Reemplaza `00000000-0000-0000-0000-000000000001` por ese UUID en la primera línea del seed
   - Pega el contenido completo → **Run**

#### Opción B — Supabase CLI (desarrollo local)

```bash
npx supabase start
npx supabase db push          # aplica migrations/001_schema.sql
npx supabase db seed          # crea tienda TechHub + 20 productos demo
```

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Acceder a la tienda demo

Abre [http://localhost:3000?store=techhub](http://localhost:3000?store=techhub)

---

## Usuario de prueba (seed)

El `seed.sql` crea la tienda **TechHub** con 20 productos de electrónica.

Para probar el dashboard, primero crea un usuario en Supabase Auth y luego asígnale el `owner_id` del seed, **o** simplemente regístrate en `/registro` y completa el onboarding para crear tu propia tienda.

### Tienda demo — TechHub
| Campo | Valor |
|-------|-------|
| URL local | `http://localhost:3000?store=techhub` |
| Slug | `techhub` |
| Email contacto | `hola@techhub.pe` |
| WhatsApp | `+51 999 123 456` |
| Moneda | USD |
| Productos | 20 (smartphones, laptops, audio, tablets, gaming, accesorios, cámaras, smarthome) |

### Super-Admin
| Campo | Valor |
|-------|-------|
| URL | `/superadmin` |
| Email requerido | El valor de `SUPERADMIN_EMAIL` en `.env.local` |

### Tarjeta Stripe (modo test)
| Campo | Valor |
|-------|-------|
| Número | `4242 4242 4242 4242` |
| Vencimiento | Cualquier fecha futura |
| CVV | `123` |
| CP | `12345` |

---

## Estructura del proyecto

```
├── app/
│   ├── (marketing)/          # Landing, login, registro, onboarding
│   ├── (store)/              # Storefront público del tenant
│   │   ├── productos/        # Catálogo y detalle de producto
│   │   └── checkout/         # Checkout y confirmación
│   ├── (dashboard)/          # Panel del vendedor
│   │   └── dashboard/        # → URLs /dashboard/*
│   ├── (superadmin)/         # Panel maestro ShopFlow
│   │   └── superadmin/       # → URL /superadmin
│   ├── api/                  # Route handlers (checkout, webhooks, import, coupons)
│   ├── icon.tsx              # Favicon generado dinámicamente
│   ├── apple-icon.tsx        # Apple touch icon
│   ├── opengraph-image.tsx   # OG image marketing
│   ├── robots.ts             # robots.txt dinámico
│   ├── sitemap.ts            # Sitemap dinámico por store
│   └── manifest.ts           # PWA manifest dinámico por store
├── components/
│   ├── store/                # StorePage, ProductCard, ProductDetail, CartDrawer, StoreHeader, ProductFilters
│   ├── dashboard/            # DashboardSidebar, ProductForm, StoreConfigForm
│   ├── marketing/            # LandingPage
│   └── ui/                   # Shadcn base components
├── lib/
│   ├── supabase/             # client.ts, server.ts, store-context.ts
│   ├── store/                # cart.ts (Zustand)
│   ├── excel/                # parser.ts, template.ts
│   └── utils/                # types.ts, cn.ts
├── supabase/
│   ├── migrations/           # 001_schema.sql (todas las tablas + RLS + índices)
│   └── seed.sql              # TechHub demo store + 20 productos
├── middleware.ts             # Multi-tenant routing + auth guards
├── CLAUDE.md                 # Contexto para Claude Code
├── memory.md                 # Estado del proyecto
└── vercel.json               # Config deploy
```

---

## Schema de base de datos

Tablas principales (todas con RLS habilitado):

| Tabla | Descripción |
|-------|-------------|
| `plans` | Planes de suscripción (free, pro, enterprise) |
| `stores` | Un row por tenant — slug, tema, contacto, métricas |
| `categories` | Categorías por tienda (soporte jerárquico) |
| `products` | Catálogo con búsqueda full-text (`tsvector`) |
| `orders` | Pedidos con estado, items JSON, datos de envío |
| `customers` | Clientes con historial de compras |
| `coupons` | Cupones de descuento (%, monto fijo, envío gratis) |
| `import_batches` | Historial de importaciones masivas |

---

## Repositorio

```
https://github.com/chris2009/Carrito_Compras
```

## Deploy en Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variables de entorno (ver `.env.example`)
3. Configurar wildcard domain `*.shopflow.app` en Vercel → DNS
4. Aplicar migration en Supabase producción: `supabase db push --linked`
5. Configurar Stripe webhook: `https://shopflow.app/api/webhooks/stripe`
6. Evento webhook requerido: `checkout.session.completed`
