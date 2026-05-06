'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function StoreConfigForm({ store }: { store: Record<string, unknown> }) {
  const router = useRouter()
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

  return (
    <Tabs defaultValue="tienda">
      <TabsList>
        <TabsTrigger value="tienda">Tienda</TabsTrigger>
        <TabsTrigger value="tema">Tema</TabsTrigger>
        <TabsTrigger value="contacto">Contacto</TabsTrigger>
      </TabsList>

      <TabsContent value="tienda" className="space-y-4 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre de la tienda</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tema" className="space-y-4 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Color principal</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primary}
                onChange={(e) => setForm({ ...form, primary: e.target.value })}
                className="h-10 w-20 cursor-pointer rounded border"
              />
              <span className="text-sm text-gray-600">{form.primary}</span>
              <div className="h-8 w-8 rounded" style={{ background: form.primary }} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contacto" className="space-y-4 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Contacto y redes sociales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+51 999 123 456" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
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
      </TabsContent>

      <Button onClick={handleSave} disabled={loading} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : <><Save className="mr-2 h-4 w-4" />Guardar cambios</>}
      </Button>
    </Tabs>
  )
}
