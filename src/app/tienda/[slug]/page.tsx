import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { formatMoney } from "@/lib/money";
import { getProductCoverImage, getProductImageUrls } from "@/lib/productTypes";
import { getProductBySlug } from "@/lib/productsStore";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Repuesto" };
  return { title: product.name, description: product.summary };
}

function buildDescription(summary: string, category: string) {
  return [
    summary,
    `Este repuesto pertenece a la línea de ${category.toLowerCase()} y se valida antes de entregar para asegurar referencia, compatibilidad y condición de uso.`,
  ];
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug.trim());

  if (!product) notFound();

  const stockLabel = product.stockStatus === "in_stock" ? "Disponible" : "Bajo pedido";
  const stockTone =
    product.stockStatus === "in_stock"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800";
  const detailItems = [
    { label: "Categoría", value: product.category },
    ...(product.shockPosition ? [{ label: "Posición", value: product.shockPosition }] : []),
    { label: "Disponibilidad", value: stockLabel },
    {
      label: "Precio referencial",
      value:
        product.pricingMode === "check_availability"
          ? "Consultar disponibilidad"
          : formatMoney(product.priceCents, { currency: product.currency }),
    },
    {
      label: "Inventario",
      value:
        typeof product.inventoryQty === "number" && product.stockStatus === "in_stock"
          ? `${product.inventoryQty} unidad${product.inventoryQty === 1 ? "" : "es"}`
          : "Se confirma al cotizar",
    },
  ];
  const description = buildDescription(product.summary, product.category);
  const productImages = getProductImageUrls(product);
  const coverImage = getProductCoverImage(product);

  return (
    <div className="bg-[#f6f3ef] text-zinc-950">
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          {coverImage ? (
            coverImage.startsWith("data:") ? (
              <Image
                src={coverImage}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <Image src={coverImage} alt={product.name} fill className="object-cover" sizes="100vw" priority />
            )
          ) : (
            <Image src="/module-store-hero.png" alt={product.name} fill className="object-cover" sizes="100vw" priority />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.88)_0%,rgba(8,8,8,0.7)_48%,rgba(8,8,8,0.55)_100%)]" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/tienda" className="text-sm font-semibold text-white/80 transition hover:text-white">
              ← Volver a tienda
            </Link>
            <Link href="/carrito" className="text-sm font-semibold text-white/80 transition hover:text-white">
              Ir al carrito
            </Link>
          </div>

          <div className="mt-8 max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
              Detalle del repuesto
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 max-w-2xl text-justify text-base leading-8 text-zinc-200 sm:text-lg">
              {product.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
                {product.category}
              </span>
              {product.shockPosition ? (
                <span className="border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
                  {product.shockPosition}
                </span>
              ) : null}
              <span className={`border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${stockTone}`}>
                {stockLabel}
              </span>
              {product.pricingMode === "check_availability" ? (
                <span className="inline-flex items-center rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">
                  Consultar disponibilidad
                </span>
              ) : (
                <span className="text-2xl font-semibold text-white">
                  {formatMoney(product.priceCents, { currency: product.currency })}
                </span>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {productImages.length ? (
                <ProductGallery name={product.name} images={productImages} />
              ) : null}

              <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-6 py-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Descripción
                  </div>
                </div>
                <div className="space-y-5 px-6 py-6 text-sm leading-8 text-zinc-700 sm:text-base">
                  {description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-6 py-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Detalles del repuesto
                  </div>
                </div>
                <dl className="divide-y divide-zinc-200">
                  {detailItems.map((item) => (
                    <div key={item.label} className="grid gap-2 px-6 py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        {item.label}
                      </dt>
                      <dd className="text-sm font-medium text-zinc-950 sm:text-base">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {product.specs?.length ? (
                <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-200 px-6 py-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                      Especificaciones
                    </div>
                  </div>
                  <dl className="divide-y divide-zinc-200">
                    {product.specs
                      .filter((spec) => spec.label.trim() && spec.value.trim())
                      .map((spec) => (
                        <div
                          key={`${spec.label}-${spec.value}`}
                          className="grid gap-2 px-6 py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center"
                        >
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {spec.label}
                          </dt>
                          <dd className="text-sm font-medium text-zinc-950 sm:text-base">{spec.value}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              ) : null}

              {product.compatibleWith?.length ? (
                <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-200 px-6 py-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                      Compatibilidad referencial
                    </div>
                  </div>
                  <div className="grid gap-3 px-6 py-6">
                    {product.compatibleWith.map((item) => (
                      <div key={item} className="flex items-start gap-3 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-7 text-zinc-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 overflow-hidden border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-6 py-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Comprar o cotizar
                  </div>
                </div>
                <div className="px-6 py-6">
                  {product.pricingMode === "check_availability" ? (
                    <div className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-900">
                      Consultar disponibilidad
                    </div>
                  ) : (
                    <div className="text-3xl font-semibold tracking-tight text-zinc-950">
                      {formatMoney(product.priceCents, { currency: product.currency })}
                    </div>
                  )}
                  <p className="mt-3 text-justify text-sm leading-7 text-zinc-700">
                    {product.pricingMode === "check_availability"
                      ? "Este repuesto requiere confirmación de existencia y precio al momento. Escríbenos y validamos referencia, compatibilidad y disponibilidad real."
                      : "Agrega este repuesto al carrito y luego confirmamos referencia, compatibilidad y disponibilidad real antes de procesar la reserva."}
                  </p>

                  <ProductDetailActions product={product} />

                  <div className="mt-6 grid gap-3 border-t border-zinc-200 pt-6">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-justify text-sm leading-7 text-zinc-700">
                        Validación técnica antes de confirmar la compra.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-justify text-sm leading-7 text-zinc-700">
                        Soporte por WhatsApp para revisar medidas y compatibilidad.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-justify text-sm leading-7 text-zinc-700">
                        Precio final sujeto a disponibilidad y referencia exacta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
