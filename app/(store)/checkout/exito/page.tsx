'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'

export default function CheckoutExitoPage() {
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="mb-3 text-3xl font-bold text-gray-900">¡Pedido confirmado!</h1>
      <p className="mb-2 text-gray-600 max-w-md">
        Tu pedido fue recibido exitosamente. Recibirás un email de confirmación con los detalles.
      </p>
      <p className="mb-8 text-sm text-gray-500">
        La tienda se comunicará contigo para coordinar el envío y entrega.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/productos">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Seguir comprando
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">
            Ir al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
