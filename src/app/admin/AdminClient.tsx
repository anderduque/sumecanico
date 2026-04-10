"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import type { Product } from "@/lib/productTypes";
import type { PaymentMethod } from "@/lib/paymentMethodsStore";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";

type LoadState = "idle" | "loading" | "ready" | "error";

function toAuthHeader(user: string, password: string) {
  const token = btoa(`${user}:${password}`);
  return `Basic ${token}`;
}

function emptyProduct(): Product {
  return {
    slug: "",
    name: "",
    summary: "",
    category: "",
    imageUrl: "",
    priceCents: 0,
    currency: "USD",
    stockStatus: "on_request",
    inventoryQty: 0,
    compatibleWith: [],
  };
}

function parseCompatibleWith(text: string) {
  const list = text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

function compatibleWithToText(list: string[] | undefined) {
  return list?.join(", ") ?? "";
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const productCategoryOptions = [
  "Frenos",
  "Motor",
  "Encendido",
  "Mantenimiento",
  "Accesorios",
  "Filtros",
  "Adicional",
] as const;

const maxUploadImageBytes = 2_000_000;
const maxUploadImageDimension = 1024;
const maxUploadImageOutputBytes = 900_000;

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

async function fileToOptimizedJpegDataUrl(file: File) {
  if (file.size > maxUploadImageBytes) {
    throw new Error("La imagen es muy pesada. Máximo 2MB.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxUploadImageDimension / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("No se pudo procesar la imagen.");
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close?.();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrlToBytes(dataUrl) > maxUploadImageOutputBytes && quality > 0.5) {
    quality = Math.max(0.5, quality - 0.08);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrlToBytes(dataUrl) > maxUploadImageOutputBytes) {
    throw new Error("No se pudo optimizar la imagen lo suficiente. Usa una imagen más liviana.");
  }
  return dataUrl;
}

export function AdminClient() {
  const [user, setUser] = useState(() => {
    try {
      if (typeof window === "undefined") return "";
      return localStorage.getItem("admin_user") ?? "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [authHeader, setAuthHeader] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [draft, setDraft] = useState<Product>(emptyProduct());
  const [compatibleWithText, setCompatibleWithText] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  const [tab, setTab] = useState<"products" | "payments">("products");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentsState, setPaymentsState] = useState<LoadState>("idle");
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [paymentsSaved, setPaymentsSaved] = useState(false);

  const isEditingExisting = useMemo(() => {
    return !!draft.slug && products.some((p) => p.slug === draft.slug);
  }, [draft.slug, products]);

  async function load(nextAuthHeader: string) {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: nextAuthHeader },
        cache: "no-store",
      });
      if (res.status === 401) {
        setAuthHeader(null);
        setState("error");
        setError("Credenciales inválidas o no configuradas.");
        return;
      }
      if (!res.ok) {
        setState("error");
        setError("No se pudo cargar el catálogo.");
        return;
      }
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? (data as Product[]) : [];
      setProducts(list);
      setState("ready");
    } catch {
      setState("error");
      setError("No se pudo cargar el catálogo.");
    }
  }

  async function loadPaymentMethods(nextAuthHeader: string) {
    setPaymentsState("loading");
    setPaymentsError(null);
    setPaymentsSaved(false);
    try {
      const res = await fetch("/api/admin/payment-methods", {
        headers: { Authorization: nextAuthHeader },
        cache: "no-store",
      });
      if (res.status === 401) {
        setAuthHeader(null);
        setPaymentsState("error");
        setPaymentsError("Credenciales inválidas o no configuradas.");
        return;
      }
      if (!res.ok) {
        setPaymentsState("error");
        setPaymentsError("No se pudieron cargar los métodos de pago.");
        return;
      }
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? (data as PaymentMethod[]) : [];
      setPaymentMethods(
        list
          .filter((m) => m && typeof m.id === "string")
          .sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name)),
      );
      setPaymentsState("ready");
    } catch {
      setPaymentsState("error");
      setPaymentsError("No se pudieron cargar los métodos de pago.");
    }
  }

  async function savePaymentMethods() {
    if (!authHeader) return;
    setPaymentsState("loading");
    setPaymentsError(null);
    setPaymentsSaved(false);

    const normalized: PaymentMethod[] = paymentMethods
      .map((m, idx) => ({
        id: m.id.trim(),
        name: m.name.trim(),
        details: m.details ?? "",
        enabled: !!m.enabled,
        sort: Number.isFinite(m.sort) ? Math.trunc(m.sort) : (idx + 1) * 10,
      }))
      .filter((m) => m.id && m.name);

    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalized),
      });
      if (res.status === 401) {
        setAuthHeader(null);
        setPaymentsState("error");
        setPaymentsError("Credenciales inválidas o no configuradas.");
        return;
      }
      if (!res.ok) {
        setPaymentsState("error");
        setPaymentsError("No se pudieron guardar los métodos de pago.");
        return;
      }
      await loadPaymentMethods(authHeader);
      setPaymentsSaved(true);
    } catch {
      setPaymentsState("error");
      setPaymentsError("No se pudieron guardar los métodos de pago.");
    }
  }

  function selectProduct(p: Product) {
    setDraft({
      ...p,
      imageUrl: p.imageUrl ?? "",
      inventoryQty: typeof p.inventoryQty === "number" ? p.inventoryQty : 0,
      compatibleWith: p.compatibleWith ?? [],
    });
    setCompatibleWithText(compatibleWithToText(p.compatibleWith));
    setError(null);
    setShowPanel(true);
  }

  function startNew() {
    setDraft(emptyProduct());
    setCompatibleWithText("");
    setError(null);
    setShowPanel(true);
  }

  async function save() {
    if (!authHeader) return;
    setState("loading");
    setError(null);

    const derivedSlug = isEditingExisting ? draft.slug.trim() : slugify(draft.name);
    if (!derivedSlug) {
      setState("error");
      setError("Coloca un nombre válido para el repuesto.");
      return;
    }

    const payload: Product = {
      ...draft,
      slug: derivedSlug,
      name: draft.name.trim(),
      summary: draft.summary.trim(),
      category: draft.category.trim(),
      currency: draft.currency.trim().toUpperCase(),
      imageUrl: draft.imageUrl?.trim() ? draft.imageUrl.trim() : undefined,
      compatibleWith: parseCompatibleWith(compatibleWithText),
      inventoryQty:
        typeof draft.inventoryQty === "number"
          ? Math.max(0, Math.trunc(draft.inventoryQty))
          : undefined,
    };

    const method = isEditingExisting ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setAuthHeader(null);
        setState("error");
        setError("Credenciales inválidas o no configuradas.");
        return;
      }

      if (res.status === 409) {
        setState("error");
        setError("Ya existe un repuesto con ese identificador.");
        return;
      }

      if (!res.ok) {
        setState("error");
        setError("No se pudo guardar el producto.");
        return;
      }

      await load(authHeader);
      setState("ready");
    } catch {
      setState("error");
      setError("No se pudo guardar el producto.");
    }
  }

  async function remove() {
    if (!authHeader) return;
    if (!draft.slug.trim()) return;

    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: draft.slug }),
      });
      if (res.status === 401) {
        setAuthHeader(null);
        setState("error");
        setError("Credenciales inválidas o no configuradas.");
        return;
      }
      if (!res.ok) {
        setState("error");
        setError("No se pudo eliminar el producto.");
        return;
      }
      await load(authHeader);
      startNew();
      setState("ready");
    } catch {
      setState("error");
      setError("No se pudo eliminar el producto.");
    }
  }

  function logout() {
    setAuthHeader(null);
    setUser("");
    setPassword("");
    setProducts([]);
    setDraft(emptyProduct());
    setCompatibleWithText("");
    setError(null);
    setState("idle");
    setShowPanel(false);
    setTab("products");
    setPaymentMethods([]);
    setPaymentsError(null);
    setPaymentsState("idle");
    setPaymentsSaved(false);
  }

  async function login() {
    const nextUser = user.trim();
    if (!nextUser || !password) {
      setError("Completa usuario y contraseña.");
      return;
    }

    try {
      if (rememberMe) localStorage.setItem("admin_user", nextUser);
      else localStorage.removeItem("admin_user");
    } catch {}

    const header = toAuthHeader(nextUser, password);
    setAuthHeader(header);
    await load(header);
    await loadPaymentMethods(header);
  }

  if (!authHeader) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-slate-900 to-[#0b2a4a]">
        <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center px-4 py-10">
          <div className="text-sm font-semibold tracking-wide text-white/80">
            Inicio de Sesión
          </div>
          <div className="mt-6 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5">
            <div className="flex justify-center">
              <div className="relative h-12 w-44">
                <Image
                  src={site.logoPath}
                  alt={`${site.name} logo`}
                  fill
                  className="object-contain"
                  sizes="176px"
                  priority
                />
              </div>
            </div>
            <div className="mt-5 text-center text-4xl font-extrabold tracking-tight text-[#123b63]">
              {site.name.toUpperCase()}
              <span className="text-primary">.</span>
            </div>

            <form
              className="mt-8 grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                void login();
              }}
            >
              <div className="grid gap-2">
                <label
                  htmlFor="user"
                  className="text-xs font-semibold tracking-widest text-zinc-500"
                >
                  EMAIL*
                </label>
                <input
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                  placeholder="usuario@ejemplo.com"
                  autoComplete="username"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold tracking-widest text-zinc-500"
                >
                  CONTRASEÑA*
                </label>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <label className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-[#1b4f7d]"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Recordarme
              </label>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-1 w-full rounded-xl bg-[#1b4f7d] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1b4f7d]/20 hover:brightness-110 disabled:opacity-60"
                disabled={state === "loading"}
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
          <div className="mt-8 text-xs font-semibold tracking-widest text-white/40">
            © {site.name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="bg-gradient-to-r from-primary to-zinc-950 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
          Admin · Inventario
        </h1>
        <p className="text-sm text-zinc-700">
          Agrega/edita repuestos con imagen, precio y cantidad. La tienda se actualiza con estos
          cambios.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          className={[
            "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            tab === "products"
              ? "bg-primary text-white"
              : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
          ].join(" ")}
          onClick={() => setTab("products")}
        >
          Repuestos
        </button>
        <button
          type="button"
          className={[
            "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            tab === "payments"
              ? "bg-primary text-white"
              : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
          ].join(" ")}
          onClick={() => setTab("payments")}
        >
          Métodos de pago
        </button>
      </div>

      {tab === "products" ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4">
            <div className="text-sm font-semibold text-zinc-950">Repuestos</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                onClick={() => load(authHeader)}
                disabled={state === "loading"}
              >
                Recargar
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:brightness-90"
                onClick={startNew}
              >
                Nuevo
              </button>
            </div>
          </div>
          <div className="divide-y divide-zinc-200">
            {products.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => selectProduct(p)}
                className="w-full px-6 py-4 text-left hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg border border-zinc-200 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border border-zinc-200 bg-zinc-50" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{p.name}</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {p.category || "Sin categoría"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-900">
                      {formatMoney(p.priceCents, { currency: p.currency })}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600">
                      Inventario: {typeof p.inventoryQty === "number" ? p.inventoryQty : "—"}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {products.length === 0 ? (
              <div className="px-6 py-6 text-sm text-zinc-600">No hay productos.</div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4">
            <div className="text-sm font-semibold text-zinc-950">Métodos de pago</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                onClick={() => loadPaymentMethods(authHeader)}
                disabled={paymentsState === "loading"}
              >
                Recargar
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:brightness-90"
                onClick={() => {
                  const nextSort =
                    paymentMethods.length > 0 ? Math.max(...paymentMethods.map((m) => m.sort)) + 10 : 10;
                  setPaymentMethods((prev) => [
                    ...prev,
                    { id: "", name: "", details: "", enabled: true, sort: nextSort },
                  ]);
                  setPaymentsSaved(false);
                }}
              >
                Agregar
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                onClick={() => void savePaymentMethods()}
                disabled={paymentsState === "loading"}
              >
                Guardar
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {paymentsError ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {paymentsError}
              </div>
            ) : null}
            {paymentsSaved ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Métodos de pago guardados.
              </div>
            ) : null}

            <div className="grid gap-4">
              {paymentMethods.map((m, idx) => (
                <div key={`${m.id}-${idx}`} className="rounded-2xl border border-zinc-200 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900">Nombre</label>
                      <input
                        value={m.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPaymentMethods((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, name: value } : x)),
                          );
                          setPaymentsSaved(false);
                        }}
                        onBlur={() => {
                          if (!m.id.trim() && m.name.trim()) {
                            const nextId = slugify(m.name);
                            setPaymentMethods((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, id: nextId } : x)),
                            );
                          }
                        }}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Pago móvil"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900">Código</label>
                      <input
                        value={m.id}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPaymentMethods((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, id: value } : x)),
                          );
                          setPaymentsSaved(false);
                        }}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="pago-movil"
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <label className="text-sm font-semibold text-zinc-900">Detalles</label>
                    <textarea
                      value={m.details}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPaymentMethods((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, details: value } : x)),
                        );
                        setPaymentsSaved(false);
                      }}
                      className="min-h-[90px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                      placeholder="Datos del método (una línea por dato)"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-primary"
                        checked={m.enabled}
                        onChange={(e) => {
                          const value = e.target.checked;
                          setPaymentMethods((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, enabled: value } : x)),
                          );
                          setPaymentsSaved(false);
                        }}
                      />
                      Activo
                    </label>
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
                      onClick={() => {
                        setPaymentMethods((prev) => prev.filter((_, i) => i !== idx));
                        setPaymentsSaved(false);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                  No hay métodos de pago.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showPanel ? (
        <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowPanel(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                  <div className="text-sm font-semibold text-zinc-950">
                    {isEditingExisting ? "Editar repuesto" : "Crear repuesto"}
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-200 px-2 py-1 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    onClick={() => setShowPanel(false)}
                  >
                    Cerrar
                  </button>
                </div>
                <div className="max-h-[calc(100%-56px)] overflow-y-auto p-5">
                  {error ? (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                      {error}
                    </div>
                  ) : null}
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="name">
                        Nombre
                      </label>
                      <input
                        id="name"
                        value={draft.name}
                        onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Pastillas de freno delanteras"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="category">
                        Categoría
                      </label>
                      <select
                        id="category"
                        value={draft.category}
                        onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                      >
                        <option value="">Selecciona una categoría</option>
                        {productCategoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="imageFile">
                        Imagen
                      </label>
                      {draft.imageUrl ? (
                        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                          <img
                            src={draft.imageUrl}
                            alt={draft.name || "Imagen del repuesto"}
                            className="h-44 w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid h-44 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-500">
                          Sin imagen
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id="imageFile"
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-200"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setState("loading");
                            setError(null);
                            void fileToOptimizedJpegDataUrl(file)
                              .then((dataUrl) => {
                                setDraft((p) => ({ ...p, imageUrl: dataUrl }));
                                setState("ready");
                              })
                              .catch((err: unknown) => {
                                setState("error");
                                setError(err instanceof Error ? err.message : "No se pudo cargar la imagen.");
                              });
                          }}
                        />
                        {draft.imageUrl ? (
                          <button
                            type="button"
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                            onClick={() => setDraft((p) => ({ ...p, imageUrl: "" }))}
                          >
                            Quitar imagen
                          </button>
                        ) : null}
                      </div>
                      <div className="text-xs text-zinc-600">
                        Máximo 2MB · Se optimiza automáticamente (hasta {maxUploadImageDimension}px).
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-zinc-900" htmlFor="priceCents">
                          Precio (centavos)
                        </label>
                        <input
                          id="priceCents"
                          value={String(draft.priceCents ?? 0)}
                          onChange={(e) =>
                            setDraft((p) => ({ ...p, priceCents: Number(e.target.value) }))
                          }
                          inputMode="numeric"
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                          placeholder="650000"
                        />
                        <div className="text-xs text-zinc-600">
                          Vista:{" "}
                          {formatMoney(Number(draft.priceCents) || 0, { currency: draft.currency })}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-zinc-900" htmlFor="currency">
                          Moneda
                        </label>
                        <select
                          id="currency"
                          value={draft.currency}
                          onChange={(e) => setDraft((p) => ({ ...p, currency: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        >
                          <option value="USD">Dólares (USD)</option>
                          <option value="VES">Bolívares (Bs)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label
                          className="text-sm font-semibold text-zinc-900"
                          htmlFor="inventoryQty"
                        >
                          Inventario (cantidad)
                        </label>
                        <input
                          id="inventoryQty"
                          value={String(draft.inventoryQty ?? 0)}
                          onChange={(e) =>
                            setDraft((p) => ({ ...p, inventoryQty: Number(e.target.value) }))
                          }
                          inputMode="numeric"
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-zinc-900" htmlFor="stockStatus">
                          Estado
                        </label>
                        <select
                          id="stockStatus"
                          value={draft.stockStatus}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              stockStatus: e.target.value as Product["stockStatus"],
                            }))
                          }
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        >
                          <option value="in_stock">En stock</option>
                          <option value="on_request">Bajo pedido</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="summary">
                        Descripción corta
                      </label>
                      <textarea
                        id="summary"
                        value={draft.summary}
                        onChange={(e) => setDraft((p) => ({ ...p, summary: e.target.value }))}
                        className="min-h-[90px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Kit delantero. Verifica compatibilidad..."
                      />
                    </div>

                    <div className="grid gap-2">
                      <label
                        className="text-sm font-semibold text-zinc-900"
                        htmlFor="compatibleWith"
                      >
                        Compatibilidad (separada por comas)
                      </label>
                      <input
                        id="compatibleWith"
                        value={compatibleWithText}
                        onChange={(e) => setCompatibleWithText(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Sedán, Hatchback, SUV"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4">
                  {isEditingExisting ? (
                    <button
                      type="button"
                      onClick={remove}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
                      disabled={state === "loading"}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPanel(false)}
                      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={save}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90"
                      disabled={state === "loading"}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
        </div>
      ) : null}
    </Container>
  );
}
