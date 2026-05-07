'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, CheckCircle, XCircle, AlertTriangle, Download, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseFile } from '@/lib/excel/parser'
import type { ParseResult } from '@/lib/excel/parser'

type Step = 'upload' | 'validating' | 'preview' | 'importing' | 'done'

export default function ImportarPage() {
  const [step, setStep] = useState<Step>('upload')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<{ succeeded: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setStep('validating')
    setError(null)

    try {
      const result = await parseFile(f)
      setParseResult(result)
      setStep('preview')
    } catch {
      setError('Error al procesar el archivo. Verifica que sea un Excel o CSV válido.')
      setStep('upload')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
  })

  async function downloadTemplate(type: 'xlsx' | 'csv') {
    const { generateTemplate, generateCsvTemplate } = await import('@/lib/excel/template')
    if (type === 'xlsx') {
      const data = generateTemplate()
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla-shopflow.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const csv = generateCsvTemplate()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla-shopflow.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  async function handleImport() {
    if (!parseResult || !file) return
    setImporting(true)
    setStep('importing')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import/products', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en la importación')

      setImportResult({ succeeded: data.succeeded, failed: data.failed })
      setProgress(100)
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error durante la importación')
      setStep('preview')
    } finally {
      setImporting(false)
    }
  }

  const STEPS_LIST = [
    { id: 'upload', label: 'Archivo' },
    { id: 'preview', label: 'Validar' },
    { id: 'importing', label: 'Importar' },
    { id: 'done', label: 'Listo' },
  ]

  const currentStepIdx = STEPS_LIST.findIndex((s) =>
    step === 'validating' ? s.id === 'upload' : s.id === step
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar productos</h1>
        <p className="text-sm text-gray-500">Carga productos masivamente desde Excel o CSV</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS_LIST.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i < currentStepIdx ? 'bg-green-500 text-white' :
              i === currentStepIdx ? 'bg-indigo-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i < currentStepIdx ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === currentStepIdx ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {i < STEPS_LIST.length - 1 && <ArrowRight className="h-4 w-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {(step === 'upload' || step === 'validating') && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Download templates */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('xlsx')}>
                <Download className="mr-2 h-4 w-4" />
                Plantilla Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Plantilla CSV
              </Button>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              {step === 'validating' ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <p className="mt-3 font-medium text-gray-700">Analizando archivo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400" />
                  <p className="mt-3 font-medium text-gray-700">
                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">.xlsx, .xls, .csv — máximo 10MB</p>
                  <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700" type="button">
                    Seleccionar archivo
                  </Button>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && parseResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex items-center gap-3 pt-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Válidos</p>
                  <p className="text-xl font-bold text-green-600">{parseResult.summary.valid}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-4">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Con errores</p>
                  <p className="text-xl font-bold text-red-600">{parseResult.summary.invalid}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Advertencias</p>
                  <p className="text-xl font-bold text-yellow-600">{parseResult.warnings.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Errors detail */}
          {parseResult.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-red-700">Errores que impiden la importación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {parseResult.errors.slice(0, 20).map((e, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <Badge variant="outline" className="text-red-600 border-red-200 flex-shrink-0">Fila {e.row}</Badge>
                      <span className="text-gray-600">{e.column}: {e.message}</span>
                    </div>
                  ))}
                  {parseResult.errors.length > 20 && (
                    <p className="text-xs text-gray-400">...y {parseResult.errors.length - 20} errores más</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product preview */}
          {parseResult.rows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vista previa ({parseResult.rows.length} productos válidos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b">
                      <tr className="text-gray-500">
                        <th className="pb-2 text-left">Nombre</th>
                        <th className="pb-2 text-left">Precio</th>
                        <th className="pb-2 text-left">Stock</th>
                        <th className="pb-2 text-left">Categoría</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parseResult.rows.slice(0, 10).map((row, i) => (
                        <tr key={i}>
                          <td className="py-1 pr-4 font-medium truncate max-w-[200px]">{row.nombre}</td>
                          <td className="py-1 pr-4">${row.precio}</td>
                          <td className="py-1 pr-4">{row.stock}</td>
                          <td className="py-1 text-gray-500">{row.categoria || '—'}</td>
                        </tr>
                      ))}
                      {parseResult.rows.length > 10 && (
                        <tr>
                          <td colSpan={4} className="pt-2 text-gray-400">...y {parseResult.rows.length - 10} más</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep('upload'); setParseResult(null); setFile(null) }}>
              Cancelar
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleImport}
              disabled={parseResult.summary.valid === 0}
            >
              Importar {parseResult.summary.valid} producto{parseResult.summary.valid !== 1 ? 's' : ''}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Progress */}
      {step === 'importing' && (
        <Card>
          <CardContent className="pt-8 space-y-4 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-500" />
            <p className="font-medium text-gray-700">Importando productos...</p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500">Esto puede tardar unos segundos</p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === 'done' && importResult && (
        <Card>
          <CardContent className="pt-8 space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">¡Importación completada!</h2>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-2xl font-bold text-green-600">{importResult.succeeded}</p>
                <p className="text-sm text-gray-500">importados</p>
              </div>
              {importResult.failed > 0 && (
                <div>
                  <p className="text-2xl font-bold text-red-500">{importResult.failed}</p>
                  <p className="text-sm text-gray-500">con errores</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => { setStep('upload'); setParseResult(null); setFile(null); setImportResult(null) }}
              >
                Importar otro archivo
              </Button>
              <a href="/dashboard/productos">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Ver mis productos</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
