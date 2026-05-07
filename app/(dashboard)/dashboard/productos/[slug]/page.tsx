import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/dashboard/ProductForm'
import type { Product } from '@/lib/utils/types'

export default async function EditarProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('id, currency').eq('owner_id', user.id).limit(1).single()
  if (!store) redirect('/onboarding')

  const { data: product } = await supabase.from('products').select('*').eq('id', id).eq('store_id', store.id).single()
  if (!product) notFound()

  const { data: categories } = await supabase.from('categories').select('id, name').eq('store_id', store.id).eq('is_active', true)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
      <ProductForm store={store} categories={categories || []} product={product as Product} />
    </div>
  )
}
