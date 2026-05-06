import { headers } from 'next/headers'
import { getCurrentStore } from '@/lib/supabase/store-context'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductFilters } from '@/components/store/ProductFilters'
import type { Product, Category } from '@/lib/utils/types'

export const revalidate = 60

type SearchParams = {
  q?: string
  categoria?: string
  min?: string
  max?: string
  stock?: string
  orden?: string
  destacado?: string
  page?: string
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const headersList = await headers()
  const slug = headersList.get('x-store-slug') || 'techhub'
  const store = await getCurrentStore(slug)
  if (!store) return null

  const params = await searchParams
  const supabase = await createClient()

  const [{ data: categories }] = await Promise.all([
    supabase.from('categories').select('*').eq('store_id', store.id).eq('is_active', true).order('sort_order'),
  ])

  let query = supabase
    .from('products')
    .select('*, categories(*)')
    .eq('store_id', store.id)
    .eq('is_active', true)

  if (params.q) {
    query = query.textSearch('search_vector', params.q, { type: 'websearch', config: 'spanish' })
  }

  if (params.categoria && categories) {
    const cat = (categories as Category[]).find((c) => c.slug === params.categoria)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.min) query = query.gte('price', parseFloat(params.min))
  if (params.max) query = query.lte('price', parseFloat(params.max))
  if (params.stock === '1') query = query.gt('stock', 0)
  if (params.destacado === 'true') query = query.eq('is_featured', true)

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest: { column: 'created_at', ascending: false },
    price_asc: { column: 'price', ascending: true },
    price_desc: { column: 'price', ascending: false },
    popular: { column: 'sale_count', ascending: false },
  }
  const sort = sortMap[params.orden || 'popular'] || sortMap.popular
  query = query.order(sort.column, { ascending: sort.ascending })

  const page = parseInt(params.page || '1')
  const limit = 24
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data: products } = await query

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {params.q ? `Resultados para "${params.q}"` : 'Todos los productos'}
        </h1>
        <span className="text-sm text-gray-500">{products?.length || 0} productos</span>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar filters — desktop */}
        <aside className="hidden w-60 flex-shrink-0 md:block">
          <ProductFilters
            categories={categories as Category[] || []}
            currentParams={params}
            primaryColor={store.theme.primary}
          />
        </aside>

        {/* Mobile filters bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          <ProductFilters
            categories={categories as Category[] || []}
            currentParams={params}
            primaryColor={store.theme.primary}
            mobile
          />
        </div>

        {/* Grid */}
        <div className="flex-1">
          {!products || products.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg font-medium">No se encontraron productos</p>
              <p className="mt-1 text-sm">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(products as Product[]).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={store.currency}
                  primaryColor={store.theme.primary}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
