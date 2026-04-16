import { Container } from "@/components/Container";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-200/80 ${className}`} />;
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
    <div className="bg-[#f6f3ef] text-zinc-950">
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <Container className="py-16 sm:py-20">
          <div className="mb-8 flex justify-center">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)] backdrop-blur">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                <SpinnerIcon className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-primary/90">
                  Cargando repuesto
                </div>
                <div className="mt-1 text-sm text-zinc-300">
                  Estamos preparando los detalles, fotos y disponibilidad del producto.
                </div>
              </div>
            </div>
          </div>

          <Block className="h-4 w-28 bg-white/15" />
          <Block className="mt-6 h-12 w-full max-w-3xl bg-white/20" />
          <Block className="mt-5 h-5 w-full max-w-2xl bg-white/15" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Block className="h-8 w-28 rounded-full bg-white/15" />
            <Block className="h-8 w-24 rounded-full bg-white/15" />
            <Block className="h-8 w-48 rounded-full bg-white/15" />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="overflow-hidden border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-4 py-3 sm:px-6 sm:py-4">
                  <Block className="h-5 w-24" />
                </div>
                <div className="p-3 sm:p-6">
                  <div className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-stretch lg:gap-4">
                    <div className="order-2 rounded-[1.15rem] border border-zinc-200 bg-[#f7f4ef] p-2 sm:rounded-[1.5rem] sm:p-3 lg:order-1">
                      <div className="flex gap-2 overflow-hidden lg:grid lg:grid-cols-1">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <Block
                            key={index}
                            className="h-16 w-16 shrink-0 rounded-[0.8rem] bg-zinc-200 sm:h-18 sm:w-18 lg:h-auto lg:w-full lg:aspect-square lg:rounded-[0.9rem]"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <Block className="aspect-[1/1.08] rounded-[1.15rem] bg-zinc-200 sm:aspect-[4/3.8] sm:rounded-[1.75rem] lg:h-[38rem] lg:aspect-auto" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-6 py-4">
                  <Block className="h-5 w-36" />
                </div>
                <div className="space-y-4 px-6 py-6">
                  <Block className="h-4 w-full" />
                  <Block className="h-4 w-11/12" />
                  <Block className="h-4 w-5/6" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-6 py-4">
                  <Block className="h-5 w-40" />
                </div>
                <div className="px-6 py-6">
                  <Block className="h-10 w-40" />
                  <Block className="mt-4 h-4 w-full" />
                  <Block className="mt-2 h-4 w-5/6" />
                  <Block className="mt-6 h-12 w-full rounded-[1rem]" />
                  <Block className="mt-3 h-12 w-full rounded-[1rem]" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
