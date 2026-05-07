import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/ProductForm'

export default async function NuevoProductoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('id, currency, plan_id').eq('owner_id', user.id).limit(1).single()
  if (!store) redirect('/onboarding')

  const { data: categories } = await supabase.from('categories').select('id, name').eq('store_id', store.id).eq('is_active', true)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
      <ProductForm store={store} categories={categories || []} />
    </div>
  )
}
