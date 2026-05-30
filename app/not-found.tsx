// app/not-found
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-[120px] font-black text-black tracking-tighter leading-none select-none">
          404
        </p>
        <h1 className="mt-4 text-xl font-bold text-slate-800 tracking-tight">
          Page not found.
        </h1>
        <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto border border-slate-200 text-slate-600 text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}