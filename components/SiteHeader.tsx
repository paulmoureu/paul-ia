import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="future-header sticky top-0 z-20">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-tight text-ink transition hover:text-lagoon">
          <span className="future-brand-mark">PIA</span>
          <span>Paul IA</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="future-secondary-button rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Accueil
          </Link>
        </div>
      </nav>
    </header>
  );
}
