export default function NewInvoiceLoading() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-100">

      {/* ── LEFT PANEL skeleton ── */}
      <div className="w-full md:w-[48%] h-full overflow-y-auto bg-white border-r border-slate-200">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="flex flex-col gap-8 px-8 py-7">

          {/* Smart Import */}
          <div>
            <div className="h-2.5 w-24 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-28 w-full bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse mt-3" />
          </div>

          {/* Client Details */}
          <div>
            <div className="h-2.5 w-28 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="flex flex-col gap-3">
              <div>
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div>
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="h-2.5 w-20 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="flex flex-col gap-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2.5 animate-pulse"
                >
                  <div className="flex-1 h-7 bg-slate-100 rounded-md" />
                  <div className="w-14 h-7 bg-slate-100 rounded-md" />
                  <div className="w-24 h-7 bg-slate-100 rounded-md" />
                  <div className="w-20 h-7 bg-slate-100 rounded-md" />
                  <div className="w-5 h-7 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
            <div className="h-10 w-full border border-dashed border-slate-200 rounded-xl animate-pulse mt-3" />
          </div>

          {/* Total & Generate */}
          <div>
            <div className="flex justify-between items-center mb-5 pt-4 border-t border-slate-100">
              <div className="h-4 w-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-14 w-full bg-slate-900 rounded-xl animate-pulse opacity-10" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL skeleton ── */}
      <div className="w-full md:w-[52%] h-full bg-slate-100 px-8 py-10">
        <div className="bg-white rounded-xl border border-slate-100 max-w-2xl mx-auto h-170 animate-pulse" />
      </div>
    </div>
  );
}