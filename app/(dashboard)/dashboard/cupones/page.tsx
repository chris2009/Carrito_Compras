import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

export default async function CuponesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
  if (!store) redirect('/onboarding')

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  const discountLabel = (type: string, value: number) => {
    if (type === 'percentage') return `${value}% OFF`
    if (type === 'fixed_amount') return `$${value} OFF`
    return 'Envío gratis'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cupones de descuento</h1>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {!coupons || coupons.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <Tag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No tienes cupones creados</p>
            <p className="mt-1 text-sm">Los cupones se crean directamente en Supabase por ahora</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Código</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Descuento</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">Usos</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">Vence</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-indigo-100 text-indigo-800">{discountLabel(c.discount_type, c.value)}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                      {c.uses_count}/{c.max_uses || '∞'}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                      {c.expires_at ? formatDate(c.expires_at) : 'Sin vencimiento'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? 'default' : 'secondary'} className={c.is_active ? 'bg-green-100 text-green-800' : ''}>
                        {c.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
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
