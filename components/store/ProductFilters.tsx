'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Category } from '@/lib/utils/types'

type Props = {
  categories: Category[]
  currentParams: Record<string, string | undefined>
  primaryColor: string
  storeSlug?: string
  mobile?: boolean
}

function FiltersContent({ categories, currentParams, primaryColor, storeSlug }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    if (storeSlug) params.set('store', storeSlug)
    router.push(`/productos?${params.toString()}`)
  }

  const sortOptions = [
    { value: 'popular', label: 'Más vendidos' },
    { value: 'newest', label: 'Más nuevos' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
  ]

  return (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Ordenar por</Label>
        <div className="flex flex-col gap-1">
          {sortOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => updateParam('orden', o.value)}
              className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                (currentParams.orden || 'popular') === o.value
                  ? 'font-semibold text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={
                (currentParams.orden || 'popular') === o.value
                  ? { background: primaryColor }
                  : {}
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Categoría</Label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => updateParam('categoria', null)}
              className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                !currentParams.categoria
                  ? 'font-semibold text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={!currentParams.categoria ? { background: primaryColor } : {}}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParam('categoria', cat.slug)}
                className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                  currentParams.categoria === cat.slug
                    ? 'font-semibold text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={currentParams.categoria === cat.slug ? { background: primaryColor } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Stock filter */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Disponibilidad</Label>
        <button
          onClick={() => updateParam('stock', currentParams.stock === '1' ? null : '1')}
          className={`rounded px-3 py-1.5 text-left text-sm w-full transition-colors ${
            currentParams.stock === '1'
              ? 'font-semibold text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={currentParams.stock === '1' ? { background: primaryColor } : {}}
        >
          Solo en stock
        </button>
      </div>

      {/* Clear */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-gray-500"
        onClick={() => router.push(storeSlug ? `/productos?store=${storeSlug}` : '/productos')}
      >
        Limpiar filtros
      </Button>
    </div>
  )
}

export function ProductFilters(props: Props) {
  if (props.mobile) {
    return (
      <Sheet>
        <SheetTrigger className="flex-shrink-0 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FiltersContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <FiltersContent {...props} />
    </div>
  )
}
