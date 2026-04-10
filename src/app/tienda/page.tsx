import type { Metadata } from "next";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/money";
import { getProducts } from "@/lib/productsStore";

export const metadata: Metadata = {
  title: "Tienda",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TiendaPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const products = await getProducts();
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
          <h1 className="bg-gradient-to-r from-primary to-zinc-950 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
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
          <div
            key={p.slug}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-zinc-950">{p.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                    {p.category}
                  </span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      p.stockStatus === "in_stock"
                        ? "bg-emerald-50 text-emerald-900"
                        : "bg-amber-50 text-amber-900",
                    ].join(" ")}
                  >
                    {p.stockStatus === "in_stock" ? "En stock" : "Bajo pedido"}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold text-zinc-500">Precio</div>
                <div className="text-lg font-semibold text-zinc-950">
                  {formatMoney(p.priceCents, { currency: p.currency })}
                </div>
              </div>
            </div>

            {p.imageUrl ? (
              <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-44 w-full object-cover transition-transform group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="mb-4 grid h-44 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-500">
                Sin imagen
              </div>
            )}

            <p className="text-sm text-zinc-700">{p.summary}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Link
                href={{
                  pathname: `/tienda/${encodeURIComponent(p.slug)}`,
                  query: { p: Buffer.from(JSON.stringify(p)).toString("base64url") },
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ver detalles
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
