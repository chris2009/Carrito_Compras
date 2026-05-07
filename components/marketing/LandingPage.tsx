import Link from 'next/link'
import { ArrowRight, ShoppingBag, Upload, Globe, Smartphone, BarChart3, Zap, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Zap,
    title: 'Tu tienda en 3 minutos',
    desc: 'Regístrate, elige el nombre y listo. Tu tienda queda en {slug}.shopflow.app al instante.',
  },
  {
    icon: Upload,
    title: 'Importa desde Excel',
    desc: 'Carga 100 productos en segundos subiendo un Excel o CSV. Con plantilla lista para usar.',
  },
  {
    icon: Globe,
    title: 'Cobra con Stripe',
    desc: 'Pagos seguros en cualquier moneda. Transferencias automáticas a tu cuenta bancaria.',
  },
  {
    icon: Smartphone,
    title: '100% Mobile-Ready',
    desc: 'Tu tienda se ve perfecta en celular. El 80% de tus compradores entran desde el teléfono.',
  },
  {
    icon: BarChart3,
    title: 'Panel de vendedor',
    desc: 'Gestiona pedidos, ve métricas en tiempo real y controla tu inventario desde cualquier lugar.',
  },
  {
    icon: ShoppingBag,
    title: 'Para cualquier negocio',
    desc: 'Electrónica, ropa, repuestos, alimentos, servicios y más. Sin límites de categoría.',
  },
]

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    desc: 'Para empezar a vender',
    features: ['Hasta 50 productos', 'Stripe Checkout', 'Import CSV (50 filas)', 'Subdominio .shopflow.app', 'Soporte por email'],
    cta: 'Crear mi tienda gratis',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    desc: 'Para vender sin límites',
    features: ['Productos ilimitados', 'Import Excel ilimitado', 'Analytics avanzado', 'Dominio custom', 'Hasta 10 imágenes/producto', 'Soporte prioritario'],
    cta: 'Empezar Pro',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    desc: 'Para equipos y grandes negocios',
    features: ['Todo Pro incluido', 'Multi-usuario', 'API acceso', 'SLA 99.9%', 'Hasta 20 imágenes/producto', 'Soporte dedicado'],
    cta: 'Contactar ventas',
    highlight: false,
  },
]

const verticals = ['Electrónica', 'Ropa y moda', 'Repuestos autos', 'Deportes', 'Hogar', 'Alimentos', 'Servicios', 'Manualidades']

const testimonials = [
  { name: 'Carlos M.', store: 'TechHub Lima', text: 'En 10 minutos tenía mi tienda lista. Importé 200 productos desde Excel y empecé a vender ese mismo día.', rating: 5 },
  { name: 'María S.', store: 'ModaFit', text: 'Mis clientes compran desde el celular sin problemas. Las ventas aumentaron 3x desde que migré a ShopFlow.', rating: 5 },
  { name: 'Roberto A.', store: 'AutoRepuestos', text: 'El panel de pedidos es increíble. Puedo ver todo desde mi teléfono cuando estoy en el taller.', rating: 5 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">ShopFlow</span>
          </div>
          <div className="hidden gap-6 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Características</a>
            <a href="#planes" className="text-sm text-gray-600 hover:text-gray-900">Planes</a>
            <a href="#testimonios" className="text-sm text-gray-600 hover:text-gray-900">Testimonios</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Ingresar</Button>
            </Link>
            <Link href="/registro">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Crear tienda gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
            Nuevo: Import masivo desde Excel
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
            Tu tienda online{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              en 3 minutos
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl">
            Crea tu tienda, carga tus productos desde Excel y empieza a cobrar con Stripe.
            Sin saber programar. Sin tarjeta de crédito.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/registro">
              <Button size="lg" className="w-full bg-indigo-600 text-base hover:bg-indigo-700 sm:w-auto">
                Crear mi tienda gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/?store=techhub">
              <Button size="lg" variant="outline" className="w-full text-base sm:w-auto">
                Ver tienda demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">Sin tarjeta de crédito · Free para siempre en plan básico</p>
        </div>

        {/* Floating verticals */}
        <div className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-2">
          {verticals.map((v) => (
            <span key={v} className="rounded-full border bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
              {v}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Todo lo que necesitas para vender online
            </h2>
            <p className="text-lg text-gray-600">Sin complicaciones técnicas. Sin costos escondidos.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <f.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Así de fácil es empezar</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Crea tu cuenta', desc: 'Regístrate con email o Google en menos de 1 minuto.' },
              { step: '2', title: 'Configura tu tienda', desc: 'Elige nombre, sube tu logo y obtén tu subdominio propio.' },
              { step: '3', title: 'Carga y vende', desc: 'Agrega productos manualmente o importa desde Excel. ¡Listo!' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Planes simples y transparentes</h2>
            <p className="text-lg text-gray-600">Empieza gratis. Escala cuando lo necesites.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${plan.highlight ? 'border-2 border-indigo-600 shadow-lg' : 'border shadow-sm'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white">Más popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    {plan.price > 0 && <span className="mb-1 text-gray-500">/mes</span>}
                    {plan.price === 0 && <span className="mb-1 text-gray-500">para siempre</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.id === 'enterprise' ? '/contacto' : '/registro'} className="w-full">
                    <Button
                      className={`w-full ${plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                      variant={plan.highlight ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Lo que dicen nuestros vendedores</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-3 flex">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-700">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.store}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-indigo-600 px-4 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            ¿Listo para empezar a vender?
          </h2>
          <p className="mb-8 text-indigo-200">
            Únete a miles de vendedores que ya tienen su tienda en ShopFlow.
          </p>
          <Link href="/registro">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 text-base font-semibold">
              Crear mi tienda gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold">ShopFlow</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 ShopFlow. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Términos</a>
            <a href="#" className="hover:text-gray-900">Privacidad</a>
            <a href="#" className="hover:text-gray-900">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
