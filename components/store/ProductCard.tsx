'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/utils/cn'
import type { Product } from '@/lib/utils/types'

type Props = {
  product: Product
  currency?: string
  primaryColor?: string
  storeSlug?: string
}

export function ProductCard({ product, currency = 'USD', primaryColor = '#6366f1', storeSlug = '' }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const primaryImage = product.images.find((i) => i.is_primary) || product.images[0]
  const isOutOfStock = product.stock === 0
  const isLowStock = !isOutOfStock && product.stock <= product.low_stock_alert
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0

  function handleAddToCart() {
    if (isOutOfStock || added) return
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.url || '',
      stock: product.stock,
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <Link href={`/productos/${product.slug}${storeSlug ? `?store=${storeSlug}` : ''}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <ShoppingCart className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge className="bg-red-500 text-white text-xs">-{discountPct}%</Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-amber-500 text-white text-xs">Destacado</Badge>
          )}
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="secondary" className="text-sm">Agotado</Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/productos/${product.slug}${storeSlug ? `?store=${storeSlug}` : ''}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {isLowStock && (
          <p className="flex items-center gap-1 text-xs text-orange-500">
            <AlertCircle className="h-3 w-3" />
            Últimas {product.stock} unidades
          </p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compare_price!, currency)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="w-full text-white transition-all"
            style={{ background: isOutOfStock ? '#9ca3af' : added ? '#10b981' : primaryColor }}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              'Agotado'
            ) : added ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="mr-1 h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
