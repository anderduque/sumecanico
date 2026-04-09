import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Container } from "@/components/Container";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { getProductBySlug, products } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Producto" };
  return { title: product.name, description: product.summary };
}

export default function ProductoPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const stockLabel =
    product.stockStatus === "in_stock" ? "En stock" : "Bajo pedido";

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex items-center justify-between gap-4">
        <Link href="/tienda" className="text-sm font-semibold text-zinc-900 hover:underline">
          ← Volver a la tienda
        </Link>
        <Link href="/carrito" className="text-sm font-semibold text-zinc-900 hover:underline">
          Ir al carrito
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-zinc-600">{product.category}</div>
              <h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-zinc-900">
                  {formatMoney(product.priceCents, { currency: product.currency })}
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                  {stockLabel}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-700">{product.summary}</p>

            {product.compatibleWith?.length ? (
              <div className="mt-6">
                <div className="text-sm font-semibold text-zinc-900">Compatibilidad</div>
                <ul className="mt-2 space-y-2 text-sm text-zinc-700">
                  {product.compatibleWith.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold text-zinc-950">Comprar / cotizar</div>
            <p className="mt-2 text-sm text-zinc-700">
              Agrega al carrito o cotiza directo por WhatsApp para confirmar referencia y
              disponibilidad.
            </p>
            <div className="mt-5 grid gap-3">
              <AddToCartButton productSlug={product.slug} className="w-full" />
              <WhatsAppLink
                className="w-full"
                message={`Hola, quiero cotizar el repuesto: ${product.name}. Mi vehículo es:`}
              >
                Cotizar por WhatsApp
              </WhatsAppLink>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

