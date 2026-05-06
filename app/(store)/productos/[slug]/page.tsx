import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentStore } from '@/lib/supabase/store-context'
import { createClient } from '@/lib/supabase/server'
import { ProductDetail } from '@/components/store/ProductDetail'
import { ProductCard } from '@/components/store/ProductCard'
import type { Product } from '@/lib/utils/types'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const storeSlug = headersList.get('x-store-slug') || 'techhub'
  const store = await getCurrentStore(storeSlug)
  if (!store) return {}

  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('slug', slug)
    .single()

  if (!product) return {}

  const image = product.images?.[0]?.url

  return {
    title: `${product.name} — ${store.name}`,
    description: product.short_desc || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_desc || product.description?.slice(0, 160),
      images: image ? [{ url: image }] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const headersList = await headers()
  const storeSlug = headersList.get('x-store-slug') || 'techhub'
  const store = await getCurrentStore(storeSlug)
  if (!store) return null

  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('store_id', store.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // Increment view count (fire & forget)
  supabase.from('products').update({ view_count: (product.view_count || 0) + 1 }).eq('id', product.id)

  // Related products
  const { data: related } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('store_id', store.id)
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((i: { url: string }) => i.url),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: store.currency,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ProductDetail product={product as Product} store={store} />

        {/* Related */}
        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Productos relacionados</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(related as Product[]).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={store.currency}
                  primaryColor={store.theme.primary}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
