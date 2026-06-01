'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #0d0f1a 0%, #111327 50%, #0d0f1a 100%)' }}
    >
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-2">
          An unexpected error occurred. Our team has been notified.
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <p className="text-xs text-gray-600 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #b8961e)', color: '#0d0f1a' }}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
