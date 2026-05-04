'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Une erreur est survenue</AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-sm">Nous n'avons pas pu charger cette page.</p>
          <Button onClick={reset} variant="outline" size="sm">
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
