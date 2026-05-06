import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { code, store_id } = await request.json()

  if (!code || !store_id) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', store_id)
    .eq('is_active', true)
    .ilike('code', code)
    .single()

  if (!coupon) {
    return NextResponse.json({ error: 'Cupón no encontrado o inactivo' }, { status: 404 })
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 })
  }

  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 })
  }

  return NextResponse.json({
    coupon: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
    },
  })
}
