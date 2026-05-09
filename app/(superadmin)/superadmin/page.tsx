import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, TrendingUp, DollarSign, Package } from 'lucide-react'
import { StoreCharts } from './StoreCharts'

export default async function SuperAdminPage() {
  const supabase = await createServiceClient()

  const [{ data: stores }, { count: totalStores }, { data: metrics }] = await Promise.all([
    supabase.from('stores').select('*, plans(name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('stores').select('revenue_total, products_count, orders_count, plan_id'),
  ])

  const totalRevenue = metrics?.reduce((s, m) => s + (m.revenue_total || 0), 0) || 0
  const totalProducts = metrics?.reduce((s, m) => s + (m.products_count || 0), 0) || 0
  const proStores = metrics?.filter((m) => m.plan_id === 'pro').length || 0
  const mrr = proStores * 29

  const metricCards = [
    {
      label: 'Tiendas activas',
      value: totalStores?.toString() || '0',
      Icon: Store,
      iconClass: 'text-indigo-500',
      bgClass: 'bg-indigo-500/10',
      accentClass: 'bg-indigo-500',
    },
    {
      label: 'MRR estimado',
      value: `$${mrr.toLocaleString()}`,
      Icon: TrendingUp,
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
      accentClass: 'bg-emerald-500',
    },
    {
      label: 'Revenue total',
      value: formatCurrency(totalRevenue),
      Icon: DollarSign,
      iconClass: 'text-green-500',
      bgClass: 'bg-green-500/10',
      accentClass: 'bg-green-500',
    },
    {
      label: 'Productos totales',
      value: totalProducts.toLocaleString(),
      Icon: Package,
      iconClass: 'text-violet-500',
      bgClass: 'bg-violet-500/10',
      accentClass: 'bg-violet-500',
    },
  ]

  const chartData = (stores || []).map((s) => ({
    name: s.name,
    products: s.products_count || 0,
    orders: s.orders_count || 0,
    plan: s.plan_id,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel maestro</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visión global de todas las tiendas en ShopFlow</p>
      </div>

      {/* Global metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricCards.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold">{m.value}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${m.bgClass}`}>
                  <m.Icon className={`h-5 w-5 ${m.iconClass}`} />
                </div>
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${m.accentClass}`} />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <StoreCharts stores={chartData} />

      {/* Stores table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las tiendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Tienda</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="hidden pb-3 text-left font-medium text-muted-foreground md:table-cell">Productos</th>
                  <th className="hidden pb-3 text-left font-medium text-muted-foreground md:table-cell">Pedidos</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Revenue</th>
                  <th className="hidden pb-3 text-left font-medium text-muted-foreground lg:table-cell">Creado</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stores?.map((store) => (
                  <tr key={store.id} className="transition-colors hover:bg-muted/50">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.slug}.shopflow.app</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={
                          store.plan_id === 'pro'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : store.plan_id === 'enterprise'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-muted text-muted-foreground'
                        }
                      >
                        {store.plan_id}
                      </Badge>
                    </td>
                    <td className="hidden py-3 pr-4 md:table-cell">{store.products_count || 0}</td>
                    <td className="hidden py-3 pr-4 md:table-cell">{store.orders_count || 0}</td>
                    <td className="py-3 pr-4 font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(store.revenue_total || 0)}
                    </td>
                    <td className="hidden py-3 pr-4 text-muted-foreground lg:table-cell">
                      {formatDate(store.created_at)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          store.is_active
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${store.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                        {store.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
