import LotusLogo from './LotusLogo';

export default function Header() {
  return (
    <header className="no-print relative overflow-hidden bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-800 text-white shadow-maroon">
      {/* Decorative pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
      <div
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-10 -bottom-20 h-56 w-56 rounded-full bg-maroon-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 md:px-8 md:py-8">
        <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
            <LotusLogo className="text-gold-300" size={30} />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <h1 className="font-serif text-lg leading-tight tracking-wide sm:text-2xl md:text-[1.7rem]">
              Bhagya Lakshmi Textiles
            </h1>
            <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-gold-200/90 sm:tracking-[0.25em] sm:text-xs">
              Barcode Generator
            </p>
          </div>
        </div>

        {/* System Ready — visible on all sizes */}
        <div className="flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[0.7rem] text-maroon-50 ring-1 ring-white/15 backdrop-blur-sm sm:px-4 sm:py-2 sm:text-xs">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-medium tracking-wide">System Ready</span>
        </div>
      </div>

      {/* Bottom gold accent line */}
      <div className="relative h-1 w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
    </header>
  );
}
