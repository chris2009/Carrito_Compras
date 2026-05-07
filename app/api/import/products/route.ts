import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { parseFile } from '@/lib/excel/parser'
import { slugify } from '@/lib/utils/cn'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: store } = await supabase
      .from('stores')
      .select('id, plan_id, products_count')
      .eq('owner_id', user.id)
      .single()

    if (!store) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

    // Check plan limits
    if (store.plan_id === 'free' && (store.products_count || 0) >= 50) {
      return NextResponse.json({ error: 'Límite del plan Free alcanzado (50 productos). Actualiza a Pro.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

    const parseResult = await parseFile(file)

    // Create import batch record
    const serviceSupabase = await createServiceClient()
    const { data: batch } = await serviceSupabase
      .from('import_batches')
      .insert({
        store_id: store.id,
        filename: file.name,
        file_type: file.name.split('.').pop()?.toLowerCase() || 'xlsx',
        total_rows: parseResult.summary.total,
        status: 'processing',
        created_by: user.id,
        errors: parseResult.errors,
      })
      .select('id')
      .single()

    // Get or create categories
    const { data: existingCategories } = await serviceSupabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', store.id)

    const categoryMap: Record<string, string> = {}
    if (existingCategories) {
      for (const cat of existingCategories) {
        categoryMap[cat.name.toLowerCase()] = cat.id
      }
    }

    const newCategories = Array.from(new Set(parseResult.rows.map((r) => r.categoria).filter(Boolean) as string[]))
      .filter((name) => !categoryMap[name.toLowerCase()])

    if (newCategories.length > 0) {
      const { data: created } = await serviceSupabase
        .from('categories')
        .insert(
          newCategories.map((name) => ({
            store_id: store.id,
            name,
            slug: slugify(name),
          }))
        )
        .select('id, name')

      if (created) {
        for (const cat of created) {
          categoryMap[cat.name.toLowerCase()] = cat.id
        }
      }
    }

    // Insert products in batches of 50
    let succeeded = 0
    let failed = 0
    const BATCH_SIZE = 50

    for (let i = 0; i < parseResult.rows.length; i += BATCH_SIZE) {
      const chunk = parseResult.rows.slice(i, i + BATCH_SIZE)

      const products = chunk.map((row) => {
        const images = []
        if (row.imagen_url) images.push({ url: row.imagen_url, alt: row.nombre, is_primary: true })
        if (row.imagen_url_2) images.push({ url: row.imagen_url_2, alt: row.nombre, is_primary: false })
        if (row.imagen_url_3) images.push({ url: row.imagen_url_3, alt: row.nombre, is_primary: false })

        const attributes: Record<string, string> = {}
        if (row.marca) attributes.marca = row.marca
        if (row.modelo) attributes.modelo = row.modelo

        return {
          store_id: store.id,
          name: row.nombre,
          slug: `${slugify(row.nombre)}-${Date.now()}`,
          description: row.descripcion || null,
          short_desc: row.descripcion_corta || null,
          price: row.precio,
          compare_price: row.precio_tachado || null,
          stock: row.stock,
          sku: row.sku || null,
          category_id: row.categoria ? (categoryMap[row.categoria.toLowerCase()] || null) : null,
          tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          images,
          attributes,
          weight_grams: row.peso_gramos || null,
          is_active: row.activo?.toUpperCase() !== 'NO',
          is_featured: row.destacado?.toUpperCase() === 'SI',
          import_batch_id: batch?.id || null,
        }
      })

      const { error } = await serviceSupabase.from('products').upsert(products, { onConflict: 'store_id,slug' })
      if (error) {
        failed += chunk.length
      } else {
        succeeded += chunk.length
      }
    }

    // Update batch
    if (batch) {
      await serviceSupabase
        .from('import_batches')
        .update({
          status: 'completed',
          succeeded,
          failed,
          processed: succeeded + failed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', batch.id)
    }

    // Update products_count
    await serviceSupabase.rpc('update_store_products_count', { p_store_id: store.id })

    return NextResponse.json({ succeeded, failed, total: parseResult.summary.total })
  } catch (err) {
    console.error('Import error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
