export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Header skeleton */}
      <div className="border-b border-hairline pt-[calc(1rem+env(safe-area-inset-top))] pb-4 px-6 bg-card shadow-sm flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-start">
          <span className="font-sans text-2xl font-black tracking-tight text-indigo-600 uppercase">
            Pecune
          </span>
          <span className="font-sans text-[8px] font-bold tracking-[0.25em] text-body uppercase">
            Ledger
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-canvas-soft rounded-full animate-pulse" />
        </div>
      </div>

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 pt-12 pb-32 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Skeleton */}
          <div className="lg:col-span-1 bg-card border border-hairline p-6 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-canvas-soft rounded animate-pulse" />
              <div className="h-3 w-48 bg-canvas-soft rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-3 w-20 bg-canvas-soft rounded animate-pulse" />
                  <div className="h-10 w-full bg-canvas-soft rounded-2xl animate-pulse" />
                </div>
              ))}
              <div className="h-11 w-full bg-canvas-soft rounded-full animate-pulse mt-6" />
            </div>
          </div>

          {/* Table/List Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-canvas-soft rounded animate-pulse" />
              <div className="h-3 w-48 bg-canvas-soft rounded animate-pulse" />
            </div>
            <div className="bg-card border border-hairline rounded-3xl p-4 shadow-sm divide-y divide-hairline">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex items-center justify-between py-4 px-2">
                  <div className="space-y-2">
                    <div className="h-3.5 w-28 bg-canvas-soft rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-canvas-soft rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-canvas-soft animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-canvas-soft animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
