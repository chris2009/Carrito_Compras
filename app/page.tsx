import { headers } from 'next/headers'
import { getCurrentStore } from '@/lib/supabase/store-context'
import { createClient } from '@/lib/supabase/server'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StorePage } from '@/components/store/StorePage'
import LandingPage from '@/components/marketing/LandingPage'

export const revalidate = 60

export default async function RootPage() {
  const headersList = await headers()
  const slug = headersList.get('x-store-slug')

  // No store context → show marketing landing page
  if (!slug) {
    return <LandingPage />
  }

  const store = await getCurrentStore(slug)

  // Unknown store → show landing page
  if (!store) {
    return <LandingPage />
  }

  // Store context → show storefront
  const supabase = await createClient()
  const [{ data: featured }, { data: categories }, { data: newest }] = await Promise.all([
    supabase.from('products').select('*, categories(*)').eq('store_id', store.id).eq('is_active', true).eq('is_featured', true).order('sale_count', { ascending: false }).limit(8),
    supabase.from('categories').select('*').eq('store_id', store.id).eq('is_active', true).order('sort_order'),
    supabase.from('products').select('*, categories(*)').eq('store_id', store.id).eq('is_active', true).order('created_at', { ascending: false }).limit(4),
  ])

  return (
    <div
      className="min-h-screen"
      style={{
        '--color-primary': store.theme.primary,
        '--color-secondary': store.theme.secondary,
      } as React.CSSProperties}
    >
      <StoreHeader store={store} />
      <main>
        <StorePage store={store} featured={featured || []} categories={categories || []} newest={newest || []} />
      </main>
      <footer className="border-t bg-gray-50 px-4 py-8 mt-16">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          <p>{store.name} · Powered by ShopFlow</p>
          {store.contact.whatsapp && (
            <a
              href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`}
              className="mt-1 block text-green-600 hover:underline"
              target="_blank" rel="noopener noreferrer"
            >
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}
