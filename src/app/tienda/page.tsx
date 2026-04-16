import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Container } from "@/components/Container";
import { StoreFilters } from "@/components/StoreFilters";
import { formatMoney } from "@/lib/money";
import { getProductCoverImage } from "@/lib/productTypes";
import { getProducts } from "@/lib/productsStore";

export const metadata: Metadata = {
  title: "Tienda",
};

export const runtime = "nodejs";
const pageSize = 20;

function normalizeFilterValue(value?: string) {
  return (value ?? "").trim();
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function uniqueSortedStrings(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(isNonEmptyString))).sort((a, b) => a.localeCompare(b));
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    category?: string;
    stock?: string;
    pricing?: string;
    brand?: string;
    position?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const products = await getProducts();
  const categories = uniqueSortedStrings(products.map((p) => p.category));
  const q = (resolvedSearchParams?.q ?? "").trim().toLowerCase();
  const category = normalizeFilterValue(resolvedSearchParams?.category);
  const stock = normalizeFilterValue(resolvedSearchParams?.stock);
  const pricing = normalizeFilterValue(resolvedSearchParams?.pricing);
  const brand = normalizeFilterValue(resolvedSearchParams?.brand);
  const position = normalizeFilterValue(resolvedSearchParams?.position);
  const list = products.filter((p) => {
    if (q) {
      const haystack = `${p.name} ${p.category} ${p.summary} ${p.sku ?? ""} ${p.shockBrand ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (category && p.category !== category) return false;
    if (stock && p.stockStatus !== stock) return false;
    if (pricing && (p.pricingMode ?? "fixed") !== pricing) return false;
    if (brand && p.shockBrand !== brand) return false;
    if (position && p.shockPosition !== position) return false;
    return true;
  });
  const requestedPage = Number.parseInt(resolvedSearchParams?.page ?? "1", 10);
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, totalPages) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const visibleProducts = list.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = Boolean(q || category || stock || pricing || brand || position);

  function buildPageHref(page: number) {
    const params = new URLSearchParams();
    if (resolvedSearchParams?.q?.trim()) params.set("q", resolvedSearchParams.q.trim());
    if (category) params.set("category", category);
    if (stock) params.set("stock", stock);
    if (pricing) params.set("pricing", pricing);
    if (brand) params.set("brand", brand);
    if (position) params.set("position", position);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/tienda?${query}` : "/tienda";
  }

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

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <form className="w-full max-w-md" action="/tienda" method="get">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-primary/85" htmlFor="q">
                  Buscar repuesto
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={resolvedSearchParams?.q ?? ""}
                  placeholder="Buscar por nombre, categoría o descripción"
                  className="w-full rounded-[1rem] border border-white/15 bg-white px-4 py-3 text-sm text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-primary"
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
          <StoreFilters
            q={resolvedSearchParams?.q ?? ""}
            category={category}
            stock={stock}
            pricing={pricing}
            brand={brand}
            position={position}
            categories={categories}
            hasActiveFilters={hasActiveFilters}
            filterProducts={products.map((product) => ({
              category: product.category,
              stockStatus: product.stockStatus,
              pricingMode: product.pricingMode,
              shockBrand: product.shockBrand,
              shockPosition: product.shockPosition,
            }))}
          />

          {hasActiveFilters ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {q ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  Búsqueda: {resolvedSearchParams?.q}
                </span>
              ) : null}
              {category ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  Categoría: {category}
                </span>
              ) : null}
              {stock ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  Estado: {stock === "in_stock" ? "En stock" : "Bajo pedido"}
                </span>
              ) : null}
              {pricing ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  Precio: {pricing === "fixed" ? "Definido" : "Consultar"}
                </span>
              ) : null}
              {brand ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  Marca: {brand}
                </span>
              ) : null}
              {position ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                  Posición: {position}
                </span>
              ) : null}
            </div>
          ) : null}

          {list.length > 0 ? (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-zinc-700">
                Mostrando <span className="font-semibold text-zinc-950">{startIndex + 1}</span> a{" "}
                <span className="font-semibold text-zinc-950">
                  {Math.min(startIndex + pageSize, list.length)}
                </span>{" "}
                de <span className="font-semibold text-zinc-950">{list.length}</span> repuestos
              </div>
              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={buildPageHref(Math.max(1, currentPage - 1))}
                    aria-disabled={currentPage === 1}
                    className={[
                      "inline-flex items-center justify-center rounded-[1rem] border px-4 py-2.5 text-sm font-semibold transition",
                      currentPage === 1
                        ? "pointer-events-none border-zinc-200 bg-white text-zinc-400"
                        : "border-zinc-300 bg-white text-zinc-900 hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    Anterior
                  </Link>
                  <div className="rounded-[1rem] border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Link
                    href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={[
                      "inline-flex items-center justify-center rounded-[1rem] border px-4 py-2.5 text-sm font-semibold transition",
                      currentPage === totalPages
                        ? "pointer-events-none border-zinc-200 bg-white text-zinc-400"
                        : "border-zinc-300 bg-white text-zinc-900 hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    Siguiente
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => {
              const coverImage = getProductCoverImage(product);
              const isConsultOnly = product.pricingMode === "check_availability";
              return (
                <article
                  key={product.slug}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1a1a1a]/95 transition duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_30px_70px_-40px_rgba(0,0,0,0.8)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                    {coverImage ? (
                      coverImage.startsWith("data:") ? (
                        <Image
                          src={coverImage}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
                        />
                      ) : (
                        <Image
                          src={coverImage}
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
                    <div className="flex min-h-[12rem] flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-2xl font-semibold tracking-tight text-white">
                            {product.name}
                          </h2>
                        </div>

                        {!isConsultOnly ? (
                          <div className="shrink-0 text-right">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Precio</div>
                            <div className="mt-1 text-xl font-semibold text-white">
                              {formatMoney(product.priceCents, { currency: product.currency })}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="max-w-full break-words border border-white/12 bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                          {product.category}
                        </span>
                        {product.shockPosition ? (
                          <span className="max-w-full break-words border border-white/12 bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                            {product.shockPosition}
                          </span>
                        ) : null}
                        <span
                          className={[
                            "max-w-full break-words px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                            product.stockStatus === "in_stock"
                              ? "bg-emerald-900/40 text-emerald-300"
                              : "bg-amber-900/40 text-amber-300",
                          ].join(" ")}
                        >
                          {product.stockStatus === "in_stock" ? "En stock" : "Bajo pedido"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-5 flex-1 text-justify text-sm leading-8 text-zinc-300">{product.summary}</p>

                    <div className="mt-6 grid gap-3">
                      {isConsultOnly ? (
                        <div className="rounded-[1rem] border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-center">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                            Estado
                          </div>
                          <div className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-amber-200">
                            Consultar disponibilidad
                          </div>
                        </div>
                      ) : null}
                      <Link
                        href={`/tienda/${encodeURIComponent(product.slug)}`}
                        className="inline-flex w-full items-center justify-center rounded-[1rem] border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 transition hover:border-primary hover:bg-primary hover:text-white"
                      >
                        Ver detalles →
                      </Link>
                      {!isConsultOnly ? (
                        <AddToCartButton
                          productSlug={product.slug}
                          product={product}
                          className="w-full rounded-[1rem]"
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {list.length === 0 ? (
            <div className="mt-10 border border-white/10 bg-[#1a1a1a] p-6 text-sm text-zinc-300">
              Lo sentimos no tenemos resultados para su búsqueda.
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="mt-10 flex justify-center">
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  const active = page === currentPage;
                  return (
                    <Link
                      key={page}
                      href={buildPageHref(page)}
                      className={[
                        "inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition",
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-zinc-300 bg-white text-zinc-900 hover:border-primary hover:text-primary",
                      ].join(" ")}
                    >
                      {page}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </div>
  );
}
