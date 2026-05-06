import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StoreConfigForm } from '@/components/dashboard/StoreConfigForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  if (!store) redirect('/onboarding')

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Configuración de tienda</h1>
      <StoreConfigForm store={store} />
    </div>
  )
}
