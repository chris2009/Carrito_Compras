'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/utils/cn'

const schema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(7, 'Teléfono requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, subtotal, discountAmount, coupon } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (items.length === 0) {
    router.push('/')
    return null
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: data,
          coupon_code: coupon?.code,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al procesar')
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => formatCurrency(n, 'USD')

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Finalizar compra</h1>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input {...register('email')} type="email" placeholder="tu@email.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Nombre completo *</Label>
                <Input {...register('name')} placeholder="Juan Pérez" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Teléfono *</Label>
                <Input {...register('phone')} placeholder="+51 999 123 456" type="tel" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dirección de envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Dirección *</Label>
                <Input {...register('address')} placeholder="Av. Javier Prado 123, Dpto 4" />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Ciudad *</Label>
                <Input {...register('city')} placeholder="Lima" />
                {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-base"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Pagar {fmt(total())} con Stripe
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-400">Pago seguro encriptado · SSL</p>
        </form>

        {/* Order summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">
                    {item.name} <span className="text-gray-400">x{item.qty}</span>
                  </span>
                  <span className="font-medium flex-shrink-0">{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <Separator />
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span className="text-green-600">Por coordinar</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{fmt(total())}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
