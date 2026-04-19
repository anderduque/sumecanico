"use client";

import Image from "next/image";
import { Container } from "@/components/Container";

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" className="stroke-current/25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function TiendaLoading() {
  return (
    <div className="bg-[#f6f3ef]">
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image src="/module-store-hero.png" alt="" fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.76)_0%,rgba(18,18,18,0.84)_48%,rgba(18,18,18,0.94)_100%)]" />
        </div>
        <Container className="relative py-12 sm:py-16">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
            <SpinnerIcon className="h-5 w-5 animate-spin" />
            <div>Cargando repuestos...</div>
          </div>
        </Container>
      </section>

      <section className="relative isolate bg-[#f6f3ef]">
        <div className="absolute inset-0 opacity-15">
          <Image src="/home-engine-detail-optimized.jpg" alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <Container className="relative py-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1a1a1a]/95"
              >
                <div className="aspect-[16/10] animate-pulse bg-zinc-900" />
                <div className="p-6">
                  <div className="h-7 w-4/5 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 flex gap-2">
                    <div className="h-6 w-28 animate-pulse rounded bg-white/10" />
                    <div className="h-6 w-20 animate-pulse rounded bg-white/10" />
                  </div>
                  <div className="mt-6 grid gap-3">
                    <div className="h-12 w-full animate-pulse rounded-[1rem] bg-white/10" />
                    <div className="h-12 w-full animate-pulse rounded-[1rem] bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

