# ShopFlow — Plataforma de tiendas online

## ¿Qué es ShopFlow?

ShopFlow es una plataforma que permite a cualquier persona crear su propia tienda online en minutos, sin saber programar. Funciona como un "Shopify propio": tú eres el dueño de la plataforma y tus clientes son los vendedores que crean sus tiendas.

**Ejemplo real de uso:**
- Mario entra a la plataforma, se registra y crea su tienda "Mario's Tech"
- En minutos tiene una tienda en línea con catálogo, carrito y pagos
- Sus clientes pueden comprar en `marios-tech.shopflow.app`
- Mario gestiona todo desde su panel de control

---

## ¿Quiénes usan la plataforma?

Hay tres tipos de personas que interactúan con ShopFlow:

### 1. Tú — el Super Admin (dueño de la plataforma)
- Ves y gestionas TODAS las tiendas creadas en tu plataforma
- Accedes a métricas globales: cuántas tiendas activas, ingresos totales, productos
- Tu acceso: entras con tu email en `/login` y luego vas a `/superadmin`
- Tu email de super admin está configurado en la variable `SUPERADMIN_EMAIL`

### 2. Los vendedores (dueños de tiendas)
- Se registran solos en `/registro`
- Crean su tienda con un nombre y URL única (slug)
- Gestionan su catálogo, pedidos, clientes y cupones desde `/dashboard`
- Su tienda es visible en `{slug}.shopflow.app` (en producción) o `?store={slug}` (en desarrollo)

### 3. Los compradores (clientes de las tiendas)
- No necesitan cuenta
- Navegan el catálogo, agregan productos al carrito y pagan con tarjeta
- Reciben confirmación de su pedido por email

---

## ¿Qué puede hacer cada vendedor?

Desde su panel de control (`/dashboard`) el vendedor puede:

| Sección | Qué hace |
|---------|----------|
| **Panel principal** | Ver ventas del día, pedidos pendientes, alertas de stock bajo |
| **Productos** | Crear, editar y eliminar productos con fotos, precio, stock y descripción |
| **Importar Excel** | Subir un archivo Excel o CSV para crear cientos de productos a la vez |
| **Pedidos** | Ver todos los pedidos con su estado (pendiente, enviado, entregado, etc.) |
| **Clientes** | Ver listado de clientes con historial de compras |
| **Cupones** | Crear códigos de descuento (porcentaje, monto fijo o envío gratis) |
| **Configuración** | Cambiar nombre, descripción, colores, datos de contacto de la tienda |

---

## ¿Cómo luce la tienda para los compradores?

Cada tienda tiene su propio sitio con:
- Página principal con banner y productos destacados
- Catálogo completo con búsqueda, filtros por categoría y precio
- Página de detalle de cada producto con fotos y descripción
- Carrito de compras con soporte para cupones de descuento
- Checkout seguro con pago por tarjeta (Stripe)
- Confirmación de pedido tras el pago

---

## Credenciales y acceso

### Super Admin
| Campo | Valor |
|-------|-------|
| Email | `admin@techhub.com` |
| URL de acceso | `https://carrito-compras-lemon.vercel.app/login` |
| Panel maestro | `https://carrito-compras-lemon.vercel.app/superadmin` |

> El super admin ve el link "Super Admin" en la barra lateral del dashboard después de loguearse.

### Tienda demo — TechHub
| Campo | Valor |
|-------|-------|
| Email del dueño | `admin@techhub.com` |
| Dashboard | `/dashboard` (después de login) |
| Tienda pública | `https://carrito-compras-lemon.vercel.app/?store=techhub` |
| Productos | 20 productos de electrónica (demo) |

### Tienda — Sherlock's Stuff
| Campo | Valor |
|-------|-------|
| Email del dueño | `sherlock2009@gmail.com` |
| Tienda pública | `https://carrito-compras-lemon.vercel.app/?store=sherlocks-stuff` |

### Tarjeta de prueba (pagos Stripe en modo test)
| Campo | Valor |
|-------|-------|
| Número | `4242 4242 4242 4242` |
| Vencimiento | Cualquier fecha futura |
| CVV | `123` |
| Código postal | `12345` |

---

## Cómo registrarse como vendedor nuevo

1. Ir a `https://carrito-compras-lemon.vercel.app/registro`
2. Ingresar email y contraseña (mínimo 6 caracteres)
3. Completar el wizard de 3 pasos:
   - **Paso 1**: Nombre de la tienda y URL (ej: `mi-tienda`)
   - **Paso 2**: Color principal y descripción
   - **Paso 3**: WhatsApp y email de contacto
4. ¡Listo! La tienda queda activa inmediatamente

> **Nota**: La confirmación de email está desactivada para facilitar las pruebas. En producción real se reactivaría para seguridad.

---

## Instalación y desarrollo local

### Requisitos previos
- Node.js 18 o superior
- Una cuenta en [Supabase](https://supabase.com) (gratis)
- Una cuenta en [Stripe](https://stripe.com) (gratis para pruebas)

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

Completar `.env.local` con tus claves:

```env
# Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe → Developers → API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend → API Keys
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email del super admin (el tuyo)
SUPERADMIN_EMAIL=tu@email.com
```

### Paso 3 — Configurar Supabase
1. Ir a [supabase.com](https://supabase.com) → tu proyecto → **SQL Editor**
2. Pegar y ejecutar el contenido de `supabase/migrations/001_schema.sql`
3. Pegar y ejecutar el contenido de `supabase/seed.sql` (crea la tienda TechHub demo)
4. En **Authentication → Settings** → desactivar "Enable email confirmations" (para desarrollo)
5. En **Storage** → crear bucket llamado `profiles` → marcar como **Público**

### Paso 4 — Correr el proyecto
```bash
npm run dev
```

Abrir: `http://localhost:3000?store=techhub`

---

## Deploy en Vercel (producción)

1. Conectar el repositorio en [vercel.com](https://vercel.com/new)
2. Agregar todas las variables de entorno del `.env.local`
3. Cambiar `NEXT_PUBLIC_APP_URL` a tu dominio real
4. Cambiar `SUPERADMIN_EMAIL` a tu email real
5. Configurar wildcard domain `*.shopflow.app` en Vercel → Domains
6. En Stripe: crear webhook apuntando a `https://tudominio.app/api/webhooks/stripe`
   - Evento requerido: `checkout.session.completed`

---

## Stack tecnológico (para desarrolladores)

| Capa | Tecnología | Para qué sirve |
|------|-----------|----------------|
| Framework | Next.js 14 App Router | La base del sitio web |
| Lenguaje | TypeScript | Programación con menos errores |
| Estilos | Tailwind CSS + Shadcn/ui | El diseño visual |
| Base de datos | Supabase (PostgreSQL) | Guardar tiendas, productos, pedidos |
| Autenticación | Supabase Auth | Login y registro de usuarios |
| Archivos | Supabase Storage | Fotos de productos y avatares |
| Pagos | Stripe Checkout | Procesar tarjetas de crédito |
| Emails | Resend + React Email | Confirmaciones de pedido |
| Estado | Zustand | Carrito de compras en el navegador |
| Formularios | React Hook Form + Zod | Validación de formularios |
| Import Excel | SheetJS + PapaParse | Carga masiva de productos |
| Deploy | Vercel | Publicar el sitio en internet |

---

## Estructura del proyecto

```
├── app/
│   ├── (marketing)/        # Páginas públicas: landing, login, registro, onboarding
│   ├── (store)/            # Tienda pública del cliente: catálogo, producto, carrito, checkout
│   ├── (dashboard)/        # Panel del vendedor: productos, pedidos, configuración
│   ├── (superadmin)/       # Panel maestro: ver todas las tiendas
│   └── api/                # Endpoints: checkout Stripe, webhooks, importar, cupones
├── components/
│   ├── store/              # Componentes de la tienda pública
│   ├── dashboard/          # Componentes del panel del vendedor
│   └── ui/                 # Componentes visuales base (botones, inputs, etc.)
├── lib/
│   ├── supabase/           # Conexión a la base de datos
│   └── store/              # Estado del carrito (Zustand)
└── supabase/
    ├── migrations/         # Estructura de la base de datos
    └── seed.sql            # Datos de ejemplo (tienda TechHub)
```

---

## Cómo funciona el multi-tenant (una plataforma, múltiples tiendas)

Cada tienda es una fila en la tabla `stores` de la base de datos. El sistema detecta qué tienda mostrar de dos formas:

- **En producción** (con dominio propio): el subdominio — `techhub.shopflow.app` muestra la tienda "techhub"
- **En desarrollo** (sin dominio): el parámetro URL — `localhost:3000?store=techhub`

La seguridad entre tiendas se garantiza con **RLS (Row Level Security)** de Supabase: cada vendedor solo puede ver y editar los datos de su propia tienda. Es imposible que un vendedor vea los productos o pedidos de otra tienda.

---

## Repositorio

```
https://github.com/chris2009/Carrito_Compras
```
