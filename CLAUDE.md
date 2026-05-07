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
- [x] FASE 0: Archivos contexto + scaffold
- [x] FASE 1: Schema Supabase + RLS + seed
- [x] FASE 2: Auth + Onboarding de nuevas tiendas
- [x] FASE 3: Middleware multi-tenant
- [x] FASE 4: Storefront público (catálogo, producto, carrito)
- [x] FASE 5: Import Excel/CSV masivo de productos
- [x] FASE 6: Checkout Stripe
- [x] FASE 7: Dashboard del vendedor
- [x] FASE 8: Super-admin panel
- [x] FASE 9: SEO + Performance + PWA
- [x] FASE 10: Deploy Vercel — https://carrito-compras-lemon.vercel.app

## Estado actual del deploy
- URL producción: https://carrito-compras-lemon.vercel.app
- Repo GitHub: https://github.com/chris2009/Carrito_Compras
- Super Admin email: admin@techhub.com (variable SUPERADMIN_EMAIL en Vercel)
- Confirmación de email: DESACTIVADA en Supabase (facilita testing)
- Bucket Storage `profiles`: debe existir en Supabase (público) para avatares

## Bugs críticos resueltos post-deploy
- `router.push` en login/registro causaba race condition con cookies de Supabase SSR → reemplazado por `window.location.href`
- Middleware no propagaba cookies actualizadas a server components → corregido con patrón oficial Supabase SSR (setAll en request Y response)
- `.single()` sin `.limit(1)` fallaba si un usuario tenía múltiples tiendas → agregado `.limit(1)` en los 9 archivos del dashboard
- `SUPERADMIN_EMAIL` apuntaba a `admin@shopflow.app` (placeholder) → corregido a `admin@techhub.com`
- Superadmin usaba `createClient()` (anon key con RLS) → cambiado a `createServiceClient()` para ver todas las tiendas
- Links internos del storefront no incluían `?store=` → propagado en StorePage, StoreHeader, ProductCard, ProductDetail, CartDrawer, ProductFilters
- Fallback hardcoded `|| 'techhub'` en layout y página de productos → cambiado a `|| ''`

## Decisiones de arquitectura importantes
- Navegación post-auth siempre con `window.location.href` (nunca `router.push`) para garantizar que las cookies de sesión de Supabase lleguen al servidor
- Onboarding crea tienda con `supabase.auth.getUser()` del cliente — si hay race condition de sesión, se asigna al usuario incorrecto. Resuelto con full page reload antes del onboarding
- El storefront en Vercel (sin wildcard DNS aún) usa `?store={slug}` como identificador — todos los links internos deben preservar este param
- superadmin requiere `createServiceClient()` (service role) porque RLS filtraría las tiendas de otros usuarios
