# ShopFlow — Project Memory

## Estado actual
- Fase activa: 10 — Deploy Vercel (pendiente)
- Última actualización: 2026-05-06
- Último commit: chore: seed ejecutado en Supabase con UUID real, repo conectado a GitHub

## Fases completadas
- [x] FASE 0: Archivos contexto + scaffold
- [x] FASE 1: Schema Supabase + RLS + seed
- [x] FASE 2: Auth + Onboarding de nuevas tiendas
- [x] FASE 3: Middleware multi-tenant
- [x] FASE 4: Storefront público (catálogo, producto, carrito Zustand)
- [x] FASE 5: Import Excel/CSV masivo de productos (SheetJS + PapaParse)
- [x] FASE 6: Checkout Stripe Sessions + Webhooks
- [x] FASE 7: Dashboard del vendedor (productos, pedidos, clientes, cupones, configuración)
- [x] FASE 8: Super-admin panel con métricas globales
- [x] FASE 9: SEO + Performance + PWA (robots, sitemap, manifest, OG images)
- [ ] FASE 10: Deploy Vercel

## Decisiones técnicas clave
- **Rutas**: dashboard en `/dashboard/*` dentro de `(dashboard)` route group; superadmin en `/superadmin/*`
- **Tailwind + CSS vars**: `tailwind.config.ts` define `border`, `ring`, `card`, `popover`, etc. como CSS variables
- **globals.css**: usa CSS nativo (`border-color: var(--border)`) en vez de `@apply` para evitar incompatibilidad con opacity modifiers en Tailwind v3
- **Select (@base-ui/react)**: `onValueChange` retorna `string | null` — siempre usar `v ?? ''` en el handler
- **Set iteration**: usar `Array.from(new Set(...))` en vez de `[...new Set(...)]` para compatibilidad TypeScript
- **Tienda demo local**: acceder con `?store=techhub` en desarrollo

## Estructura de URLs
| URL | Contenido |
|-----|-----------|
| `/` | Landing (sin slug) o home de tienda (con x-store-slug) |
| `/login`, `/registro`, `/onboarding` | Auth flow |
| `/productos`, `/productos/[slug]` | Storefront |
| `/checkout`, `/checkout/exito` | Checkout Stripe |
| `/dashboard` + subrutas | Panel vendedor (requiere auth) |
| `/superadmin` | Panel maestro (requiere SUPERADMIN_EMAIL) |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | SEO/PWA |

## Tienda demo (seed)
- Slug: `techhub` — URL local: `http://localhost:3000?store=techhub`
- 20 productos de electrónica en 8 categorías
- Moneda: USD | País: PE
- **Seed ejecutado en Supabase** ✓ (owner_id: `9e8b17e3-64c6-46ab-9989-dbbfe752e161`)

## Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_DOMAIN=shopflow.app
NEXT_PUBLIC_APP_URL=https://shopflow.app
SUPERADMIN_EMAIL=admin@shopflow.app
```

## Pendientes / limitaciones conocidas
- **Cupones**: solo listado en dashboard — crear/editar via Supabase dashboard (no hay CRUD UI aún)
- **Emails confirmación**: webhook crea el pedido pero no envía email via Resend (pendiente implementar)
- **PWA icons**: 32x32 y 180x180 generados con ImageResponse; agregar 512x512 para producción óptima
- **Planes/billing**: la columna `plan_id` existe pero el upgrade a Pro no está implementado (Stripe Billing pendiente)

## Próximos pasos — FASE 10
1. ✓ Repositorio conectado a GitHub: https://github.com/chris2009/Carrito_Compras
2. Crear proyecto en Vercel e importar ese repositorio
3. Agregar env vars en Vercel dashboard (ver .env.example)
4. Configurar wildcard domain `*.shopflow.app` en Vercel → apuntar DNS
5. Configurar Stripe webhook: `https://shopflow.app/api/webhooks/stripe` — evento: `checkout.session.completed`
6. Test end-to-end con tarjeta `4242 4242 4242 4242`
