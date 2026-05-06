'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check, ChevronRight, AlertCircle, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/utils/cn'
import type { Product } from '@/lib/utils/types'
import type { Store } from '@/lib/supabase/store-context'

export function ProductDetail({ product, store }: { product: Product; store: Store }) {
  const addItem = useCartStore((s) => s.addItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const items = useCartStore((s) => s.items)

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const cartItem = items.find((i) => i.product_id === product.id)
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
      image: product.images[activeImage]?.url || '',
      stock: product.stock,
      slug: product.slug,
    })
    if (cartItem) {
      updateQty(product.id, cartItem.qty + qty)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const fmt = (n: number) => formatCurrency(n, store.currency)

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/productos" className="hover:text-gray-900">Productos</Link>
        {product.categories && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/productos?categoria=${product.categories.slug}`} className="hover:text-gray-900">
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[3fr_2fr] lg:grid-cols-[1.5fr_1fr]">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-gray-50">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage].url}
                alt={product.images[activeImage].alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-gray-300" />
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute left-3 top-3 bg-red-500 text-white">-{discountPct}%</Badge>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Badge variant="secondary" className="text-base px-4 py-1">Agotado</Badge>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === i ? 'border-indigo-600 scale-105' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {product.categories && (
            <Link href={`/productos?categoria=${product.categories.slug}`} className="text-sm text-indigo-600 hover:underline">
              {product.categories.name}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {product.short_desc && (
            <p className="text-gray-600">{product.short_desc}</p>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{fmt(product.price)}</span>
            {hasDiscount && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through">{fmt(product.compare_price!)}</span>
                <span className="text-xs text-red-500 font-medium">Ahorras {fmt(product.compare_price! - product.price)}</span>
              </div>
            )}
          </div>

          {/* Stock status */}
          {isOutOfStock ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Producto agotado</span>
            </div>
          ) : isLowStock ? (
            <div className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Últimas {product.stock} unidades</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">En stock ({product.stock} disponibles)</span>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1 rounded-lg border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                disabled={qty >= product.stock}
                className="flex h-10 w-10 items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              className="flex-1 text-white transition-all"
              style={{
                background: isOutOfStock ? '#9ca3af' : added ? '#10b981' : store.theme.primary,
              }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Agregado al carrito
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                </>
              )}
            </Button>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="descripcion">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="descripcion">Descripción</TabsTrigger>
            {Object.keys(product.attributes || {}).length > 0 && (
              <TabsTrigger value="especificaciones">Especificaciones</TabsTrigger>
            )}
            <TabsTrigger value="envio">Envío</TabsTrigger>
          </TabsList>
          <TabsContent value="descripcion" className="mt-4 prose max-w-none text-gray-700">
            <p>{product.description || 'Sin descripción disponible.'}</p>
          </TabsContent>
          {Object.keys(product.attributes || {}).length > 0 && (
            <TabsContent value="especificaciones" className="mt-4">
              <dl className="divide-y rounded-lg border">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="flex gap-4 px-4 py-3">
                    <dt className="w-1/3 text-sm font-medium capitalize text-gray-600">{key}</dt>
                    <dd className="flex-1 text-sm text-gray-900">{val}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
          )}
          <TabsContent value="envio" className="mt-4 text-sm text-gray-700 space-y-2">
            <p>El tiempo de entrega varía según tu ubicación y la disponibilidad del producto.</p>
            <p>Para más información sobre envíos, contacta a la tienda por WhatsApp.</p>
            {store.contact.whatsapp && (
              <a
                href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar por WhatsApp
              </a>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile sticky add to cart */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 shadow-2xl md:hidden z-30">
        <Button
          className="w-full text-white"
          style={{ background: isOutOfStock ? '#9ca3af' : store.theme.primary }}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {added ? (
            <><Check className="mr-2 h-4 w-4" />Agregado</>
          ) : (
            <><ShoppingCart className="mr-2 h-4 w-4" />{isOutOfStock ? 'Agotado' : `Agregar · ${fmt(product.price)}`}</>
          )}
        </Button>
      </div>
    </div>
  )
}
