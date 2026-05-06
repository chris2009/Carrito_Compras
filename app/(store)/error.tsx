'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function StoreError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
      <p className="text-gray-600 mb-6 max-w-md">{error.message || 'Error inesperado. Por favor intenta de nuevo.'}</p>
      <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700">Reintentar</Button>
    </div>
  )
}
