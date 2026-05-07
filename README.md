# ShopFlow — Plataforma Multi-Tenant de Tiendas Online

> Elaborada por **Sherlock** · Powered by ShopFlow

---

## ¿Qué es ShopFlow?

ShopFlow es una plataforma SaaS (Software as a Service) que permite a cualquier persona crear su propia tienda online en minutos, sin saber programar. Funciona como un "Shopify propio": tú eres el dueño de la plataforma y tus clientes son los vendedores que crean sus tiendas.

**URL de producción:** https://carrito-compras-lemon.vercel.app  
**Repositorio:** https://github.com/chris2009/Carrito_Compras

---

## Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / USUARIOS                            │
└───────────────┬──────────────────┬──────────────────┬───────────────────┘
                │                  │                  │
        Comprador             Vendedor           Super Admin
   (sin cuenta)          (dueño de tienda)    (dueño plataforma)
                │                  │                  │
                ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            VERCEL (CDN + Edge)                          │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    NEXT.JS 14 APP ROUTER                        │   │
│   │                                                                 │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│   │  │  (marketing) │  │   (store)    │  │     (dashboard)      │  │   │
│   │  │  /login      │  │  /productos  │  │  /dashboard          │  │   │
│   │  │  /registro   │  │  /checkout   │  │  /dashboard/produc.  │  │   │
│   │  │  /onboarding │  │  /?store=x   │  │  /dashboard/pedidos  │  │   │
│   │  └──────────────┘  └──────────────┘  │  /dashboard/config   │  │   │
│   │                                       └──────────────────────┘  │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │                  (superadmin)                             │   │   │
│   │  │  /superadmin  →  ve todas las tiendas (service role)     │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   │                                                                 │   │
│   │  ┌──────────────────────────────────────────────────────────┐   │   │
│   │  │                    API ROUTES                             │   │   │
│   │  │  POST /api/checkout          → crea sesión Stripe        │   │   │
│   │  │  POST /api/webhooks/stripe   → confirma pago             │   │   │
│   │  │  POST /api/import/products   → importa Excel/CSV         │   │   │
│   │  │  POST /api/coupons/validate  → valida cupón              │   │   │
│   │  └──────────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌────────────────────┐    ┌──────────────────────────────────────┐   │
│   │    MIDDLEWARE       │    │         ESTADO EN CLIENTE             │   │
│   │  Detecta el slug    │    │  Zustand  → carrito de compras       │   │
│   │  de la tienda por   │    │  next-themes → dark/light mode       │   │
│   │  subdominio o ?store│    │  TanStack Query → server state       │   │
│   └────────────────────┘    └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │                    │                   │
                    ▼                    ▼                   ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│      SUPABASE         │  │      STRIPE       │  │       RESEND         │
│                       │  │                  │  │                      │
│  PostgreSQL + RLS     │  │  Checkout Session │  │  Emails transacc.    │
│  Auth (JWT)           │  │  Webhooks         │  │  Confirmación pedido │
│  Storage (imágenes)   │  │  Modo test/prod   │  │  React Email templ.  │
│  Row Level Security   │  │                  │  │                      │
│  ┌─────────────────┐  │  └──────────────────┘  └──────────────────────┘
│  │    TABLAS        │  │
│  │  stores          │  │
│  │  products        │  │
│  │  categories      │  │
│  │  orders          │  │
│  │  order_items     │  │
│  │  customers       │  │
│  │  coupons         │  │
│  │  import_batches  │  │
│  └─────────────────┘  │
└──────────────────────┘
```

---

## Cómo Funciona la Aplicación (Flujo Detallado)

### Flujo 1 — Un vendedor crea su tienda

```
1. Vendedor va a /registro
         │
         ▼
2. Crea cuenta con email + contraseña
   (Supabase Auth emite JWT token)
         │
         ▼
3. Es redirigido al Onboarding (/onboarding)
   Paso 1: Nombre de tienda + slug (URL única)
   Paso 2: Color principal + descripción
   Paso 3: WhatsApp + email de contacto
         │
         ▼
4. Se crea una fila en la tabla `stores`
   con store_id único y owner_id = user.id
         │
         ▼
5. Vendedor entra a su Dashboard (/dashboard)
   Ve resumen: ventas, pedidos, stock bajo
```

### Flujo 2 — Un comprador realiza una compra

```
1. Comprador entra a /?store=techhub
   (el Middleware lee el slug y lo inyecta en headers)
         │
         ▼
2. Ve el catálogo de la tienda
   (productos filtrados por store_id vía RLS)
         │
         ▼
3. Agrega productos al carrito
   (estado local en Zustand, no requiere login)
         │
         ▼
4. Aplica cupón (opcional)
   → POST /api/coupons/validate
   → Valida descuento en Supabase
         │
         ▼
5. Va al Checkout
   → POST /api/checkout
   → Se crea una Stripe Checkout Session
   → Comprador es redirigido a la página de pago de Stripe
         │
         ▼
6. Completa el pago con tarjeta
         │
         ▼
7. Stripe envía webhook a /api/webhooks/stripe
   → Se verifica la firma del webhook
   → Se crea el registro del pedido en `orders`
   → Se crean los items en `order_items`
   → Se descuenta el stock de los productos
   → Se envía email de confirmación con Resend
         │
         ▼
8. Comprador es redirigido a /checkout/exito
```

### Flujo 3 — Vendedor importa productos masivamente

```
1. Vendedor descarga la plantilla Excel desde
   Dashboard → Importar Excel
         │
         ▼
2. Llena la plantilla con sus productos
   (nombre, precio, stock, imágenes, etc.)
         │
         ▼
3. Sube el archivo (.xlsx o .csv)
         │
         ▼
4. El sistema valida los datos con SheetJS/PapaParse
   Muestra preview: cuántos válidos, cuántos con error
         │
         ▼
5. Vendedor confirma la importación
   → POST /api/import/products
   → Se insertan los productos en lotes de 50
   → Se crean categorías automáticamente si no existen
   → Se actualiza el contador de productos de la tienda
```

### Flujo 4 — Cómo se identifica la tienda (Multi-Tenant)

```
Petición entra al servidor
         │
         ▼
┌─────────────────────────────────────┐
│           MIDDLEWARE                 │
│                                     │
│  ¿Tiene subdominio?                 │
│  techhub.shopflow.app               │
│         │ SÍ                        │
│         ▼                           │
│  slug = "techhub"                   │
│                                     │
│  ¿Tiene ?store= en la URL?          │
│  localhost:3000?store=techhub       │
│         │ SÍ                        │
│         ▼                           │
│  slug = "techhub"                   │
│                                     │
│  Inyecta slug en header:            │
│  x-store-slug: techhub              │
└─────────────────────────────────────┘
         │
         ▼
Los Server Components leen el header
y cargan únicamente los datos de esa tienda
(RLS en Supabase garantiza el aislamiento)
```

---

## Variables de Entorno — Rol en la Aplicación

Cada variable de entorno conecta ShopFlow con un servicio externo o configura su comportamiento. Aquí se explica para qué sirve cada una:

### Supabase (Base de datos, Auth y Storage)

| Variable | Visibilidad | Rol en la aplicación |
|----------|-------------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (cliente + servidor) | URL del proyecto Supabase. El cliente JavaScript la usa para conectarse a la base de datos y al servicio de autenticación desde el navegador. Se expone al cliente porque no es un secreto. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (cliente + servidor) | Clave anónima de Supabase. Permite leer datos públicos y autenticarse. Está protegida por las políticas RLS (Row Level Security): aunque sea pública, solo deja hacer lo que las políticas permiten. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor** (nunca al cliente) | Clave de super-admin de Supabase. Bypasea todas las políticas RLS. Se usa únicamente en: (1) el panel Super Admin para ver todas las tiendas, (2) los webhooks de Stripe para crear pedidos, (3) la importación masiva de productos. **Nunca debe exponerse al navegador.** |

### Stripe (Pagos)

| Variable | Visibilidad | Rol en la aplicación |
|----------|-------------|----------------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Pública (cliente) | Clave pública de Stripe. Se usa en el frontend para inicializar el SDK de Stripe y redirigir al checkout de pago. No es un secreto. |
| `STRIPE_SECRET_KEY` | **Solo servidor** | Clave secreta de Stripe. Se usa en `/api/checkout` para crear la Stripe Checkout Session en el servidor. Con esta clave se crean los cobros reales. **Nunca debe exponerse al navegador.** |
| `STRIPE_WEBHOOK_SECRET` | **Solo servidor** | Secreto para verificar que los webhooks vienen realmente de Stripe y no de un atacante. Se usa en `/api/webhooks/stripe` para validar la firma de cada evento antes de procesar el pedido. Sin esto, cualquiera podría falsificar un pago completado. |

### Resend (Emails transaccionales)

| Variable | Visibilidad | Rol en la aplicación |
|----------|-------------|----------------------|
| `RESEND_API_KEY` | **Solo servidor** | Clave de la API de Resend. Se usa para enviar el email de confirmación de pedido al comprador tras un pago exitoso. El email incluye el resumen del pedido con los productos comprados. **Solo se usa en el servidor** (dentro del webhook de Stripe). |

### Configuración de la aplicación

| Variable | Visibilidad | Rol en la aplicación |
|----------|-------------|----------------------|
| `NEXT_PUBLIC_APP_DOMAIN` | Pública | Dominio base de la plataforma (ej: `shopflow.app`). Se usa para construir las URLs de los subdominios de las tiendas: `{slug}.shopflow.app`. En desarrollo local se puede dejar como `localhost:3000`. |
| `NEXT_PUBLIC_APP_URL` | Pública | URL completa de la plataforma (ej: `https://carrito-compras-lemon.vercel.app`). Se usa en los metadatos Open Graph, en el sitemap y en los links absolutos que genera la app. |
| `SUPERADMIN_EMAIL` | **Solo servidor** | Email del dueño de la plataforma (el Super Admin). El middleware y el dashboard verifican si el usuario autenticado tiene este email para mostrar el panel de `/superadmin`. Si no coincide, el acceso es denegado. |

---

## ¿Quiénes usan la plataforma?

### 1. Super Admin — Dueño de la plataforma
- Ve y gestiona **todas** las tiendas desde `/superadmin`
- Accede con `SUPERADMIN_EMAIL` configurado en las variables de entorno
- Usa `SUPABASE_SERVICE_ROLE_KEY` para ver datos sin restricciones RLS

### 2. Vendedores — Dueños de tiendas
- Se registran solos en `/registro`
- Crean su tienda con nombre, color y URL única (slug)
- Gestionan catálogo, pedidos, clientes y cupones desde `/dashboard`
- Cada vendedor **solo ve sus propios datos** (protegido por RLS)

### 3. Compradores — Clientes de las tiendas
- No necesitan cuenta en ShopFlow
- Navegan el catálogo, agregan al carrito y pagan con tarjeta vía Stripe
- Reciben confirmación de pedido por email (Resend)

---

## Qué puede hacer cada vendedor

| Sección | Qué hace |
|---------|----------|
| **Panel principal** | Ver ventas del día, pedidos pendientes, alertas de stock bajo |
| **Productos** | Crear, editar y eliminar productos con fotos, precio, stock y descripción |
| **Importar Excel** | Subir un archivo Excel o CSV para crear cientos de productos a la vez |
| **Pedidos** | Ver todos los pedidos con su estado (pendiente, enviado, entregado, etc.) |
| **Clientes** | Ver listado de clientes con historial de compras |
| **Cupones** | Crear códigos de descuento (porcentaje, monto fijo o envío gratis) |
| **Configuración** | Cambiar nombre, descripción, colores, contacto de la tienda |

---

## Stack Tecnológico

| Capa | Tecnología | Para qué sirve |
|------|-----------|----------------|
| Framework | Next.js 14 App Router | Base del sitio: SSR, rutas, layouts, API routes |
| Lenguaje | TypeScript (strict) | Tipado estático — reduce errores en runtime |
| Estilos | Tailwind CSS v3 | Utilidades CSS — diseño responsive mobile-first |
| Componentes | Shadcn/ui | Biblioteca de componentes accesibles (botones, modales, etc.) |
| Base de datos | Supabase (PostgreSQL) | Almacena tiendas, productos, pedidos, clientes |
| Autenticación | Supabase Auth | Login, registro, JWT tokens, sesiones SSR |
| Archivos | Supabase Storage | Fotos de productos y avatares de vendedores |
| Seguridad datos | Row Level Security (RLS) | Aísla los datos de cada tienda entre sí |
| Pagos | Stripe Checkout + Webhooks | Procesar tarjetas — modo test y producción |
| Emails | Resend + React Email | Confirmaciones de pedido con plantillas HTML |
| Estado global | Zustand | Carrito de compras persistente en el navegador |
| Temas | next-themes | Toggle dark/light mode sin flash en SSR |
| Import masivo | SheetJS + PapaParse | Leer archivos Excel (.xlsx) y CSV |
| Validación | Zod + React Hook Form | Validación de formularios con tipos TypeScript |
| Deploy | Vercel | CDN global, serverless functions, wildcard domains |

---

## Estructura del Proyecto

```
ShopFlow/
├── app/
│   ├── (marketing)/              # Páginas de captación y auth
│   │   ├── login/page.tsx        # Inicio de sesión
│   │   ├── registro/page.tsx     # Crear cuenta de vendedor
│   │   └── onboarding/page.tsx   # Wizard de 3 pasos para crear la tienda
│   │
│   ├── (store)/                  # Tienda pública (vista del comprador)
│   │   ├── layout.tsx            # Header, footer, ThemeToggle
│   │   ├── productos/page.tsx    # Catálogo con búsqueda y filtros
│   │   ├── productos/[slug]/     # Detalle de un producto
│   │   └── checkout/             # Proceso de pago y página de éxito
│   │
│   ├── (dashboard)/              # Panel del vendedor (requiere login)
│   │   ├── layout.tsx            # Sidebar con navegación y ThemeToggle
│   │   └── dashboard/
│   │       ├── page.tsx          # Resumen: ventas, pedidos, stock
│   │       ├── productos/        # CRUD de productos + importar Excel
│   │       ├── pedidos/          # Lista y detalle de pedidos
│   │       ├── clientes/         # Lista de compradores
│   │       ├── cupones/          # Gestión de códigos de descuento
│   │       └── configuracion/    # Nombre, tema, contacto de la tienda
│   │
│   ├── (superadmin)/             # Panel maestro (solo SUPERADMIN_EMAIL)
│   │   └── superadmin/page.tsx   # Lista de todas las tiendas
│   │
│   ├── api/
│   │   ├── checkout/route.ts         # POST → crea Stripe Checkout Session
│   │   ├── webhooks/stripe/route.ts  # POST → confirma pago, crea pedido
│   │   ├── import/products/route.ts  # POST → importa Excel/CSV masivo
│   │   └── coupons/validate/route.ts # POST → valida código de cupón
│   │
│   ├── layout.tsx                # Root layout: ThemeProvider, Toaster
│   └── page.tsx                  # Página raíz: landing o storefront por slug
│
├── components/
│   ├── store/                    # Componentes de la tienda pública
│   │   ├── StoreHeader.tsx       # Header con búsqueda, carrito, ThemeToggle
│   │   ├── StorePage.tsx         # Página principal con productos destacados
│   │   ├── ProductCard.tsx       # Tarjeta de producto en el catálogo
│   │   ├── ProductDetail.tsx     # Vista completa de un producto
│   │   ├── ProductFilters.tsx    # Filtros por categoría y precio
│   │   └── CartDrawer.tsx        # Panel lateral del carrito
│   │
│   ├── dashboard/
│   │   ├── DashboardSidebar.tsx  # Sidebar de navegación + ThemeToggle
│   │   ├── ProductForm.tsx       # Formulario crear/editar producto (tabs)
│   │   └── StoreConfigForm.tsx   # Formulario configuración de tienda (tabs)
│   │
│   ├── marketing/
│   │   └── LandingPage.tsx       # Landing page de ShopFlow
│   │
│   ├── ui/                       # Componentes Shadcn/ui (botones, inputs, etc.)
│   ├── ThemeProvider.tsx         # Proveedor next-themes para dark/light mode
│   ├── ThemeToggle.tsx           # Botón Sol/Luna para cambiar tema
│   └── StickyFooter.tsx          # Footer fijo: © ShopFlow · Elaborada por Sherlock
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Cliente Supabase para el navegador
│   │   ├── server.ts             # Cliente Supabase para Server Components
│   │   └── store-context.ts      # Función para obtener tienda por slug
│   ├── store/
│   │   └── cart.ts               # Store Zustand del carrito de compras
│   ├── excel/
│   │   ├── parser.ts             # Lee y valida archivos Excel/CSV
│   │   └── template.ts           # Genera la plantilla Excel descargable
│   └── utils/
│       ├── types.ts              # Tipos TypeScript del dominio
│       └── cn.ts                 # Utilidades (slugify, classnames)
│
├── supabase/
│   ├── migrations/001_schema.sql # Esquema completo de la base de datos
│   └── seed.sql                  # Datos de ejemplo (tienda TechHub demo)
│
├── middleware.ts                 # Detecta tienda por subdominio o ?store=
├── tailwind.config.ts            # Config Tailwind con darkMode: 'class'
└── next.config.mjs               # Config Next.js: dominios de imágenes, headers
```

---

## Seguridad: Row Level Security (RLS)

Todas las tablas de Supabase tienen RLS habilitado. Esto significa que aunque dos vendedores usen la misma base de datos, **es imposible que uno vea los datos del otro**:

```sql
-- Ejemplo: un vendedor solo puede ver sus propios productos
CREATE POLICY "vendors_own_products" ON products
  FOR ALL TO authenticated
  USING (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));
```

El Super Admin usa `SUPABASE_SERVICE_ROLE_KEY` que bypasea el RLS solo en el servidor, nunca desde el cliente.

---

## Credenciales y Acceso

### Super Admin
| Campo | Valor |
|-------|-------|
| Email | `admin@techhub.com` |
| Login | https://carrito-compras-lemon.vercel.app/login |
| Panel maestro | https://carrito-compras-lemon.vercel.app/superadmin |

### Tienda demo — TechHub
| Campo | Valor |
|-------|-------|
| Email del dueño | `admin@techhub.com` |
| Dashboard | https://carrito-compras-lemon.vercel.app/dashboard |
| Tienda pública | https://carrito-compras-lemon.vercel.app/?store=techhub |
| Productos demo | 20 productos de electrónica |

### Tienda — Sherlock's Stuff
| Campo | Valor |
|-------|-------|
| Email del dueño | `sherlock2009@gmail.com` |
| Tienda pública | https://carrito-compras-lemon.vercel.app/?store=sherlocks-stuff |

### Tarjeta de prueba — Stripe Test Mode
| Campo | Valor |
|-------|-------|
| Número | `4242 4242 4242 4242` |
| Vencimiento | Cualquier fecha futura (ej: `12/29`) |
| CVV | `123` |
| Código postal | `12345` |

---

## Instalación y Desarrollo Local

### Requisitos previos
- Node.js 18 o superior
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Stripe](https://stripe.com) (gratis para pruebas)
- Cuenta en [Resend](https://resend.com) (gratis hasta 3.000 emails/mes)

### Paso 1 — Clonar e instalar

```bash
git clone https://github.com/chris2009/Carrito_Compras
cd Carrito_Compras
npm install
```

### Paso 2 — Variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local`:

```env
# ── SUPABASE ──────────────────────────────────────────────
# URL del proyecto: Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co

# Clave anónima (segura para exponer al cliente, controlada por RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Clave service role (NUNCA al cliente — bypasea RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── STRIPE ────────────────────────────────────────────────
# Clave pública (segura para exponer al cliente)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Clave secreta (NUNCA al cliente — crea cobros reales)
STRIPE_SECRET_KEY=sk_test_...

# Secreto del webhook (verifica que Stripe es el remitente)
STRIPE_WEBHOOK_SECRET=whsec_...

# ── RESEND ────────────────────────────────────────────────
# Clave API para enviar emails de confirmación de pedido
RESEND_API_KEY=re_...

# ── APP ───────────────────────────────────────────────────
# Dominio base para construir subdominios de tiendas
NEXT_PUBLIC_APP_DOMAIN=localhost:3000

# URL completa de la app (para Open Graph y links absolutos)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email del Super Admin (accede a /superadmin)
SUPERADMIN_EMAIL=tu@email.com
```

### Paso 3 — Configurar Supabase

**Base de datos:**
1. Ir a [supabase.com](https://supabase.com) → tu proyecto → **SQL Editor**
2. Ejecutar `supabase/migrations/001_schema.sql` (crea todas las tablas y RLS)
3. Ejecutar `supabase/seed.sql` (crea la tienda TechHub con productos demo)
4. En **Authentication → Settings** → desactivar "Enable email confirmations" (para desarrollo)

**Storage (imágenes):**

5. En **Storage** → crear dos buckets públicos: `profiles` y `products`
6. Ejecutar en SQL Editor:

```sql
-- Avatares de vendedores
CREATE POLICY "upload_own_avatar" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "update_own_avatar" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "public_read_profiles" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profiles');

-- Imágenes de productos
CREATE POLICY "upload_product_images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "public_read_products" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'products');
```

### Paso 4 — Correr el proyecto

```bash
npm run dev
```

Abrir: `http://localhost:3000?store=techhub`

---

## Deploy en Vercel (producción)

1. Conectar el repositorio en [vercel.com](https://vercel.com/new)
2. Agregar todas las variables de entorno del `.env.local`
3. Cambiar `NEXT_PUBLIC_APP_URL` a tu dominio real (ej: `https://miapp.vercel.app`)
4. Cambiar `SUPERADMIN_EMAIL` a tu email real
5. (Opcional) Configurar wildcard domain `*.shopflow.app` en Vercel → Domains
6. En Stripe: crear webhook apuntando a `https://tudominio.app/api/webhooks/stripe`
   - Evento requerido: `checkout.session.completed`

---

## Cómo funciona el Multi-Tenant

Cada tienda es una fila en la tabla `stores`. El sistema detecta qué tienda mostrar de dos formas:

| Entorno | Cómo se detecta la tienda |
|---------|--------------------------|
| Producción con subdominio | `techhub.shopflow.app` → slug = `techhub` |
| Vercel sin wildcard DNS | `?store=techhub` en la URL |
| Desarrollo local | `localhost:3000?store=techhub` |

El middleware lee el subdominio o el parámetro, inyecta el slug en un header HTTP (`x-store-slug`), y los Server Components lo usan para cargar solo los datos de esa tienda. El RLS de Supabase garantiza que aunque la query no filtre por `store_id`, la política de la base de datos lo hace automáticamente.

---

> © 2026 ShopFlow · Elaborada por **Sherlock**
