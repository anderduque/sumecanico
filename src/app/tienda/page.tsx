import type { Metadata } from "next";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Container } from "@/components/Container";
import { products } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Tienda",
};

export default function TiendaPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const list = q
    ? products.filter((p) => {
        const haystack = `${p.name} ${p.category} ${p.summary}`.toLowerCase();
        return haystack.includes(q);
      })
    : products;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">
            Tienda de repuestos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">
            Agrega al carrito y envíanos el pedido por WhatsApp. Confirmamos
            compatibilidad, disponibilidad y precio final.
          </p>
        </div>

        <form className="w-full sm:w-80" action="/tienda" method="get">
          <label className="sr-only" htmlFor="q">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams?.q ?? ""}
            placeholder="Buscar repuesto…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div key={p.slug} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-zinc-950">{p.name}</div>
                <div className="mt-1 text-sm text-zinc-600">{p.category}</div>
              </div>
              <div className="text-sm font-semibold text-zinc-900">
                {formatMoney(p.priceCents, { currency: p.currency })}
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-700">{p.summary}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Link
                href={`/tienda/${p.slug}`}
                className="text-sm font-semibold text-zinc-900 hover:underline"
              >
                Ver
              </Link>
              <AddToCartButton productSlug={p.slug} />
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-700">
          No se encontraron productos con “{searchParams?.q}”.
        </div>
      ) : null}
    </Container>
  );
}

