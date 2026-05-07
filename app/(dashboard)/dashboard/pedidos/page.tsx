import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/cn'
import type { Order, OrderStatus } from '@/lib/utils/types'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('id, currency').eq('owner_id', user.id).limit(1).single()
  if (!store) redirect('/onboarding')

  const params = await searchParams
  const status = (params.estado as OrderStatus) || undefined

  let query = supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)

  const { data: orders } = await query

  const tabs = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>

      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {tabs.map((tab) => (
            <a
              key={tab.value}
              href={`/dashboard/pedidos${tab.value ? `?estado=${tab.value}` : ''}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                (status || '') === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p>No hay pedidos en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Nro. Pedido</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(orders as Order[]).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{(order.fulfillment_data as { customer_name?: string })?.customer_name || '—'}</p>
                      <p className="text-xs text-gray-400">{order.customer_email}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
