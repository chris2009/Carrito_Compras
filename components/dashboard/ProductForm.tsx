'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/cn'
import { toast } from 'sonner'
import type { Product } from '@/lib/utils/types'

type Props = {
  store: { id: string; currency: string }
  categories: { id: string; name: string }[]
  product?: Product
}

export function ProductForm({ store, categories, product }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_desc: product?.short_desc || '',
    price: product?.price?.toString() || '',
    compare_price: product?.compare_price?.toString() || '',
    cost_price: product?.cost_price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    sku: product?.sku || '',
    category_id: product?.category_id ?? '',
    tags: product?.tags?.join(', ') || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    low_stock_alert: product?.low_stock_alert?.toString() || '5',
    images_text: product?.images?.map((i) => i.url).join('\n') || '',
  })

  function updateForm(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.stock) {
      toast.error('Nombre, precio y stock son requeridos')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const images = form.images_text
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, i) => ({ url, alt: form.name, is_primary: i === 0 }))

    const payload = {
      store_id: store.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      short_desc: form.short_desc || null,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      stock: parseInt(form.stock, 10),
      sku: form.sku || null,
      category_id: form.category_id || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      is_active: form.is_active,
      is_featured: form.is_featured,
      low_stock_alert: parseInt(form.low_stock_alert, 10),
      images,
    }

    let error
    if (product) {
      ;({ error } = await supabase.from('products').update(payload).eq('id', product.id))
    } else {
      ;({ error } = await supabase.from('products').insert(payload))
    }

    if (error) {
      toast.error(error.message || 'Error al guardar')
    } else {
      toast.success(product ? 'Producto actualizado' : 'Producto creado')
      router.push('/dashboard/productos')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
        <TabsTrigger value="inventario">Inventario</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-4 space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  updateForm('name', e.target.value)
                  if (!product) updateForm('slug', slugify(e.target.value))
                }}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="space-y-1">
              <Label>Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => updateForm('slug', slugify(e.target.value))}
                placeholder="nombre-del-producto"
              />
              <p className="text-xs text-gray-400">URL: /productos/{form.slug || 'nombre-del-producto'}</p>
            </div>
            <div className="space-y-1">
              <Label>Descripción corta</Label>
              <Input value={form.short_desc} onChange={(e) => updateForm('short_desc', e.target.value)} placeholder="Descripción breve para listados" maxLength={300} />
            </div>
            <div className="space-y-1">
              <Label>Descripción completa</Label>
              <Textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={5} placeholder="Descripción detallada del producto..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Precio * ({store.currency})</Label>
                <Input value={form.price} onChange={(e) => updateForm('price', e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label>Precio tachado</Label>
                <Input value={form.compare_price} onChange={(e) => updateForm('compare_price', e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Categoría</Label>
              <Select value={form.category_id ?? ''} onValueChange={(v) => updateForm('category_id', v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tags (separados por coma)</Label>
              <Input value={form.tags} onChange={(e) => updateForm('tags', e.target.value)} placeholder="apple, iphone, smartphone" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => updateForm('is_active', v)} />
                <Label>Activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => updateForm('is_featured', v)} />
                <Label>Destacado</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="imagenes" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">URLs de imágenes</CardTitle></CardHeader>
          <CardContent>
            <Label className="mb-2 block">Una URL por línea (la primera será la imagen principal)</Label>
            <Textarea
              value={form.images_text}
              onChange={(e) => updateForm('images_text', e.target.value)}
              rows={6}
              placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
            />
            <p className="mt-1 text-xs text-gray-400">Puedes pegar URLs de imágenes de Unsplash, tu Storage de Supabase u otro hosting.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inventario" className="mt-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Stock *</Label>
                <Input value={form.stock} onChange={(e) => updateForm('stock', e.target.value)} type="number" min="0" />
              </div>
              <div className="space-y-1">
                <Label>Alerta stock bajo</Label>
                <Input value={form.low_stock_alert} onChange={(e) => updateForm('low_stock_alert', e.target.value)} type="number" min="0" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => updateForm('sku', e.target.value)} placeholder="APL-IP15P-256" />
            </div>
            <div className="space-y-1">
              <Label>Costo ({store.currency})</Label>
              <Input value={form.cost_price} onChange={(e) => updateForm('cost_price', e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" />
              <p className="text-xs text-gray-400">Solo visible para ti, no se muestra a compradores</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <Button onClick={handleSave} disabled={loading} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : <><Save className="mr-2 h-4 w-4" />{product ? 'Guardar cambios' : 'Crear producto'}</>}
      </Button>
    </Tabs>
  )
}
