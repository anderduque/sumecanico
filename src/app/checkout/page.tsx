"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/cart/CartProvider";
import { Container } from "@/components/Container";
import { formatMoney } from "@/lib/money";
import type { PaymentMethod } from "@/lib/paymentMethodsStore";
import type { Product } from "@/lib/productTypes";
import { whatsAppWaMeUrl } from "@/lib/site";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function onlyDigits(value: string) {
  return value.replace(/\D+/g, "");
}

const latamCountries = [
  { flag: "🇻🇪", code: "+58", label: "Venezuela", phoneLength: 10 },
  { flag: "🇨🇴", code: "+57", label: "Colombia", phoneLength: 10 },
  { flag: "🇪🇨", code: "+593", label: "Ecuador", phoneLength: 9 },
  { flag: "🇵🇪", code: "+51", label: "Perú", phoneLength: 9 },
  { flag: "🇨🇱", code: "+56", label: "Chile", phoneLength: 9 },
  { flag: "🇦🇷", code: "+54", label: "Argentina", phoneLength: 10 },
] as const;

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

type FieldKey = "fullName" | "idNumber" | "phone" | "email" | "address" | "paymentMethod";

function fieldInputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none",
    hasError
      ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15"
      : "border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/15",
  ].join(" ");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, totalItems, remove, clear } = useCart();
  const [productsBySlug, setProductsBySlug] = useState<Record<string, Product>>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [countryCode, setCountryCode] = useState<(typeof latamCountries)[number]["code"]>("+58");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    fullName: false,
    idNumber: false,
    phone: false,
    email: false,
    address: false,
    paymentMethod: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, string | null>>({
    fullName: null,
    idNumber: null,
    phone: null,
    email: null,
    address: null,
    paymentMethod: null,
  });

  const fullNameRef = useRef<HTMLInputElement>(null);
  const idNumberRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

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
    if (Object.keys(productsBySlug).length === 0) return;
    const invalid = lines.filter((l) => !productsBySlug[l.productSlug]);
    if (invalid.length === 0) return;
    for (const line of invalid) remove(line.productSlug);
  }, [lines, productsBySlug, remove]);

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

  const showEmpty = totalItems === 0 || (Object.keys(productsBySlug).length > 0 && enriched.length === 0);

  const selectedPaymentMethod = useMemo(() => {
    return paymentMethods.find((m) => m.id === effectivePaymentMethodId) ?? null;
  }, [effectivePaymentMethodId, paymentMethods]);

  const selectedCountry = useMemo(() => {
    return latamCountries.find((item) => item.code === countryCode) ?? latamCountries[0];
  }, [countryCode]);

  function validateFullName(value: string) {
    const trimmed = value.trim().replace(/\s+/g, " ");
    if (!trimmed) return "Nombre completo es obligatorio.";
    if (!trimmed.includes(" ")) return "Ingresa nombre y apellido.";
    return null;
  }

  function validateIdNumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Cédula es obligatoria.";
    if (!/^\d+$/.test(trimmed)) return "La cédula solo puede contener números.";
    return null;
  }

  function validatePhone(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Teléfono es obligatorio.";
    if (!/^\d+$/.test(trimmed)) return "El teléfono solo puede contener números.";
    if (trimmed.length !== selectedCountry.phoneLength) {
      return `Ingresa ${selectedCountry.phoneLength} dígitos después de ${selectedCountry.code}.`;
    }
    return null;
  }

  function validateEmail(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (!emailPattern.test(trimmed)) return "Ingresa un correo válido o deja ese campo vacío.";
    return null;
  }

  function validateAddress(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Dirección es obligatoria.";
    return null;
  }

  function validatePaymentMethod(method: PaymentMethod | null) {
    if (!method) return "Selecciona un método de pago.";
    return null;
  }

  function touchField(key: FieldKey) {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }

  function setFieldError(key: FieldKey, message: string | null) {
    setFieldErrors((prev) => (prev[key] === message ? prev : { ...prev, [key]: message }));
  }

  function validateSequential(method: PaymentMethod | null) {
    const nextFullName = fullName.trim();
    const nextId = idNumber.trim();
    const nextPhone = phone.trim();
    const nextEmail = email.trim();
    const nextAddress = address.trim();

    const checks: { key: FieldKey; message: string | null; ref?: { current: HTMLInputElement | null } }[] = [
      { key: "fullName", message: validateFullName(nextFullName), ref: fullNameRef },
      { key: "idNumber", message: validateIdNumber(nextId), ref: idNumberRef },
      { key: "phone", message: validatePhone(nextPhone), ref: phoneRef },
      { key: "email", message: validateEmail(nextEmail), ref: emailRef },
      { key: "address", message: validateAddress(nextAddress), ref: addressRef },
      { key: "paymentMethod", message: validatePaymentMethod(method) },
    ];

    for (const check of checks) {
      setFieldError(check.key, check.message);
      if (check.message) {
        touchField(check.key);
        check.ref?.current?.focus();
        return false;
      }
    }
    return true;
  }

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

      {showEmpty ? (
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
              <form
                className="grid gap-4"
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div>
                  <input
                    ref={fullNameRef}
                    value={fullName}
                    onChange={(e) => {
                      const next = e.target.value;
                      setFullName(next);
                      if (!touched.fullName && !fieldErrors.fullName) return;
                      setFieldError("fullName", validateFullName(next));
                    }}
                    onBlur={() => {
                      touchField("fullName");
                      setFieldError("fullName", validateFullName(fullName));
                    }}
                    className={fieldInputClass(!!fieldErrors.fullName && touched.fullName)}
                    placeholder="Nombre Completo"
                    autoComplete="off"
                    name="full_name"
                  />
                  {touched.fullName && fieldErrors.fullName ? (
                    <div className="mt-2 text-xs font-semibold text-rose-700">{fieldErrors.fullName}</div>
                  ) : null}
                </div>

                <div>
                  <input
                    ref={idNumberRef}
                    value={idNumber}
                    onChange={(e) => {
                      const next = onlyDigits(e.target.value);
                      setIdNumber(next);
                      if (!touched.idNumber && !fieldErrors.idNumber) return;
                      setFieldError("idNumber", validateIdNumber(next));
                    }}
                    onBlur={() => {
                      touchField("idNumber");
                      setFieldError("idNumber", validateIdNumber(idNumber));
                    }}
                    className={fieldInputClass(!!fieldErrors.idNumber && touched.idNumber)}
                    placeholder="Cédula de Identidad"
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    name="id_number"
                  />
                  {touched.idNumber && fieldErrors.idNumber ? (
                    <div className="mt-2 text-xs font-semibold text-rose-700">{fieldErrors.idNumber}</div>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <label className="sr-only" htmlFor="country_code">
                      País
                    </label>
                    <div className="relative">
                      <select
                        id="country_code"
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value as (typeof latamCountries)[number]["code"]);
                          setPhone("");
                          setTouched((prev) => ({ ...prev, phone: false }));
                          setFieldError("phone", null);
                        }}
                        className="h-[46px] w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 pr-8 text-sm font-semibold text-zinc-700 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                        autoComplete="off"
                        name="country_code"
                      >
                        {latamCountries.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
                        ▾
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-9">
                    <input
                      ref={phoneRef}
                      value={phone}
                      onChange={(e) => {
                        const next = onlyDigits(e.target.value);
                        setPhone(next);
                        if (!touched.phone && !fieldErrors.phone) return;
                        setFieldError("phone", validatePhone(next));
                      }}
                      onBlur={() => {
                        touchField("phone");
                        setFieldError("phone", validatePhone(phone));
                      }}
                      className={fieldInputClass(!!fieldErrors.phone && touched.phone)}
                      placeholder="Teléfono"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      maxLength={selectedCountry.phoneLength}
                      name="phone"
                    />
                    {touched.phone && fieldErrors.phone ? (
                      <div className="mt-2 text-xs font-semibold text-rose-700">{fieldErrors.phone}</div>
                    ) : (
                      <div className="mt-2 text-xs text-zinc-500">
                        {selectedCountry.flag} {selectedCountry.label}: ingresa {selectedCountry.phoneLength} dígitos después de{" "}
                        {selectedCountry.code}.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    ref={emailRef}
                    value={email}
                    onChange={(e) => {
                      const next = e.target.value;
                      setEmail(next);
                      if (!touched.email && !fieldErrors.email) return;
                      setFieldError("email", validateEmail(next));
                    }}
                    onBlur={() => {
                      touchField("email");
                      setFieldError("email", validateEmail(email));
                    }}
                    className={fieldInputClass(!!fieldErrors.email && touched.email)}
                    placeholder="Correo Electrónico (Opcional)"
                    inputMode="email"
                    autoComplete="off"
                    name="email"
                  />
                  {touched.email && fieldErrors.email ? (
                    <div className="mt-2 text-xs font-semibold text-rose-700">{fieldErrors.email}</div>
                  ) : null}
                </div>
                <div>
                  <input
                    ref={addressRef}
                    value={address}
                    onChange={(e) => {
                      const next = e.target.value;
                      setAddress(next);
                      if (!touched.address && !fieldErrors.address) return;
                      setFieldError("address", validateAddress(next));
                    }}
                    onBlur={() => {
                      touchField("address");
                      setFieldError("address", validateAddress(address));
                    }}
                    className={fieldInputClass(!!fieldErrors.address && touched.address)}
                    placeholder="Dirección Completa"
                    autoComplete="off"
                    name="address"
                  />
                  {touched.address && fieldErrors.address ? (
                    <div className="mt-2 text-xs font-semibold text-rose-700">{fieldErrors.address}</div>
                  ) : (
                    <div className="mt-2 text-xs text-zinc-500">
                      Sugerencia: calle, número de casa o apartamento, sector y ciudad.
                    </div>
                  )}
                </div>
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
                        onClick={() => {
                          setPaymentMethodId(m.id);
                          setFieldError("paymentMethod", null);
                        }}
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
                {touched.paymentMethod && fieldErrors.paymentMethod ? (
                  <div className="text-xs font-semibold text-rose-700">{fieldErrors.paymentMethod}</div>
                ) : null}

                <input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Número de Referencia"
                  autoComplete="off"
                  inputMode="text"
                  name="payment_reference"
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
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={async () => {
                      if (submitting) return;
                      setError(null);
                      const method = selectedPaymentMethod;
                      if (!validateSequential(method)) return;

                      const normalizedFullName = fullName.trim().replace(/\s+/g, " ").trim();
                      const nextId = idNumber.trim();
                      const nextPhone = phone.trim();
                      const nextEmail = email.trim();
                      const nextAddress = address.trim();
                      const message = buildCheckoutMessage({
                        items: enriched.map((x) => ({ name: x.product.name, quantity: x.quantity })),
                        totalCents,
                        fullName: normalizedFullName,
                        idNumber: nextId,
                        phone: `${selectedCountry.code} ${nextPhone}`,
                        email: nextEmail || undefined,
                        address: nextAddress,
                        paymentMethodName: method ? method.name : "",
                        paymentReference: paymentReference.trim() ? paymentReference.trim() : undefined,
                      });
                      const phoneE164 = `${selectedCountry.code}${nextPhone}`.replace(/\s+/g, "");
                      const orderPayload = {
                        customer: {
                          fullName: normalizedFullName,
                          idNumber: nextId,
                          phoneE164,
                          email: nextEmail || undefined,
                          address: nextAddress,
                        },
                        items: enriched.map((x) => ({
                          productSlug: x.product.slug,
                          name: x.product.name,
                          quantity: x.quantity,
                          priceCents: x.product.priceCents,
                          currency: x.product.currency,
                        })),
                        totalCents,
                        currency: "USD",
                        payment: {
                          methodId: method ? method.id : "",
                          methodName: method ? method.name : "",
                          reference: paymentReference.trim() ? paymentReference.trim() : undefined,
                        },
                        message,
                      };
                      setSubmitting(true);
                      try {
                        const res = await fetch("/api/orders", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(orderPayload),
                        });
                        if (!res.ok) {
                          setError(
                            "No se pudo registrar la orden en el sistema. Igual abrimos WhatsApp para finalizar con el asesor.",
                          );
                        }
                      } catch {
                        setError(
                          "No se pudo registrar la orden en el sistema. Igual abrimos WhatsApp para finalizar con el asesor.",
                        );
                      } finally {
                        setSubmitting(false);
                      }
                      const url = whatsAppWaMeUrl(message);
                      window.open(url, "_blank", "noopener,noreferrer");
                      
                      // Empty cart and go back to store/home after successful submission
                      clear();
                      router.push("/tienda");
                    }}
                  >
                    {submitting ? "Enviando..." : "Reservar y Enviar"}
                  </button>
                </div>
              </form>
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
