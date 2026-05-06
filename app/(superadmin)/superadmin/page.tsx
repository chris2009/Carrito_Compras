import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SuperAdminPage() {
  const supabase = await createClient()

  const [{ data: stores }, { count: totalStores }, { data: metrics }] = await Promise.all([
    supabase.from('stores').select('*, plans(name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('stores').select('revenue_total, products_count, orders_count, plan_id'),
  ])

  const totalRevenue = metrics?.reduce((s, m) => s + (m.revenue_total || 0), 0) || 0
  const totalProducts = metrics?.reduce((s, m) => s + (m.products_count || 0), 0) || 0
  const proStores = metrics?.filter((m) => m.plan_id === 'pro').length || 0
  const mrr = proStores * 29

  return (
    <div className="space-y-8 max-w-7xl">
      <h1 className="text-3xl font-bold">Panel maestro</h1>

      {/* Global metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tiendas activas', value: totalStores?.toString() || '0' },
          { label: 'MRR estimado', value: `$${mrr.toLocaleString()}` },
          { label: 'Revenue total', value: formatCurrency(totalRevenue) },
          { label: 'Productos totales', value: totalProducts.toLocaleString() },
        ].map((m) => (
          <Card key={m.label} className="border-gray-800 bg-gray-900">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400">{m.label}</p>
              <p className="text-2xl font-bold text-white">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stores table */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">Todas las tiendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="pb-2 text-left font-medium text-gray-400">Tienda</th>
                  <th className="pb-2 text-left font-medium text-gray-400">Plan</th>
                  <th className="hidden pb-2 text-left font-medium text-gray-400 md:table-cell">Productos</th>
                  <th className="hidden pb-2 text-left font-medium text-gray-400 md:table-cell">Pedidos</th>
                  <th className="pb-2 text-left font-medium text-gray-400">Revenue</th>
                  <th className="hidden pb-2 text-left font-medium text-gray-400 lg:table-cell">Creado</th>
                  <th className="pb-2 text-left font-medium text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stores?.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-800">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{store.name}</p>
                      <p className="text-xs text-gray-500">{store.slug}.shopflow.app</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={`${store.plan_id === 'pro' ? 'bg-indigo-900 text-indigo-300' : store.plan_id === 'enterprise' ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-400'}`}
                      >
                        {store.plan_id}
                      </Badge>
                    </td>
                    <td className="hidden py-3 pr-4 md:table-cell">{store.products_count || 0}</td>
                    <td className="hidden py-3 pr-4 md:table-cell">{store.orders_count || 0}</td>
                    <td className="py-3 pr-4 font-medium text-green-400">
                      {formatCurrency(store.revenue_total || 0)}
                    </td>
                    <td className="hidden py-3 pr-4 text-gray-500 lg:table-cell">
                      {formatDate(store.created_at)}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${store.is_active ? 'text-green-400' : 'text-red-400'}`}>
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
