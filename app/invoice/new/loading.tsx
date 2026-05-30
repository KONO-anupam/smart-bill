export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav skeleton */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-9 w-9 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Stat cards skeleton — with left border accent placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
          {[
            "border-slate-300",
            "border-amber-300",
            "border-green-400",
          ].map((border, i) => (
            <div
              key={i}
              className={`bg-white border border-slate-200 border-l-4 ${border} rounded-2xl px-6 py-5`}
            >
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Invoice table skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

          {/* Table header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-56 bg-slate-100 rounded-lg animate-pulse" />
          </div>

          {/* Column headers */}
          <div className="flex items-center px-6 py-3 bg-slate-50 border-b border-slate-100 gap-8">
            {[24, 32, 20, 16, 14, 20].map((w, i) => (
              <div
                key={i}
                className="h-2.5 bg-slate-200 rounded animate-pulse"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`px-6 py-4 flex items-center gap-6 animate-pulse ${
                  i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                }`}
              >
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-3 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="flex gap-2 ml-auto">
                  <div className="h-7 w-12 bg-slate-100 rounded-md" />
                  <div className="h-7 w-20 bg-slate-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}