import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { getCurrentStore } from '@/lib/supabase/store-context'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StickyFooter } from '@/components/StickyFooter'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const slug = headersList.get('x-store-slug') || ''
  const store = slug ? await getCurrentStore(slug) : null

  if (!store) return {}

  const storeUrl = `https://${slug}.shopflow.app`
  const primary = (store.theme as { primary?: string })?.primary || '#6366f1'

  return {
    title: {
      template: `%s | ${store.name}`,
      default: store.name,
    },
    description: store.description || `Bienvenido a ${store.name}. Compra online de forma fácil y segura.`,
    metadataBase: new URL(storeUrl),
    openGraph: {
      type: 'website',
      siteName: store.name,
      title: store.name,
      description: store.description || `Tienda online — ${store.name}`,
      url: storeUrl,
      locale: 'es_PE',
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: store.description || `Tienda online — ${store.name}`,
    },
    themeColor: primary,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: store.name,
    },
  }
}

export async function generateViewport(): Promise<Viewport> {
  const headersList = await headers()
  const slug = headersList.get('x-store-slug') || ''
  const store = slug ? await getCurrentStore(slug) : null
  const primary = (store?.theme as { primary?: string })?.primary || '#6366f1'
  return { themeColor: primary, width: 'device-width', initialScale: 1, maximumScale: 5 }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const slug = headersList.get('x-store-slug') || ''
  const store = await getCurrentStore(slug)

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tienda no encontrada</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">La tienda &ldquo;{slug}&rdquo; no existe o no está activa.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-8"
      style={{
        '--color-primary': store.theme.primary,
        '--color-secondary': store.theme.secondary,
        '--color-accent': store.theme.accent,
      } as React.CSSProperties}
    >
      <StoreHeader store={store} />
      <main>{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 px-4 py-10 mt-16">
        <div className="mx-auto max-w-6xl text-center space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{store.name}</p>
          {store.contact.whatsapp && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <a
                href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`}
                className="text-green-600 dark:text-green-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contactar por WhatsApp
              </a>
            </p>
          )}
          {store.contact.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <a href={`mailto:${store.contact.email}`} className="hover:underline">
                {store.contact.email}
              </a>
            </p>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>© {new Date().getFullYear()} {store.name} · Todos los derechos reservados</p>
            <p>Powered by <span className="font-medium text-gray-500 dark:text-gray-400">ShopFlow</span></p>
          </div>
        </div>
      </footer>
      <StickyFooter />
    </div>
  )
}
