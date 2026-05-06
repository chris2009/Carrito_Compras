import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { getCurrentStore } from '@/lib/supabase/store-context'
import { StoreHeader } from '@/components/store/StoreHeader'

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
  const slug = headersList.get('x-store-slug') || 'techhub'
  const store = await getCurrentStore(slug)

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tienda no encontrada</h1>
          <p className="mt-2 text-gray-600">La tienda &ldquo;{slug}&rdquo; no existe o no está activa.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        '--color-primary': store.theme.primary,
        '--color-secondary': store.theme.secondary,
        '--color-accent': store.theme.accent,
      } as React.CSSProperties}
    >
      <StoreHeader store={store} />
      <main>{children}</main>
      <footer className="border-t bg-gray-50 px-4 py-8 mt-16">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          <p>{store.name} · Powered by ShopFlow</p>
          {store.contact.whatsapp && (
            <p className="mt-1">
              <a
                href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`}
                className="text-green-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contactar por WhatsApp
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
