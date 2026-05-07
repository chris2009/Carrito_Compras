import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getCurrentStore } from '@/lib/supabase/store-context'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers()
  const storeSlug = headersList.get('x-store-slug')

  if (storeSlug) {
    const store = await getCurrentStore(storeSlug)
    if (store) {
      return {
        name: store.name,
        short_name: store.name.slice(0, 12),
        description: store.description || `Tienda online — ${store.name}`,
        start_url: '/productos',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: (store.theme as { primary?: string })?.primary || '#6366f1',
        icons: [
          {
            src: store.logo_url || '/apple-icon',
            sizes: 'any',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['shopping'],
      }
    }
  }

  return {
    name: 'ShopFlow',
    short_name: 'ShopFlow',
    description: 'Tu tienda online en minutos',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: [
      { src: '/apple-icon', sizes: 'any', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['shopping'],
  }
}
