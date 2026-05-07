import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getCurrentStore } from '@/lib/supabase/store-context'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const storeSlug = headersList.get('x-store-slug')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopflow.app'

  if (!storeSlug) {
    return [
      { url: appUrl, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
      { url: `${appUrl}/login`, lastModified: new Date(), priority: 0.4, changeFrequency: 'yearly' },
      { url: `${appUrl}/registro`, lastModified: new Date(), priority: 0.6, changeFrequency: 'yearly' },
    ]
  }

  const store = await getCurrentStore(storeSlug)
  if (!store) return []

  const storeUrl = `https://${storeSlug}.shopflow.app`
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('store_id', store.id)
    .eq('is_active', true)

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('store_id', store.id)
    .eq('is_active', true)

  return [
    { url: storeUrl, lastModified: new Date(), priority: 1, changeFrequency: 'daily' },
    { url: `${storeUrl}/productos`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' },
    ...(categories || []).map((c) => ({
      url: `${storeUrl}/productos?categoria=${c.slug}`,
      lastModified: new Date(),
      priority: 0.7 as const,
      changeFrequency: 'weekly' as const,
    })),
    ...(products || []).map((p) => ({
      url: `${storeUrl}/productos/${p.slug}`,
      lastModified: new Date(p.updated_at),
      priority: 0.6 as const,
      changeFrequency: 'weekly' as const,
    })),
  ]
}
