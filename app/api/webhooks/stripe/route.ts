import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata || {}

    try {
      const supabase = await createServiceClient()

      // Get line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const items = lineItems.data.map((li) => ({
        name: li.description,
        price: (li.amount_total || 0) / 100,
        qty: li.quantity || 1,
      }))

      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
      const total = (session.amount_total || 0) / 100
      const discount = subtotal - total

      // Create order
      await supabase.from('orders').insert({
        store_id: meta.store_id,
        customer_email: meta.customer_email,
        customer_phone: meta.customer_phone,
        status: 'confirmed',
        items,
        subtotal,
        discount_code: meta.coupon_code || null,
        discount_amount: discount,
        total,
        currency: session.currency?.toUpperCase() || 'USD',
        shipping_addr: meta.shipping_address ? JSON.parse(meta.shipping_address) : null,
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent as string,
        fulfillment_data: { customer_name: meta.customer_name },
      })

      // Update store revenue
      await supabase.rpc('increment_store_revenue', {
        p_store_id: meta.store_id,
        p_amount: total,
      })

    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
