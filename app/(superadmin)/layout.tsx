import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.SUPERADMIN_EMAIL) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-xs font-bold">SA</div>
            <span className="font-semibold">ShopFlow SuperAdmin</span>
          </div>
          <span className="text-sm text-gray-400">{user.email}</span>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
