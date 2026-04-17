"use client";

import Link from "next/link";

export default function TiendaError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="bg-[#f6f3ef]">
      <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">No pudimos cargar la tienda</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-700 sm:text-base">
          Verifica tu conexión e inténtalo de nuevo. Si el problema continúa, contáctanos por WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90"
          >
            Reintentar
          </button>
          <Link
            href="/contacto"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Ir a contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
