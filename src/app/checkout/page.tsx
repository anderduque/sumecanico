"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/cart/CartProvider";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/money";
import type { PaymentMethod } from "@/lib/paymentMethodsStore";
import type { Product } from "@/lib/productTypes";
import { whatsAppWaMeUrl } from "@/lib/site";

function buildCheckoutMessage(input: {
  items: { name: string; quantity: number }[];
  totalCents: number;
  fullName: string;
  idNumber: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethodName: string;
  paymentReference?: string;
}) {
  const itemsText = input.items.map((l) => `- ${l.quantity} x ${l.name}`).join("\n");
  const lines = [
    "Hola, quiero reservar/confirmar esta compra de repuestos:",
    itemsText,
    "",
    `Total sugerido: ${formatMoney(input.totalCents, { currency: "USD" })}`,
    "",
    "Datos del cliente:",
    `- Nombre: ${input.fullName}`,
    `- Cédula: ${input.idNumber}`,
    `- Teléfono: ${input.phone}`,
    input.email ? `- Email: ${input.email}` : null,
    `- Dirección: ${input.address}`,
    "",
    `Método de pago: ${input.paymentMethodName}`,
    input.paymentReference ? `Referencia: ${input.paymentReference}` : null,
    "",
    "Mi vehículo es:",
  ].filter(Boolean);
  return lines.join("\n");
}

function splitLines(text: string) {
  return text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function CheckoutPage() {
  const { lines, totalItems } = useCart();
  const [productsBySlug, setProductsBySlug] = useState<Record<string, Product>>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payment-methods", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? (data as PaymentMethod[]) : [];
        setPaymentMethods(
          list
            .filter((m) => m && typeof m.id === "string")
            .sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name)),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setPaymentMethods([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const effectivePaymentMethodId = useMemo(() => {
    return paymentMethodId || paymentMethods[0]?.id || "";
  }, [paymentMethodId, paymentMethods]);

  const enriched = useMemo(() => {
    return lines
      .map((l) => {
        const product = productsBySlug[l.productSlug];
        if (!product) return null;
        return { product, quantity: l.quantity };
      })
      .filter((x) => x !== null);
  }, [lines, productsBySlug]);

  const totalCents = useMemo(() => {
    return enriched.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);
  }, [enriched]);

  const selectedPaymentMethod = useMemo(() => {
    return paymentMethods.find((m) => m.id === effectivePaymentMethodId) ?? null;
  }, [effectivePaymentMethodId, paymentMethods]);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex items-center gap-3">
        <Link
          href="/carrito"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
          aria-label="Volver al carrito"
        >
          ←
        </Link>
        <div className="text-lg font-semibold text-zinc-950">Tus Datos</div>
      </div>

      {totalItems === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8">
          <div className="text-base font-semibold text-zinc-950">Tu carrito está vacío</div>
          <p className="mt-2 text-sm text-zinc-700">Agrega repuestos para continuar.</p>
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
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="grid gap-4">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Nombre Completo"
                />
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Cédula de Identidad"
                />
                <div className="grid gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <div className="flex h-[46px] items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm">
                      🇻🇪 +58
                    </div>
                  </div>
                  <div className="sm:col-span-9">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="Teléfono"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Correo Electrónico (Opcional)"
                  inputMode="email"
                />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Dirección Completa"
                />
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                    $
                  </div>
                  <input
                    value={`Monto a Pagar (Total sugerido: ${formatMoney(totalCents, { currency: "USD" })})`}
                    readOnly
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-10 py-3 text-sm font-semibold text-zinc-700 shadow-sm"
                  />
                </div>

                <div className="grid gap-3">
                  {paymentMethods.map((m) => {
                    const active = m.id === effectivePaymentMethodId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethodId(m.id)}
                        className={[
                          "w-full rounded-xl border px-4 py-3 text-left shadow-sm transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-zinc-200 bg-white hover:bg-zinc-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-zinc-950">{m.name}</div>
                          <div
                            className={[
                              "h-4 w-4 rounded-full border",
                              active ? "border-primary bg-primary" : "border-zinc-300 bg-white",
                            ].join(" ")}
                          />
                        </div>
                        {active ? (
                          <div className="mt-2 grid gap-1 text-sm text-zinc-700">
                            {splitLines(m.details).map((line) => (
                              <div key={line}>{line}</div>
                            ))}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Número de Referencia"
                />

                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  Al confirmar, serás redirigido a WhatsApp para hablar con un asesor y finalizar tu
                  compra.
                </div>

                {error ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/carrito"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:brightness-110"
                    onClick={() => {
                      setError(null);
                      const method = selectedPaymentMethod;
                      if (!method) {
                        setError("Selecciona un método de pago.");
                        return;
                      }
                      const nextFullName = fullName.trim();
                      const nextId = idNumber.trim();
                      const nextPhone = phone.trim();
                      const nextAddress = address.trim();
                      if (!nextFullName || !nextId || !nextPhone || !nextAddress) {
                        setError("Completa nombre, cédula, teléfono y dirección.");
                        return;
                      }
                      const message = buildCheckoutMessage({
                        items: enriched.map((x) => ({ name: x.product.name, quantity: x.quantity })),
                        totalCents,
                        fullName: nextFullName,
                        idNumber: nextId,
                        phone: nextPhone,
                        email: email.trim() ? email.trim() : undefined,
                        address: nextAddress,
                        paymentMethodName: method.name,
                        paymentReference: paymentReference.trim() ? paymentReference.trim() : undefined,
                      });
                      const url = whatsAppWaMeUrl(message);
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Reservar y Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-semibold text-zinc-950">Resumen</div>
              <div className="mt-4 grid gap-3">
                {enriched.map((line) => (
                  <div key={line.product.slug} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{line.product.name}</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {line.quantity} × {formatMoney(line.product.priceCents, { currency: line.product.currency })}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {formatMoney(line.product.priceCents * line.quantity, { currency: line.product.currency })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
                <span>Total</span>
                <span className="font-semibold text-zinc-950">
                  {formatMoney(totalCents, { currency: "USD" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
