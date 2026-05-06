import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-gray-200">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">Página no encontrada</h2>
      <p className="mt-2 text-gray-600">La página que buscas no existe o fue removida.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700">Ir al inicio</Button>
        </Link>
        <Link href="/productos">
          <Button variant="outline">Ver productos</Button>
        </Link>
      </div>
    </div>
  )
}
