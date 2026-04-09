"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/cart/CartProvider";
import { Container } from "@/components/Container";
import { products } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { whatsAppWaMeUrl } from "@/lib/site";

function buildOrderMessage(lines: { name: string; quantity: number }[]) {
  const itemsText = lines
    .map((l) => `- ${l.quantity} x ${l.name}`)
    .join("\n");
  return `Hola, quiero cotizar/confirmar este pedido de repuestos:\n${itemsText}\n\nMi vehículo es:`;
}

export default function CarritoPage() {
  const { lines, totalItems, remove, setQuantity, clear } = useCart();
  const [note, setNote] = useState("");

  const enriched = useMemo(() => {
    return lines
      .map((l) => {
        const product = products.find((p) => p.slug === l.productSlug);
        if (!product) return null;
        return { product, quantity: l.quantity };
      })
      .filter((x) => x !== null);
  }, [lines]);

  const total = useMemo(() => {
    return enriched.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);
  }, [enriched]);

  const whatsappUrl = useMemo(() => {
    const items = enriched.map((x) => ({ name: x.product.name, quantity: x.quantity }));
    const base = buildOrderMessage(items);
    const withNote = note.trim()
      ? `${base}\n\nNotas:\n${note.trim()}`
      : base;
    return whatsAppWaMeUrl(withNote);
  }, [enriched, note]);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">Carrito</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">
            Revisa cantidades y envía el pedido por WhatsApp. Confirmamos compatibilidad y
            disponibilidad antes de finalizar.
          </p>
        </div>
        <Link href="/tienda" className="text-sm font-semibold text-zinc-900 hover:underline">
          Seguir comprando
        </Link>
      </div>

      {totalItems === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-8">
          <div className="text-base font-semibold text-zinc-950">Tu carrito está vacío</div>
          <p className="mt-2 text-sm text-zinc-700">
            Explora la tienda y agrega repuestos para cotizar.
          </p>
          <div className="mt-5">
            <Link
              href="/tienda"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90"
            >
              Ir a la tienda
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-6 py-4 text-sm font-semibold text-zinc-950">
                Productos
              </div>
              <div className="divide-y divide-zinc-200">
                {enriched.map((line) => (
                  <div key={line.product.slug} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-zinc-950">
                          {line.product.name}
                        </div>
                        <div className="mt-1 text-sm text-zinc-600">
                          {line.product.category}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-zinc-900">
                          {formatMoney(line.product.priceCents, {
                            currency: line.product.currency,
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-sm font-semibold text-zinc-700 hover:text-zinc-950"
                        onClick={() => remove(line.product.slug)}
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                        onClick={() => setQuantity(line.product.slug, line.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        className="h-9 w-16 rounded-lg border border-zinc-300 bg-white text-center text-sm text-zinc-900"
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
                        className="h-9 w-9 rounded-lg border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                        onClick={() => setQuantity(line.product.slug, line.quantity + 1)}
                      >
                        +
                      </button>
                      <div className="ml-auto text-sm font-semibold text-zinc-900">
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

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-semibold text-zinc-950">Resumen</div>
              <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
                <span>Total</span>
                <span className="font-semibold text-zinc-950">
                  {formatMoney(total, { currency: "USD" })}
                </span>
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-zinc-900" htmlFor="note">
                  Notas (opcional)
                </label>
                <textarea
                  id="note"
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: necesito entrega hoy, tengo foto del repuesto, etc."
                />
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enviar pedido por WhatsApp
                </a>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  onClick={() => clear()}
                >
                  Vaciar carrito
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-600">
                El total es referencial. El precio final depende de la referencia exacta y
                disponibilidad.
              </p>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
