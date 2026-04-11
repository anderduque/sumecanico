"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/cart/CartProvider";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/productTypes";

export default function CarritoPage() {
  const { lines, totalItems, remove, setQuantity, clear } = useCart();
  const [productsBySlug, setProductsBySlug] = useState<Record<string, Product>>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? (data as Product[]) : [];
        const map: Record<string, Product> = {};
        for (const p of list) {
          if (p && typeof p.slug === "string") map[p.slug] = p;
        }
        setProductsBySlug(map);
      })
      .catch(() => {
        if (cancelled) return;
        setProductsBySlug({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enriched = useMemo(() => {
    return lines
      .map((l) => {
        const product = productsBySlug[l.productSlug];
        if (!product) return null;
        return { product, quantity: l.quantity };
      })
      .filter((x) => x !== null);
  }, [lines, productsBySlug]);

  const total = useMemo(() => {
    return enriched.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);
  }, [enriched]);

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/home-engine-service.png"
            alt="Carrito de compras de repuestos"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.86)_0%,rgba(10,10,10,0.68)_44%,rgba(10,10,10,0.56)_100%)]" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
                Carrito de compra
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Revisa tu selección antes de cotizar.
              </h1>
              <p className="mt-5 text-base leading-8 text-zinc-200 sm:text-lg">
                Validamos compatibilidad, referencia y disponibilidad antes de finalizar. El
                carrito funciona como base para armar tu pedido correctamente.
              </p>
            </div>

            <Link href="/tienda" className="text-sm font-semibold text-white/80 transition hover:text-white">
              Seguir comprando
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-[#f6f3ef]">
        <Container className="py-14 sm:py-16">
          {totalItems === 0 ? (
            <div className="border border-zinc-200 bg-white p-8">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Carrito vacío
              </div>
              <div className="mt-3 text-2xl font-semibold text-zinc-950">
                Aún no has agregado repuestos.
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-700">
                Explora la tienda, agrega los productos que necesites y luego te ayudamos a
                confirmar compatibilidad y disponibilidad.
              </p>
              <div className="mt-6">
                <Link
                  href="/tienda"
                  className="inline-flex items-center justify-center border border-primary bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#981b1f]"
                >
                  Ir a la tienda
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-200 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Productos agregados
                  </div>
                  {Object.keys(productsBySlug).length === 0 ? (
                    <div className="px-6 py-4 text-sm text-zinc-600">Cargando precios...</div>
                  ) : null}
                  <div className="divide-y divide-zinc-200">
                    {enriched.map((line) => (
                      <div key={line.product.slug} className="px-6 py-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="text-xl font-semibold tracking-tight text-zinc-950">
                              {line.product.name}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                                {line.product.category}
                              </span>
                              <span className="text-sm font-semibold text-zinc-900">
                                {formatMoney(line.product.priceCents, {
                                  currency: line.product.currency,
                                })}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
                            onClick={() => remove(line.product.slug)}
                          >
                            Quitar
                          </button>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="h-10 w-10 border border-zinc-300 bg-white text-zinc-900 transition hover:bg-zinc-50"
                              onClick={() => setQuantity(line.product.slug, line.quantity - 1)}
                            >
                              −
                            </button>
                            <input
                              className="h-10 w-16 border border-zinc-300 bg-white text-center text-sm text-zinc-900"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={line.quantity}
                              onChange={(e) => {
                                const next = Number(e.target.value);
                                setQuantity(line.product.slug, next);
                              }}
                            />
                            <button
                              type="button"
                              className="h-10 w-10 border border-zinc-300 bg-white text-zinc-900 transition hover:bg-zinc-50"
                              onClick={() => setQuantity(line.product.slug, line.quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className="sm:ml-auto text-lg font-semibold text-zinc-950">
                            {formatMoney(line.product.priceCents * line.quantity, {
                              currency: line.product.currency,
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="border border-zinc-200 bg-white p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Resumen del pedido
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm text-zinc-600">
                    <span>Productos</span>
                    <span className="font-semibold text-zinc-950">{totalItems}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-base text-zinc-700">
                    <span>Total referencial</span>
                    <span className="text-2xl font-semibold text-zinc-950">
                      {formatMoney(total, { currency: "USD" })}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <Link
                      className="inline-flex items-center justify-center border border-primary bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#981b1f]"
                      href="/checkout"
                    >
                      Continuar al checkout
                    </Link>
                    <button
                      type="button"
                      className="border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                      onClick={() => clear()}
                    >
                      Vaciar carrito
                    </button>
                  </div>

                  <p className="mt-5 text-xs leading-6 text-zinc-600">
                    El precio final puede variar según la referencia exacta, compatibilidad del
                    vehículo y disponibilidad al momento de confirmar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
