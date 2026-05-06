import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!store) redirect('/onboarding')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar store={store} user={user} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen p-4 pb-20 md:p-8 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
