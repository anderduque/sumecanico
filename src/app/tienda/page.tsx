import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/money";
import { getProducts } from "@/lib/productsStore";

export const metadata: Metadata = {
  title: "Tienda",
};

export const runtime = "nodejs";

export default async function TiendaPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const products = await getProducts();
  const q = (resolvedSearchParams?.q ?? "").trim().toLowerCase();
  const list = q
    ? products.filter((p) => {
        const haystack = `${p.name} ${p.category} ${p.summary}`.toLowerCase();
        return haystack.includes(q);
      })
    : products;

  return (
    <div className="bg-[#f6f3ef] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/module-store-hero.png"
            alt="Repuestos y componentes automotrices"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.76)_0%,rgba(18,18,18,0.84)_48%,rgba(18,18,18,0.94)_100%)]" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
                Tienda de repuestos
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Repuestos con validación antes de comprar.
              </h1>
              <p className="mt-5 max-w-3xl text-justify text-base leading-8 text-zinc-300 sm:text-lg">
                Agrega productos al carrito y luego confirmamos compatibilidad, disponibilidad y
                precio final antes de cerrar el pedido. La tienda está pensada para ayudarte a
                cotizar mejor, no para adivinar referencias.
              </p>
            </div>

            <div className="lg:col-span-4">
              <form className="w-full" action="/tienda" method="get">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400" htmlFor="q">
                  Buscar repuesto
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={resolvedSearchParams?.q ?? ""}
                  placeholder="Buscar por nombre, categoría o descripción"
                  className="w-full border border-white/15 bg-white px-4 py-3 text-sm text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-primary"
                />
              </form>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#f6f3ef]">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/home-engine-detail-optimized.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <Container className="relative py-12 sm:py-16">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {list.map((product) => (
              <article
                key={product.slug}
                className="group flex h-full flex-col overflow-hidden border border-white/10 bg-[#1a1a1a]/95 transition duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_30px_70px_-40px_rgba(0,0,0,0.8)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                  {product.imageUrl ? (
                    product.imageUrl.startsWith("data:") ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
                      />
                    ) : (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
                      />
                    )
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm font-semibold text-zinc-500">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.22)_54%,rgba(0,0,0,0.82)_100%)]" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        {product.name}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="border border-white/12 bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                          {product.category}
                        </span>
                        <span
                          className={[
                            "px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                            product.stockStatus === "in_stock"
                              ? "bg-emerald-900/40 text-emerald-300"
                              : "bg-amber-900/40 text-amber-300",
                          ].join(" ")}
                        >
                          {product.stockStatus === "in_stock" ? "En stock" : "Bajo pedido"}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Precio
                      </div>
                      <div className="mt-1 text-xl font-semibold text-white">
                        {formatMoney(product.priceCents, { currency: product.currency })}
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 flex-1 text-justify text-sm leading-8 text-zinc-300">{product.summary}</p>

                  <div className="mt-6 grid gap-3">
                    <Link
                      href={`/tienda/${encodeURIComponent(product.slug)}`}
                      className="inline-flex w-full items-center justify-center border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-zinc-100"
                    >
                      Ver detalles →
                    </Link>
                    <AddToCartButton productSlug={product.slug} className="w-full" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="mt-10 border border-white/10 bg-[#1a1a1a] p-6 text-sm text-zinc-300">
              No se encontraron productos con “{resolvedSearchParams?.q}”.
            </div>
          ) : null}
        </Container>
      </section>
    </div>
  );
}
