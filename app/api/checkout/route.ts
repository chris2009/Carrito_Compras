import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/lib/utils/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { items, customer, coupon_code } = await request.json() as {
      items: CartItem[]
      customer: { email: string; name: string; phone: string; address: string; city: string }
      coupon_code?: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const supabase = await createClient()
    const slug = request.headers.get('x-store-slug') || 'techhub'

    const { data: store } = await supabase
      .from('stores')
      .select('id, name, currency')
      .eq('slug', slug)
      .single()

    if (!store) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

    // Validate stock
    const productIds = items.map((i) => i.product_id)
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds)
      .eq('store_id', store.id)
      .eq('is_active', true)

    for (const item of items) {
      const dbProduct = dbProducts?.find((p) => p.id === item.product_id)
      if (!dbProduct) return NextResponse.json({ error: `Producto no encontrado: ${item.name}` }, { status: 400 })
      if (dbProduct.stock < item.qty) return NextResponse.json({ error: `Stock insuficiente para: ${item.name}` }, { status: 400 })
    }

    // Validate coupon if provided
    let discountStripeId: string | undefined
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .ilike('code', coupon_code)
        .single()

      if (coupon) {
        if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
          if (!coupon.max_uses || coupon.uses_count < coupon.max_uses) {
            // Create or retrieve Stripe coupon
            const stripeCoupon = await stripe.coupons.create({
              ...(coupon.discount_type === 'percentage'
                ? { percent_off: coupon.value }
                : { amount_off: Math.round(coupon.value * 100), currency: store.currency.toLowerCase() }),
              duration: 'once',
            })
            discountStripeId = stripeCoupon.id
          }
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const storeQuery = `?store=${slug}`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer.email,
      line_items: items.map((item) => ({
        price_data: {
          currency: store.currency.toLowerCase(),
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      ...(discountStripeId ? { discounts: [{ coupon: discountStripeId }] } : {}),
      metadata: {
        store_id: store.id,
        store_slug: slug,
        coupon_code: coupon_code || '',
        customer_email: customer.email,
        customer_name: customer.name,
        customer_phone: customer.phone,
        shipping_address: JSON.stringify({ address: customer.address, city: customer.city }),
      },
      success_url: `${baseUrl}/checkout/exito${storeQuery}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout${storeQuery}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
