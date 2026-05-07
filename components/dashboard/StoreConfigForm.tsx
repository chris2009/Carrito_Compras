'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Store, Palette, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Tab = 'tienda' | 'tema' | 'contacto'

export function StoreConfigForm({ store }: { store: Record<string, unknown> }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('tienda')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: (store.name as string) || '',
    description: (store.description as string) || '',
    whatsapp: ((store.contact as { whatsapp?: string })?.whatsapp) || '',
    email: ((store.contact as { email?: string })?.email) || '',
    instagram: ((store.social as { instagram?: string })?.instagram) || '',
    facebook: ((store.social as { facebook?: string })?.facebook) || '',
    primary: ((store.theme as { primary?: string })?.primary) || '#6366f1',
  })

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('stores')
      .update({
        name: form.name,
        description: form.description,
        contact: { whatsapp: form.whatsapp, email: form.email },
        social: { instagram: form.instagram, facebook: form.facebook },
        theme: { ...(store.theme as object), primary: form.primary },
      })
      .eq('id', store.id as string)

    if (error) {
      toast.error('Error al guardar')
    } else {
      toast.success('Cambios guardados')
      router.refresh()
    }
    setLoading(false)
  }

  const TABS = [
    { id: 'tienda' as Tab, label: 'Tienda', icon: Store },
    { id: 'tema' as Tab, label: 'Tema', icon: Palette },
    { id: 'contacto' as Tab, label: 'Contacto', icon: Phone },
  ]

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex rounded-xl bg-indigo-50 p-1 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-indigo-500 hover:bg-indigo-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tienda */}
      {activeTab === 'tienda' && (
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader><CardTitle className="text-base text-indigo-700">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre de la tienda</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mi Tienda" />
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe tu tienda en pocas palabras..." />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tema */}
      {activeTab === 'tema' && (
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader><CardTitle className="text-base text-indigo-700">Color principal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">Este color se aplicará en los botones y acentos de tu tienda.</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={form.primary}
                onChange={(e) => setForm({ ...form, primary: e.target.value })}
                className="h-12 w-24 cursor-pointer rounded-lg border border-indigo-200"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Color seleccionado</p>
                <p className="text-xs text-gray-400 font-mono">{form.primary}</p>
              </div>
              <div className="h-10 w-10 rounded-full shadow-md border" style={{ background: form.primary }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacto */}
      {activeTab === 'contacto' && (
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader><CardTitle className="text-base text-indigo-700">Contacto y redes sociales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+51 999 123 456" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="tienda@ejemplo.com" />
            </div>
            <div className="space-y-1">
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@mitienda" />
            </div>
            <div className="space-y-1">
              <Label>Facebook</Label>
              <Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="mitienda" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón guardar */}
      <div className="flex justify-center pt-2 pb-6">
        <Button onClick={handleSave} disabled={loading} className="px-12 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-base font-semibold shadow-md">
          {loading
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
            : <><Save className="mr-2 h-4 w-4" />Guardar cambios</>}
        </Button>
      </div>
    </div>
  )
}
