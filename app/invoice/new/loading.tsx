export default function NewInvoiceLoading() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">

      {/* ── LEFT PANEL skeleton ── */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto bg-white border-r border-slate-200">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="flex flex-col gap-8 px-8 py-6">

          {/* Smart Import */}
          <div>
            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-24 w-full bg-slate-100 rounded-md animate-pulse" />
            <div className="h-8 w-20 bg-slate-100 rounded-md animate-pulse mt-2" />
          </div>

          {/* Client Details */}
          <div>
            <div className="h-3 w-28 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="flex flex-col gap-3">
              <div>
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-9 w-full bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div>
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-9 w-full bg-slate-100 rounded-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="flex flex-col gap-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex gap-2 bg-slate-50 rounded-md px-3 py-2 animate-pulse"
                >
                  <div className="flex-1 h-8 bg-slate-200 rounded-md" />
                  <div className="w-16 h-8 bg-slate-200 rounded-md" />
                  <div className="w-24 h-8 bg-slate-200 rounded-md" />
                  <div className="w-16 h-8 bg-slate-100 rounded-md" />
                </div>
              ))}
            </div>
            <div className="h-9 w-full bg-slate-100 rounded-md animate-pulse mt-3" />
          </div>

          {/* Total & Generate */}
          <div>
            <div className="flex justify-between mb-4">
              <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-11 w-full bg-slate-800 rounded-lg animate-pulse opacity-20" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL skeleton ── */}
      <div className="w-full md:w-1/2 h-full bg-slate-50 px-6 py-8">
        <div className="bg-white shadow-lg rounded-xl max-w-2xl mx-auto h-[680px] animate-pulse" />
      </div>
    </div>
  );
}