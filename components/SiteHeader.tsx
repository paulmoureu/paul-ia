import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-paper/86 shadow-[0_10px_30px_-26px_rgba(24,34,48,0.35)] backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-sm font-black uppercase tracking-tight text-ink transition hover:text-lagoon">
          Paul IA
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-ink active:scale-[0.98]"
          >
            Accueil
          </Link>
        </div>
      </nav>
    </header>
  );
}
