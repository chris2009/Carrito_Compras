import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export type ParsedRow = {
  nombre: string
  descripcion?: string
  descripcion_corta?: string
  precio: number
  precio_tachado?: number
  stock: number
  sku?: string
  categoria?: string
  tags?: string
  imagen_url?: string
  imagen_url_2?: string
  imagen_url_3?: string
  marca?: string
  modelo?: string
  peso_gramos?: number
  activo?: string
  destacado?: string
}

export type RowError = {
  row: number
  column: string
  message: string
}

export type ParseResult = {
  rows: ParsedRow[]
  errors: RowError[]
  warnings: RowError[]
  summary: {
    total: number
    valid: number
    invalid: number
  }
}

const REQUIRED_COLUMNS = ['nombre', 'precio', 'stock']
const NUMBER_COLUMNS = ['precio', 'precio_tachado', 'stock', 'peso_gramos']
const URL_COLUMNS = ['imagen_url', 'imagen_url_2', 'imagen_url_3']

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function normalizeHeader(h: string) {
  return h.toLowerCase().trim().replace(/\s+/g, '_').replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
}

function parseRows(rawRows: Record<string, string | number | undefined>[]): ParseResult {
  const rows: ParsedRow[] = []
  const errors: RowError[] = []
  const warnings: RowError[] = []
  const seenNames = new Set<string>()
  const seenSkus = new Set<string>()

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2 // +2 because row 1 is header, 0-indexed
    const raw = rawRows[i]
    const rowErrors: RowError[] = []

    // Normalize keys
    const normalized: Record<string, string> = {}
    for (const [k, v] of Object.entries(raw)) {
      normalized[normalizeHeader(k)] = String(v ?? '').trim()
    }

    // Required fields
    for (const col of REQUIRED_COLUMNS) {
      if (!normalized[col]) {
        rowErrors.push({ row: rowNum, column: col, message: `${col} es requerido` })
      }
    }

    // Numeric validation
    for (const col of NUMBER_COLUMNS) {
      if (normalized[col] && isNaN(parseFloat(normalized[col]))) {
        rowErrors.push({ row: rowNum, column: col, message: `${col} debe ser un número` })
      }
    }

    const precio = parseFloat(normalized.precio || '0')
    const stock = parseInt(normalized.stock || '0', 10)

    if (precio < 0) rowErrors.push({ row: rowNum, column: 'precio', message: 'El precio debe ser positivo' })
    if (stock < 0) rowErrors.push({ row: rowNum, column: 'stock', message: 'El stock debe ser >= 0' })

    if (normalized.precio_tachado) {
      const comparePrecio = parseFloat(normalized.precio_tachado)
      if (comparePrecio <= precio) {
        warnings.push({ row: rowNum, column: 'precio_tachado', message: 'precio_tachado debería ser mayor al precio' })
      }
    }

    // URL validation
    for (const col of URL_COLUMNS) {
      if (normalized[col] && !isValidUrl(normalized[col])) {
        warnings.push({ row: rowNum, column: col, message: `${col} no es una URL válida` })
      }
    }

    // Duplicate detection
    const nameLower = normalized.nombre?.toLowerCase()
    if (nameLower && seenNames.has(nameLower)) {
      warnings.push({ row: rowNum, column: 'nombre', message: 'Nombre duplicado en el archivo' })
    }
    if (nameLower) seenNames.add(nameLower)

    if (normalized.sku && seenSkus.has(normalized.sku)) {
      warnings.push({ row: rowNum, column: 'sku', message: 'SKU duplicado en el archivo' })
    }
    if (normalized.sku) seenSkus.add(normalized.sku)

    if (rowErrors.length > 0) {
      errors.push(...rowErrors)
    } else {
      rows.push({
        nombre: normalized.nombre,
        descripcion: normalized.descripcion || undefined,
        descripcion_corta: normalized.descripcion_corta || undefined,
        precio,
        precio_tachado: normalized.precio_tachado ? parseFloat(normalized.precio_tachado) : undefined,
        stock,
        sku: normalized.sku || undefined,
        categoria: normalized.categoria || undefined,
        tags: normalized.tags || undefined,
        imagen_url: normalized.imagen_url || undefined,
        imagen_url_2: normalized.imagen_url_2 || undefined,
        imagen_url_3: normalized.imagen_url_3 || undefined,
        marca: normalized.marca || undefined,
        modelo: normalized.modelo || undefined,
        peso_gramos: normalized.peso_gramos ? parseInt(normalized.peso_gramos, 10) : undefined,
        activo: normalized.activo,
        destacado: normalized.destacado,
      })
    }
  }

  const invalidRows = new Set(errors.map((e) => e.row)).size

  return {
    rows,
    errors,
    warnings,
    summary: {
      total: rawRows.length,
      valid: rawRows.length - invalidRows,
      invalid: invalidRows,
    },
  }
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'csv') {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(parseRows(results.data as Record<string, string>[]))
        },
      })
    })
  }

  // xlsx / xls
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(firstSheet) as Record<string, string | number>[]
  return parseRows(rawRows)
}
