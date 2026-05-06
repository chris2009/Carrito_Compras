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
