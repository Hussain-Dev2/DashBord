import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #0d0f1a 0%, #111327 50%, #0d0f1a 100%)' }}
    >
      <div className="text-center max-w-md w-full">
        {/* 404 number */}
        <div className="mb-6">
          <span
            className="text-[8rem] font-black leading-none select-none"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #b8961e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            404
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Search className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #b8961e)', color: '#0d0f1a' }}
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
