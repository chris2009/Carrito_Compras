# ShopFlow — Project Memory

## Estado actual
- Fase activa: 10 — Deploy Vercel (pendiente configuración env vars)
- Última actualización: 2026-05-06
- Último commit: feat(scaffold): complete ShopFlow multi-tenant SaaS — fases 0-9

## Fases completadas
- [x] FASE 0: Archivos contexto + scaffold
- [x] FASE 1: Schema Supabase + RLS + seed
- [x] FASE 2: Auth + Onboarding de nuevas tiendas
- [x] FASE 3: Middleware multi-tenant
- [x] FASE 4: Storefront público (catálogo, producto, carrito Zustand)
- [x] FASE 5: Import Excel/CSV masivo de productos
- [x] FASE 6: Checkout Stripe Sessions + Webhooks
- [x] FASE 7: Dashboard del vendedor (productos, pedidos, clientes, cupones, configuración)
- [x] FASE 8: Super-admin panel con métricas globales
- [x] FASE 9: SEO + Performance + PWA

## Decisiones técnicas
- Rutas dashboard en /dashboard/* dentro de (dashboard) route group
- Rutas superadmin en /superadmin/* dentro de (superadmin) route group
- CSS variables Tailwind: border, ring, card, popover, etc. definidas en tailwind.config.ts
- globals.css usa CSS nativo en lugar de @apply para border-color y outline-color (workaround Tailwind v3 + CSS vars + opacity)
- Select usa @base-ui/react — onValueChange retorna string | null (usar v ?? '')
- Set iteration: usar Array.from() en lugar de [...new Set()] para compatibilidad TS

## Estructura de rutas (URLs)
- / → Marketing landing (no store slug) o store home (con slug)
- /login, /registro, /onboarding → Auth flow
- /productos, /productos/[slug] → Storefront
- /checkout, /checkout/exito → Checkout Stripe
- /dashboard → Panel vendedor (requiere auth)
- /dashboard/productos, /dashboard/pedidos, etc.
- /superadmin → Super-admin (requiere SUPERADMIN_EMAIL)
- /robots.txt, /sitemap.xml, /manifest.webmanifest → SEO/PWA

## Variables de entorno requeridas para deploy
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

## Problemas conocidos / pendientes
- Cupones: solo lectura en dashboard (crear/editar/eliminar cupones via Supabase dashboard por ahora)
- Emails de confirmación de pedido via Resend: webhook lo llama pero la función de envío está pendiente de implementar
- PWA icons: actualmente generados dinámicamente con ImageResponse (32x32 y 180x180); para producción mejorar con 512x512

## Próximos pasos — FASE 10
1. Crear proyecto en Vercel y conectar repositorio
2. Configurar env vars en Vercel dashboard
3. Configurar wildcard domain *.shopflow.app en Vercel
4. Configurar Supabase: aplicar migration 001_schema.sql + seed.sql
5. Configurar Stripe webhook endpoint → https://shopflow.app/api/webhooks/stripe
6. Test end-to-end en producción
