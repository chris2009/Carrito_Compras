'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Upload, ShoppingBag, Users,
  Tag, Settings, ExternalLink, LogOut, Store, ChevronRight, ShieldCheck, Camera, Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/productos/importar', label: 'Importar Excel', icon: Upload },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/cupones', label: 'Cupones', icon: Tag },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

type Props = {
  store: {
    slug: string
    name: string
    logo_url: string | null
    plan_id: string
    theme: { primary: string }
  }
  user: User
  isSuperAdmin: boolean
}

export function DashboardSidebar({ store, user, isSuperAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (user.user_metadata?.avatar_url as string) || null
  )
  const [uploading, setUploading] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path)
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      setAvatarUrl(publicUrl)
    } catch (err) {
      console.error('Error al subir avatar:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const initials = (user.email || 'U').slice(0, 2).toUpperCase()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r bg-white md:flex md:flex-col">
        {/* Store header */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: store.theme.primary }}>
                <Store className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{store.name}</p>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs capitalize">{store.plan_id}</Badge>
              </div>
            </div>
          </div>
          <Link
            href={`/?store=${store.slug}`}
            target="_blank"
            className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Ver mi tienda
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-1',
                    active
                      ? 'bg-indigo-50 font-medium text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                  {active && <ChevronRight className="ml-auto h-3 w-3" />}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Super Admin link */}
        {isSuperAdmin && (
          <div className="px-3 pb-2">
            <Link href="/superadmin">
              <div className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                Super Admin
              </div>
            </Link>
          </div>
        )}

        {/* User */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50">
            {/* Avatar con upload al hacer clic */}
            <div
              className="relative cursor-pointer group flex-shrink-0"
              onClick={() => !uploading && fileInputRef.current?.click()}
              title="Cambiar foto de perfil"
            >
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={user.email || ''} />}
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading
                  ? <Loader2 className="h-3 w-3 text-white animate-spin" />
                  : <Camera className="h-3 w-3 text-white" />
                }
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-gray-900">{user.email}</p>
              <p className="text-[10px] text-gray-400">Clic en foto para cambiar</p>
            </div>
            <button onClick={handleSignOut} title="Cerrar sesión" className="text-gray-400 hover:text-gray-700">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <nav className="flex items-center justify-around py-1">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg',
                  active ? 'text-indigo-700' : 'text-gray-500'
                )}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label.split(' ')[0]}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
