# ShopFlow

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
