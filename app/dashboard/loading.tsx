export default function InvoicePortalLoading() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Top bar skeleton */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="h-5 w-28 bg-slate-200 rounded animate-pulse shrink-0" />
          <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse" />
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-9 w-28 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      {/* Timeline skeleton */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-6">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-slate-100 z-0" />

            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 w-1/3 text-center z-10">
                <div className={`h-8 w-8 rounded-full animate-pulse ${i < 2 ? "bg-slate-200" : "bg-slate-100 border-2 border-slate-200"}`} />
                <div className="h-2.5 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice card skeleton */}
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-xl border border-slate-100 p-10">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-2">
              <div className="h-7 w-44 bg-slate-200 rounded animate-pulse" />
              <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-slate-100 mb-8" />

          {/* Bill to */}
          <div className="mb-10">
            <div className="h-2.5 w-12 bg-slate-100 rounded animate-pulse mb-2.5" />
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-3.5 w-48 bg-slate-100 rounded animate-pulse" />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 bg-slate-900 rounded-lg px-4 py-3 mb-0.5 opacity-10 animate-pulse">
            <div className="col-span-6 h-3 bg-white rounded" />
            <div className="col-span-2 h-3 bg-white rounded ml-auto" />
            <div className="col-span-2 h-3 bg-white rounded ml-auto" />
            <div className="col-span-2 h-3 bg-white rounded ml-auto" />
          </div>

          {/* Table rows */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`grid grid-cols-12 px-4 py-3.5 border-b border-slate-100 animate-pulse ${
                i % 2 === 0 ? "bg-white" : "bg-slate-50/70"
              }`}
            >
              <div className="col-span-6 h-3 bg-slate-200 rounded" style={{ width: "75%" }} />
              <div className="col-span-2 h-3 bg-slate-100 rounded mx-auto" style={{ width: "40%" }} />
              <div className="col-span-2 h-3 bg-slate-100 rounded ml-auto" style={{ width: "55%" }} />
              <div className="col-span-2 h-3 bg-slate-200 rounded ml-auto" style={{ width: "65%" }} />
            </div>
          ))}

          {/* Totals */}
          <div className="mt-8 flex flex-col items-end gap-2.5">
            <div className="flex gap-10">
              <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-10">
              <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-px w-52 bg-slate-200 my-1" />
            <div className="flex gap-10 items-baseline">
              <div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-7 w-32 bg-slate-300 rounded animate-pulse" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex justify-center">
            <div className="h-3 w-44 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}