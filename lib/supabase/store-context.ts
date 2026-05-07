import { cache } from 'react'
import { createClient } from './server'

export type Store = {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  currency: string
  locale: string
  country: string
  theme: {
    primary: string
    secondary: string
    accent: string
    font: string
  }
  contact: Record<string, string>
  social: Record<string, string>
  settings: {
    allow_guest_checkout: boolean
    show_stock: boolean
    low_stock_threshold: number
    shipping_enabled: boolean
    tax_rate: number
  }
  plan_id: string
  is_active: boolean
}

export const getCurrentStore = cache(async (slug: string): Promise<Store | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return data as Store | null
})
