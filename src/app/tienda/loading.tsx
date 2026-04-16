import { Container } from "@/components/Container";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" className="stroke-current/25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Loading() {
  return (
    <div className="bg-[#121212] text-white">
      <section className="border-b border-white/10 bg-zinc-950">
        <Container className="py-16 sm:py-20">
          <div className="mb-8 flex justify-center">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)] backdrop-blur">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                <SpinnerIcon className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-primary/90">
                  Cargando tienda
                </div>
                <div className="mt-1 text-sm text-zinc-300">
                  Estamos trayendo los repuestos y preparando el cat&aacute;logo.
                </div>
              </div>
            </div>
          </div>
          <Block className="h-3 w-36" />
          <Block className="mt-5 h-12 w-full max-w-3xl" />
          <Block className="mt-4 h-5 w-full max-w-2xl" />
          <Block className="mt-3 h-5 w-full max-w-xl" />
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden border border-white/10 bg-[#1a1a1a]/95 p-6"
            >
              <Block className="aspect-[16/10] w-full bg-white/8" />
              <Block className="mt-6 h-7 w-3/4 bg-white/12" />
              <div className="mt-4 flex gap-2">
                <Block className="h-6 w-28 rounded-full bg-white/8" />
                <Block className="h-6 w-20 rounded-full bg-white/8" />
              </div>
              <Block className="mt-6 h-4 w-full bg-white/8" />
              <Block className="mt-2 h-4 w-5/6 bg-white/8" />
              <Block className="mt-6 h-11 w-full rounded-none bg-white/14" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
