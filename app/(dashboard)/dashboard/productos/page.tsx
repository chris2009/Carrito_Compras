import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Upload, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/cn'
import type { Product } from '@/lib/utils/types'

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('id, currency, theme').eq('owner_id', user.id).limit(1).single()
  if (!store) redirect('/onboarding')

  const params = await searchParams
  let query = supabase
    .from('products')
    .select('*, categories(name)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }
  if (params.estado === 'activo') query = query.eq('is_active', true)
  if (params.estado === 'inactivo') query = query.eq('is_active', false)
  if (params.estado === 'sin-stock') query = query.eq('stock', 0)
  if (params.estado === 'low') query = query.lte('stock', 5).gt('stock', 0)

  const { data: products } = await query.limit(100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/productos/nuevo">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-1 h-4 w-4" />
              Nuevo
            </Button>
          </Link>
          <Link href="/dashboard/productos/importar">
            <Button size="sm" variant="outline">
              <Upload className="mr-1 h-4 w-4" />
              Importar Excel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <form className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              name="q"
              placeholder="Buscar productos..."
              className="pl-9"
              defaultValue={params.q}
            />
          </div>
        </form>
        <div className="flex gap-1 flex-wrap">
          {[
            { value: '', label: 'Todos' },
            { value: 'activo', label: 'Activos' },
            { value: 'inactivo', label: 'Inactivos' },
            { value: 'low', label: 'Stock bajo' },
            { value: 'sin-stock', label: 'Sin stock' },
          ].map((f) => (
            <Link key={f.value} href={`/dashboard/productos${f.value ? `?estado=${f.value}` : ''}`}>
              <Button
                size="sm"
                variant={params.estado === f.value || (!params.estado && f.value === '') ? 'default' : 'outline'}
                className={params.estado === f.value || (!params.estado && f.value === '') ? 'bg-indigo-600' : ''}
              >
                {f.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {!products || products.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No hay productos</p>
            <Link href="/dashboard/productos/nuevo" className="mt-2 inline-block">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Agregar el primero</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Producto</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">Categoría</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Precio</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(products as Product[]).map((product) => {
                  const img = product.images?.[0]
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                            {img ? (
                              <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <Package className="h-5 w-5 text-gray-300 m-auto mt-2" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                        {product.categories ? (product.categories as { name: string }).name : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(product.price, store.currency)}
                        {product.compare_price && (
                          <span className="ml-1 text-xs text-gray-400 line-through">
                            {formatCurrency(product.compare_price, store.currency)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-orange-500' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? 'bg-green-100 text-green-800' : ''}>
                            {product.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {product.is_featured && (
                            <Badge className="bg-amber-100 text-amber-800">Destacado</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/productos/${product.id}`}>
                          <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                            Editar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
