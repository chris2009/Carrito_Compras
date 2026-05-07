import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './ProductCard'
import type { Store } from '@/lib/supabase/store-context'
import type { Product, Category } from '@/lib/utils/types'

type Props = {
  store: Store
  featured: Product[]
  categories: Category[]
  newest: Product[]
}

export function StorePage({ store, featured, categories, newest }: Props) {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-16 md:py-24"
        style={{ background: `linear-gradient(135deg, ${store.theme.primary}15, ${store.theme.secondary}10)` }}
      >
        {store.banner_url && (
          <Image src={store.banner_url} alt={store.name} fill className="object-cover opacity-10" sizes="100vw" priority />
        )}
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl" style={{ color: store.theme.primary }}>
            {store.name}
          </h1>
          {store.description && <p className="mb-6 text-lg text-gray-700">{store.description}</p>}
          <Link href={`/productos?store=${store.slug}`}>
            <Button style={{ background: store.theme.primary }} className="text-white">
              Ver todos los productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Categorías</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.slug}&store=${store.slug}`} className="flex-shrink-0 snap-start">
                  <div className="group flex w-24 flex-col items-center gap-2 rounded-xl border bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                    {cat.image_url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                        <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform" sizes="48px" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-100" />
                    )}
                    <span className="text-center text-xs font-medium text-gray-700 line-clamp-2">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Productos destacados</h2>
              <Link href={`/productos?destacado=true&store=${store.slug}`} className="flex items-center gap-1 text-sm hover:underline" style={{ color: store.theme.primary }}>
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} currency={store.currency} primaryColor={store.theme.primary} storeSlug={store.slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newest */}
      {newest.length > 0 && (
        <section className="bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Novedades</h2>
              <Link href={`/productos?orden=newest&store=${store.slug}`} className="flex items-center gap-1 text-sm hover:underline" style={{ color: store.theme.primary }}>
                Ver más <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {newest.map((product) => (
                <ProductCard key={product.id} product={product} currency={store.currency} primaryColor={store.theme.primary} storeSlug={store.slug} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
