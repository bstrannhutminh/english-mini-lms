export default function LoginLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/50">
      <div className="w-full max-w-md animate-pulse rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-200" />
        <div className="mx-auto mb-2 h-6 w-48 rounded bg-slate-200" />
        <div className="mx-auto mb-6 h-4 w-64 rounded bg-slate-100" />
        <div className="space-y-3">
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-11 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
