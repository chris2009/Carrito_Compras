'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Menu, X, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useCartStore } from '@/lib/store/cart'
import { CartDrawer } from './CartDrawer'
import type { Store as StoreType } from '@/lib/supabase/store-context'

export function StoreHeader({ store }: { store: StoreType }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const count = useCartStore((s) => s.count())

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          {/* Logo + Name */}
          <Link href={`/?store=${store.slug}`} className="flex items-center gap-2 min-w-0 flex-shrink-0">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: store.theme.primary }}>
                <Store className="h-5 w-5" />
              </div>
            )}
            <span className="hidden font-bold text-gray-900 dark:text-white sm:block truncate max-w-[160px]">
              {store.name}
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden flex-1 max-w-md md:flex">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery) window.location.href = `/productos?q=${encodeURIComponent(searchQuery)}&store=${store.slug}`
              }}
              className="flex w-full gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Buscar productos..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            {/* Cart */}
            <Sheet>
              <SheetTrigger className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    style={{ background: store.theme.primary }}
                  >
                    {count > 9 ? '9+' : count}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <CartDrawer store={store} />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 md:hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery) window.location.href = `/productos?q=${encodeURIComponent(searchQuery)}&store=${store.slug}`
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Buscar productos..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              </div>
              <Button type="submit" size="sm" style={{ background: store.theme.primary }}>Buscar</Button>
            </form>
            <nav className="mt-3 flex flex-col gap-1">
              <Link href={`/?store=${store.slug}`} className="rounded px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
              <Link href={`/productos?store=${store.slug}`} className="rounded px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Productos</Link>
            </nav>
          </div>
        )}

        {/* Desktop nav */}
        <nav className="hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 md:block">
          <div className="mx-auto flex max-w-6xl gap-6">
            <Link href={`/?store=${store.slug}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Inicio</Link>
            <Link href={`/productos?store=${store.slug}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Todos los productos</Link>
          </div>
        </nav>
      </header>
    </>
  )
}
