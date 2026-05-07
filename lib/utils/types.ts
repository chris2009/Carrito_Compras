export type Plan = {
  id: string
  name: string
  price_usd: number
  max_products: number
  max_images: number
  features: string[]
  is_active: boolean
}

export type Store = {
  id: string
  owner_id: string
  plan_id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  custom_domain: string | null
  currency: string
  locale: string
  country: string
  theme: {
    primary: string
    secondary: string
    accent: string
    font: string
  }
  contact: {
    email?: string
    phone?: string
    whatsapp?: string
    address?: string
  }
  social: {
    instagram?: string
    facebook?: string
    tiktok?: string
  }
  settings: {
    allow_guest_checkout: boolean
    show_stock: boolean
    low_stock_threshold: number
    shipping_enabled: boolean
    tax_rate: number
  }
  is_active: boolean
  onboarding_completed: boolean
  products_count: number
  orders_count: number
  revenue_total: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  store_id: string
  parent_id: string | null
  name: string
  slug: string
  image_url: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type ProductImage = {
  url: string
  alt: string
  sort_order?: number
  is_primary: boolean
}

export type Product = {
  id: string
  store_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  short_desc: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  weight_grams: number | null
  images: ProductImage[]
  tags: string[]
  attributes: Record<string, string>
  is_active: boolean
  is_featured: boolean
  stock: number
  low_stock_alert: number
  import_batch_id: string | null
  view_count: number
  sale_count: number
  created_at: string
  updated_at: string
  categories?: Category
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type OrderItem = {
  product_id: string
  name: string
  price: number
  qty: number
  image?: string
  variant?: string
}

export type Order = {
  id: string
  store_id: string
  customer_id: string | null
  order_number: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  discount_code: string | null
  discount_amount: number
  shipping_cost: number
  tax_amount: number
  total: number
  currency: string
  shipping_addr: Record<string, string> | null
  customer_email: string | null
  customer_phone: string | null
  notes: string | null
  stripe_session_id: string | null
  stripe_payment_id: string | null
  fulfillment_data: Record<string, string | undefined>
  created_at: string
  updated_at: string
}

export type CartItem = {
  product_id: string
  name: string
  price: number
  image: string
  qty: number
  stock: number
  slug: string
}

export type ImportBatch = {
  id: string
  store_id: string
  filename: string
  file_type: string
  total_rows: number
  processed: number
  succeeded: number
  failed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errors: Array<{ row: number; column: string; message: string }>
  created_at: string
  completed_at: string | null
}
