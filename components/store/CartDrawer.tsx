'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/utils/cn'
import type { Store } from '@/lib/supabase/store-context'
import { useState } from 'react'

export function CartDrawer({ store }: { store: Store }) {
  const { items, updateQty, removeItem, subtotal, total, count, coupon, applyCoupon, removeCoupon, discountAmount } =
    useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  async function handleApplyCoupon() {
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, store_id: store.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cupón inválido')
      applyCoupon(data.coupon)
      setCouponCode('')
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Cupón inválido')
    } finally {
      setCouponLoading(false)
    }
  }

  const fmt = (n: number) => formatCurrency(n, store.currency)

  if (items.length === 0) {
    return (
      <>
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito (0)
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Tu carrito está vacío</p>
          <Link href="/productos">
            <Button size="sm" style={{ background: store.theme.primary }} className="text-white">
              Ver productos
            </Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b px-4 py-4">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Carrito ({count()})
        </SheetTitle>
      </SheetHeader>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <ShoppingCart className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-1">
                  <Link href={`/productos/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
                    {item.name}
                  </Link>
                  <button onClick={() => removeItem(item.product_id)} className="flex-shrink-0 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-md border">
                    <button
                      onClick={() => updateQty(item.product_id, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product_id, item.qty + 1)}
                      disabled={item.qty >= item.stock}
                      className="flex h-7 w-7 items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">{fmt(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="pb-4">
          <Separator className="mb-4" />
          {coupon ? (
            <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-1 text-green-700">
                <Tag className="h-4 w-4" />
                {coupon.code} aplicado
              </span>
              <button onClick={removeCoupon} className="text-green-600 hover:text-green-800">Quitar</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={handleApplyCoupon} disabled={!couponCode || couponLoading}>
                Aplicar
              </Button>
            </div>
          )}
          {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
        </div>
      </ScrollArea>

      {/* Totals + CTA */}
      <div className="border-t bg-white px-4 py-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{fmt(subtotal())}</span>
        </div>
        {coupon && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento ({coupon.code})</span>
            <span>-{fmt(discountAmount())}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{fmt(total())}</span>
        </div>
        <Link href="/checkout" className="block">
          <Button
            className="mt-2 w-full text-white"
            style={{ background: store.theme.primary }}
          >
            Pagar {fmt(total())}
          </Button>
        </Link>
        <p className="text-center text-xs text-gray-400">Pago seguro con Stripe</p>
      </div>
    </div>
  )
}
