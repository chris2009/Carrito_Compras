import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Package, DollarSign, AlertTriangle, Plus, Upload, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/cn'
import type { Order } from '@/lib/utils/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!store) redirect('/onboarding')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { data: recentOrders },
    { data: lowStockProducts },
    { data: todayOrders },
    { count: pendingCount },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, name, stock, low_stock_alert')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .lte('stock', 5)
      .gt('stock', 0)
      .limit(5),
    supabase
      .from('orders')
      .select('total')
      .eq('store_id', store.id)
      .gte('created_at', today.toISOString()),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id)
      .eq('status', 'pending'),
  ])

  const todayRevenue = todayOrders?.reduce((s, o) => s + (o.total || 0), 0) || 0
  const fmt = (n: number) => formatCurrency(n, store.currency)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de control</h1>
          <p className="text-sm text-gray-500">{store.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/productos/nuevo">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-1 h-4 w-4" />
              Nuevo producto
            </Button>
          </Link>
          <Link href="/dashboard/productos/importar">
            <Button size="sm" variant="outline">
              <Upload className="mr-1 h-4 w-4" />
              Importar
            </Button>
          </Link>
          <Link href={`/?store=${store.slug}`} target="_blank">
            <Button size="sm" variant="ghost">
              <ExternalLink className="mr-1 h-4 w-4" />
              Ver tienda
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ventas hoy</p>
                <p className="text-2xl font-bold">{fmt(todayRevenue)}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue total</p>
                <p className="text-2xl font-bold">{fmt(store.revenue_total || 0)}</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pedidos pend.</p>
                <p className="text-2xl font-bold">{pendingCount || 0}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-2">
                <ShoppingBag className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Productos</p>
                <p className="text-2xl font-bold">{store.products_count || 0}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Últimos pedidos</CardTitle>
            <Link href="/dashboard/pedidos" className="text-xs text-indigo-600 hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {!recentOrders || recentOrders.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">Sin pedidos aún</p>
            ) : (
              <div className="space-y-3">
                {(recentOrders as Order[]).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.customer_email} · {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <span className="text-sm font-semibold">{fmt(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Alertas de stock bajo
            </CardTitle>
            <Link href="/dashboard/productos?stock=low" className="text-xs text-indigo-600 hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">Todo en orden</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate mr-2">{product.name}</p>
                    <Badge variant="outline" className="text-orange-600 border-orange-300 flex-shrink-0">
                      {product.stock} unidades
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
