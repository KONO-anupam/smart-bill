export default function InvoicePortalLoading() {
  return (
    <div className="min-h-screen bg-neutral-100">

      {/* Top bar skeleton */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="h-5 w-28 bg-neutral-200 rounded animate-pulse shrink-0" />
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-36 bg-neutral-200 rounded-md animate-pulse" />
            <div className="h-9 w-28 bg-neutral-200 rounded-md animate-pulse" />
          </div>
        </div>
      </header>

      {/* Timeline skeleton */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="bg-white border border-neutral-200 rounded-xl px-6 py-5">
          <div className="flex items-start justify-between relative">

            {/* Connector line */}
            <div className="absolute top-4 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-neutral-100 z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 w-1/3 text-center z-10">
              <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
              <div className="h-3 w-20 bg-neutral-200 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-neutral-100 rounded animate-pulse" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 w-1/3 text-center z-10">
              <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
              <div className="h-3 w-20 bg-neutral-200 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-neutral-100 rounded animate-pulse" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 w-1/3 text-center z-10">
              <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse border-2 border-neutral-200" />
              <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice preview card skeleton */}
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-xl p-10">

          {/* Invoice header row */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-2">
              <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3.5 w-28 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-7 w-24 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>

          {/* Bill to section */}
          <div className="mb-8">
            <div className="h-3 w-14 bg-neutral-100 rounded animate-pulse mb-3" />
            <div className="h-5 w-36 bg-neutral-200 rounded animate-pulse mb-1.5" />
            <div className="h-3.5 w-44 bg-neutral-100 rounded animate-pulse" />
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-neutral-100 mb-6" />

          {/* Line items table header */}
          <div className="grid grid-cols-4 gap-4 bg-neutral-900 rounded-md px-4 py-2.5 mb-2">
            {[60, 16, 16, 16].map((w, i) => (
              <div
                key={i}
                className={`h-3 bg-neutral-700 rounded animate-pulse`}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* Line item rows */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`grid grid-cols-4 gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'} rounded`}
            >
              <div className="h-3 bg-neutral-200 rounded animate-pulse" style={{ width: '75%' }} />
              <div className="h-3 bg-neutral-100 rounded animate-pulse" style={{ width: '40%' }} />
              <div className="h-3 bg-neutral-100 rounded animate-pulse" style={{ width: '50%' }} />
              <div className="h-3 bg-neutral-200 rounded animate-pulse" style={{ width: '60%' }} />
            </div>
          ))}

          {/* Total section */}
          <div className="mt-8 flex flex-col items-end gap-2">
            <div className="flex gap-8">
              <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-8">
              <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 w-12 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="h-px w-48 bg-neutral-200 my-1" />
            <div className="flex gap-8 items-center">
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
              <div className="h-6 w-28 bg-neutral-300 rounded animate-pulse" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex justify-center">
            <div className="h-3 w-48 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}