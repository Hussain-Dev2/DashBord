export default function AdminLoading() {
  return (
    <div
      className="min-h-screen pb-24 md:pb-10"
      style={{ background: 'linear-gradient(160deg, #0d0f1a 0%, #111327 50%, #0d0f1a 100%)' }}
    >
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 border-b border-white/8 px-2.5 md:px-8 py-2.5 md:py-3 backdrop-blur-xl bg-slate-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-5 w-24 rounded-lg bg-white/5 animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-white/5 animate-pulse hidden md:block" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-2.5 md:px-8 pt-4 md:pt-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 mb-6 md:mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 md:p-5 border border-white/5 bg-white/[0.02] animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-20 rounded bg-white/5" />
                <div className="h-8 w-8 rounded-lg bg-white/5" />
              </div>
              <div className="h-7 w-24 rounded-lg bg-white/5 mb-2" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
          ))}
        </div>

        {/* Client list skeleton */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 md:p-6 animate-pulse">
          {/* List header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="h-6 w-28 rounded-lg bg-white/5 mb-2" />
              <div className="h-3 w-40 rounded bg-white/5" />
            </div>
            <div className="hidden md:block h-10 w-28 rounded-2xl bg-white/5" />
          </div>

          {/* Search/filter bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 h-10 rounded-xl bg-white/5" />
            <div className="h-10 w-20 rounded-xl bg-white/5" />
          </div>

          {/* Status pills */}
          <div className="flex gap-2 mb-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-16 rounded-lg bg-white/5" />
            ))}
          </div>

          {/* Table rows — desktop */}
          <div className="hidden md:block space-y-px">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-white/5">
                <div className="h-10 w-10 rounded-full bg-white/5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 rounded bg-white/5" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
                <div className="h-6 w-16 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-white/5" />
                  <div className="h-3 w-24 rounded bg-white/5" />
                </div>
                <div className="w-48 h-8 rounded-lg bg-white/5" />
                <div className="h-3 w-20 rounded bg-white/5" />
                <div className="h-8 w-8 rounded-lg bg-white/5" />
              </div>
            ))}
          </div>

          {/* Card rows — mobile */}
          <div className="md:hidden space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 rounded bg-white/5" />
                  <div className="h-2 w-full rounded-full bg-white/5 mt-2" />
                </div>
                <div className="h-5 w-12 rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
