import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/lib/utils/types'

type Coupon = {
  code: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
}

type CartStore = {
  items: CartItem[]
  coupon: Coupon | null
  storeSlug: string | null
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (product_id: string) => void
  updateQty: (product_id: string, qty: number) => void
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  clearCart: () => void
  setStoreSlug: (slug: string) => void
  count: () => number
  subtotal: () => number
  discountAmount: () => number
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      storeSlug: null,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, qty: Math.min(i.qty + 1, i.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, qty: 1 }] }
        })
      },

      removeItem: (product_id) =>
        set((state) => ({ items: state.items.filter((i) => i.product_id !== product_id) })),

      updateQty: (product_id, qty) => {
        if (qty <= 0) {
          get().removeItem(product_id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id ? { ...i, qty: Math.min(qty, i.stock) } : i
          ),
        }))
      },

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      clearCart: () => set({ items: [], coupon: null }),
      setStoreSlug: (slug) => set({ storeSlug: slug }),

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      discountAmount: () => {
        const { coupon, subtotal } = get()
        if (!coupon) return 0
        if (coupon.discount_type === 'percentage') return subtotal() * (coupon.value / 100)
        if (coupon.discount_type === 'fixed_amount') return Math.min(coupon.value, subtotal())
        return 0
      },

      total: () => {
        const { subtotal, discountAmount } = get()
        return Math.max(0, subtotal() - discountAmount())
      },
    }),
    { name: 'shopflow-cart' }
  )
)
