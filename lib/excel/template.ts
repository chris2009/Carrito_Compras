import * as XLSX from 'xlsx'

const HEADERS = [
  'nombre', 'descripcion', 'descripcion_corta', 'precio', 'precio_tachado',
  'stock', 'sku', 'categoria', 'tags',
  'imagen_url', 'imagen_url_2', 'imagen_url_3',
  'marca', 'modelo', 'peso_gramos', 'activo', 'destacado',
]

const EXAMPLE_ROWS = [
  ['iPhone 15 Pro', 'Smartphone Apple con chip A17 Pro', 'El iPhone más avanzado', 1199, 1299, 25, 'APL-IP15P', 'Smartphones', 'apple,iphone,5g', 'https://ejemplo.com/img1.jpg', '', '', 'Apple', 'iPhone 15 Pro', 174, 'SI', 'SI'],
  ['Samsung Galaxy S24', 'Flagship Samsung 2024', 'Galaxy S24 Ultra con S Pen', 1099, 1199, 18, 'SAM-S24U', 'Smartphones', 'samsung,galaxy,5g', 'https://ejemplo.com/img2.jpg', '', '', 'Samsung', 'S24 Ultra', 233, 'SI', 'NO'],
  ['MacBook Pro M3', 'Laptop Apple con chip M3', 'Portátil para profesionales', 1999, 2199, 10, 'APL-MBP-M3', 'Laptops', 'apple,macbook,m3', 'https://ejemplo.com/img3.jpg', '', '', 'Apple', 'MacBook Pro 14', 1600, 'SI', 'SI'],
]

export function generateTemplate(): Uint8Array {
  const wb = XLSX.utils.book_new()

  // Products sheet
  const wsData = [HEADERS, ...EXAMPLE_ROWS]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Style headers (bold + blue background via cell styles not directly supported in xlsx without pro,
  // but we can set column widths)
  const colWidths = [
    { wch: 40 }, { wch: 60 }, { wch: 40 }, { wch: 12 }, { wch: 15 },
    { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 30 },
    { wch: 50 }, { wch: 50 }, { wch: 50 },
    { wch: 15 }, { wch: 20 }, { wch: 14 }, { wch: 8 }, { wch: 10 },
  ]
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Productos')

  // Instructions sheet
  const instrucciones = [
    ['INSTRUCCIONES PARA IMPORTAR PRODUCTOS A SHOPFLOW'],
    [''],
    ['COLUMNAS OBLIGATORIAS (marcadas con *)'],
    ['nombre *', 'Nombre del producto (máximo 200 caracteres)'],
    ['precio *', 'Precio de venta (número, ej: 99.90)'],
    ['stock *', 'Cantidad en inventario (número entero >= 0)'],
    [''],
    ['COLUMNAS OPCIONALES'],
    ['descripcion', 'Descripción larga del producto'],
    ['descripcion_corta', 'Descripción breve (máximo 300 caracteres)'],
    ['precio_tachado', 'Precio original antes del descuento'],
    ['sku', 'Código único del producto en tu sistema'],
    ['categoria', 'Categoría (debe coincidir exactamente con las categorías de tu tienda)'],
    ['tags', 'Etiquetas separadas por coma (ej: apple,smartphone,5g)'],
    ['imagen_url', 'URL de la imagen principal (debe comenzar con https://)'],
    ['imagen_url_2', 'URL de imagen secundaria'],
    ['imagen_url_3', 'URL de tercera imagen'],
    ['marca', 'Marca del producto'],
    ['modelo', 'Modelo del producto'],
    ['peso_gramos', 'Peso en gramos (número entero)'],
    ['activo', 'SI o NO — si el producto está visible (por defecto: SI)'],
    ['destacado', 'SI o NO — si aparece en destacados (por defecto: NO)'],
    [''],
    ['NOTAS IMPORTANTES'],
    ['- No elimines ni renombres los encabezados de la primera fila'],
    ['- Los precios van sin símbolo de moneda (solo el número)'],
    ['- Para "activo" y "destacado" escribe exactamente SI o NO'],
    ['- Máximo 10MB por archivo'],
    ['- El sistema creará automáticamente las categorías si no existen'],
  ]
  const wsInstr = XLSX.utils.aoa_to_sheet(instrucciones)
  wsInstr['!cols'] = [{ wch: 25 }, { wch: 70 }]
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instrucciones')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array
}

export function generateCsvTemplate(): string {
  const rows = [HEADERS.join(','), ...EXAMPLE_ROWS.map((r) => r.map((v) => `"${v}"`).join(','))]
  return rows.join('\n')
}
