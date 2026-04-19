"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type StorePaginationNavProps = {
  currentPage: number;
  totalPages: number;
  pageLinks: Array<{ page: number; href: string }>;
  previousHref: string;
  nextHref: string;
};

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" className="stroke-current/25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function StorePaginationNav({
  currentPage,
  totalPages,
  pageLinks,
  previousHref,
  nextHref,
}: StorePaginationNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function goTo(href: string, disabled: boolean) {
    if (disabled || isPending) return;
    startTransition(() => {
      router.push(href, { scroll: true });
    });
  }

  return (
    <>
      <div className="mt-10 flex justify-center">
        <div className="flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={currentPage === 1 || isPending}
            onClick={() => goTo(previousHref, currentPage === 1)}
            className={[
              "inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
              currentPage === 1 || isPending
                ? "cursor-not-allowed border-zinc-200 bg-white text-zinc-400"
                : "border-zinc-300 bg-white text-zinc-900 hover:border-primary hover:text-primary",
            ].join(" ")}
          >
            ‹
          </button>

          {pageLinks.map(({ page, href }, index) => {
            const active = page === currentPage;
            const prev = pageLinks[index - 1]?.page;
            const showGap = typeof prev === "number" && page - prev > 1;
            return (
              <div key={page} className="flex items-center gap-2">
                {showGap ? (
                  <span className="inline-flex h-11 min-w-8 shrink-0 items-center justify-center text-sm font-semibold text-zinc-500">
                    …
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  disabled={active || isPending}
                  onClick={() => goTo(href, active)}
                  className={[
                    "inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold transition",
                    active
                      ? "cursor-default border-primary bg-primary text-white"
                      : isPending
                        ? "cursor-not-allowed border-zinc-200 bg-white text-zinc-400"
                        : "border-zinc-300 bg-white text-zinc-900 hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  {page}
                </button>
              </div>
            );
          })}

          <button
            type="button"
            aria-label="Página siguiente"
            disabled={currentPage === totalPages || isPending}
            onClick={() => goTo(nextHref, currentPage === totalPages)}
            className={[
              "inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
              currentPage === totalPages || isPending
                ? "cursor-not-allowed border-zinc-200 bg-white text-zinc-400"
                : "border-zinc-300 bg-white text-zinc-900 hover:border-primary hover:text-primary",
            ].join(" ")}
          >
            ›
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/25 backdrop-blur-[2px]">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-2xl">
            <SpinnerIcon className="h-5 w-5 animate-spin text-primary" />
            <div>Cargando repuestos...</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
