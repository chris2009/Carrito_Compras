import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/cn'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('id, currency').eq('owner_id', user.id).single()
  if (!store) redirect('/onboarding')

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', store.id)
    .order('total_spent', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {!customers || customers.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p>Aún no tienes clientes registrados</p>
            <p className="mt-1 text-sm">Los clientes aparecerán aquí cuando completen una compra</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">Teléfono</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Pedidos</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Total gastado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sin nombre'}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{c.phone || '—'}</td>
                    <td className="px-4 py-3">{c.total_orders || 0}</td>
                    <td className="px-4 py-3 font-medium text-green-600">
                      {formatCurrency(c.total_spent || 0, store.currency)}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                      {formatDate(c.created_at)}
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
