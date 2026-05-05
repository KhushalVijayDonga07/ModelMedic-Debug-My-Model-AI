export function SiteFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 text-xs text-slate-400">
        <p>ModelMedic © 2026. Built for ML engineers.</p>
        <p>Powered by Claude, Supabase, and Clerk.</p>
      </div>
    </footer>
  );
}