'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Store, Palette, Phone, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/cn'

const STEPS = [
  { id: 1, title: 'Tu tienda', icon: Store },
  { id: 2, title: 'Personaliza', icon: Palette },
  { id: 3, title: 'Contacto', icon: Phone },
  { id: 4, title: '¡Listo!', icon: Rocket },
]

const VERTICALS = [
  'Electrónica y tecnología', 'Ropa y moda', 'Calzado', 'Deportes y fitness',
  'Hogar y jardín', 'Alimentos y bebidas', 'Belleza y cuidado personal',
  'Repuestos y autos', 'Juguetes y niños', 'Libros y educación',
  'Arte y manualidades', 'Mascotas', 'Servicios', 'Otro',
]

const CURRENCIES = [
  { value: 'USD', label: 'USD — Dólar americano' },
  { value: 'PEN', label: 'PEN — Sol peruano' },
  { value: 'CLP', label: 'CLP — Peso chileno' },
  { value: 'COP', label: 'COP — Peso colombiano' },
  { value: 'MXN', label: 'MXN — Peso mexicano' },
  { value: 'ARS', label: 'ARS — Peso argentino' },
  { value: 'BRL', label: 'BRL — Real brasileño' },
]

const THEME_COLORS = [
  { name: 'Índigo', primary: '#6366f1', secondary: '#06b6d4' },
  { name: 'Rosa', primary: '#ec4899', secondary: '#f97316' },
  { name: 'Verde', primary: '#10b981', secondary: '#06b6d4' },
  { name: 'Naranja', primary: '#f97316', secondary: '#eab308' },
  { name: 'Azul', primary: '#3b82f6', secondary: '#6366f1' },
  { name: 'Violeta', primary: '#8b5cf6', secondary: '#ec4899' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    vertical: '',
    description: '',
    selectedColor: 0,
    primaryColor: THEME_COLORS[0].primary,
    secondaryColor: THEME_COLORS[0].secondary,
    whatsapp: '',
    email: '',
    currency: 'USD',
    country: 'PE',
  })

  const updateForm = (key: string, value: string | number | null) =>
    setForm((prev) => ({ ...prev, [key]: value ?? '' }))

  const checkSlug = useCallback(
    async (slug: string) => {
      if (slug.length < 4) return
      setCheckingSlug(true)
      const supabase = createClient()
      const { data } = await supabase.from('stores').select('id').eq('slug', slug).single()
      setSlugAvailable(!data)
      setCheckingSlug(false)
    },
    []
  )

  useEffect(() => {
    if (form.slug.length >= 4) {
      const t = setTimeout(() => checkSlug(form.slug), 500)
      return () => clearTimeout(t)
    }
  }, [form.slug, checkSlug])

  useEffect(() => {
    if (form.name) {
      updateForm('slug', slugify(form.name))
    }
  }, [form.name])

  async function createStore() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { error } = await supabase.from('stores').insert({
        owner_id: user.id,
        slug: form.slug,
        name: form.name,
        description: form.description,
        currency: form.currency,
        country: form.country,
        theme: {
          primary: form.primaryColor,
          secondary: form.secondaryColor,
          accent: '#f59e0b',
          font: 'inter',
        },
        contact: {
          whatsapp: form.whatsapp,
          email: form.email || user.email,
        },
        onboarding_completed: true,
      })

      if (error) throw error
      setStep(4)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canGoNext = () => {
    if (step === 1) return form.name.length >= 3 && form.slug.length >= 4 && slugAvailable && form.vertical
    if (step === 2) return true
    if (step === 3) return form.whatsapp.length >= 7 || form.email.length >= 5
    return true
  }

  async function handleNext() {
    if (step === 3) {
      await createStore()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step > s.id
                      ? 'bg-green-500 text-white'
                      : step === s.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-1 h-1 w-12 rounded-full sm:w-16 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Paso {Math.min(step, 3)} de 3 — {STEPS[Math.min(step, 4) - 1]?.title}
          </p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">¿Cómo se llama tu tienda?</h2>
              <div className="space-y-1">
                <Label>Nombre de la tienda *</Label>
                <Input
                  placeholder="Ej: TechHub Lima"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="space-y-1">
                <Label>URL de tu tienda *</Label>
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="mi-tienda"
                    value={form.slug}
                    onChange={(e) => updateForm('slug', slugify(e.target.value))}
                    className={`flex-1 ${slugAvailable === false ? 'border-red-400' : slugAvailable === true ? 'border-green-400' : ''}`}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">.shopflow.app</span>
                </div>
                <div className="text-xs">
                  {checkingSlug && <span className="text-gray-400">Verificando...</span>}
                  {!checkingSlug && slugAvailable === true && (
                    <span className="text-green-600">Disponible</span>
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <span className="text-red-500">No disponible, prueba otro</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Tu tienda: <strong>{form.slug || 'mi-tienda'}.shopflow.app</strong>
                </p>
              </div>
              <div className="space-y-1">
                <Label>Tipo de negocio *</Label>
                <Select value={form.vertical} onValueChange={(v) => updateForm('vertical', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERTICALS.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Personaliza tu tienda</h2>
              <div className="space-y-1">
                <Label>Descripción corta</Label>
                <Textarea
                  placeholder="Describe tu tienda en 1-2 oraciones..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-right text-xs text-gray-400">{form.description.length}/200</p>
              </div>
              <div className="space-y-2">
                <Label>Color principal</Label>
                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        updateForm('selectedColor', i)
                        updateForm('primaryColor', c.primary)
                        updateForm('secondaryColor', c.secondary)
                      }}
                      className={`h-10 w-10 rounded-full transition-transform hover:scale-110 ${
                        form.selectedColor === i ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : ''
                      }`}
                      style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ background: `linear-gradient(135deg, ${form.primaryColor}20, ${form.secondaryColor}20)` }}>
                <p className="text-sm text-gray-600">Vista previa del color:</p>
                <div className="mt-2 flex gap-2">
                  <div className="h-8 w-8 rounded" style={{ background: form.primaryColor }} />
                  <div className="h-8 w-8 rounded" style={{ background: form.secondaryColor }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Información de contacto</h2>
              <div className="space-y-1">
                <Label>WhatsApp *</Label>
                <Input
                  placeholder="+51 999 123 456"
                  value={form.whatsapp}
                  onChange={(e) => updateForm('whatsapp', e.target.value)}
                  type="tel"
                />
                <p className="text-xs text-gray-400">Tus clientes podrán contactarte directamente</p>
              </div>
              <div className="space-y-1">
                <Label>Email de contacto</Label>
                <Input
                  placeholder="hola@tutienda.com"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  type="email"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>País</Label>
                  <Select value={form.country} onValueChange={(v) => updateForm('country', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PE">🇵🇪 Perú</SelectItem>
                      <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                      <SelectItem value="MX">🇲🇽 México</SelectItem>
                      <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                      <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="EC">🇪🇨 Ecuador</SelectItem>
                      <SelectItem value="BO">🇧🇴 Bolivia</SelectItem>
                      <SelectItem value="US">🇺🇸 USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Moneda</Label>
                  <Select value={form.currency} onValueChange={(v) => updateForm('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Done! */}
        {step === 4 && (
          <Card>
            <CardContent className="pt-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Rocket className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¡Tu tienda está lista!</h2>
              <p className="text-gray-600">
                Ya puedes acceder a tu tienda en:
              </p>
              <div className="rounded-lg bg-indigo-50 px-4 py-3">
                <a
                  href={`/?store=${form.slug}`}
                  target="_blank"
                  className="font-mono text-indigo-700 hover:underline"
                >
                  {form.slug}.shopflow.app
                </a>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => router.push('/dashboard')}
                >
                  Ir a mi panel
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/dashboard/productos/nuevo')}
                >
                  Agregar mi primer producto
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push(`/?store=${form.slug}`)}
                >
                  Ver mi tienda
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="mt-4 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
            >
              Atrás
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleNext}
              disabled={!canGoNext() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : step === 3 ? (
                'Crear mi tienda'
              ) : (
                'Siguiente'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
