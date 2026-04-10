"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import type { Product } from "@/lib/productTypes";
import { formatMoney } from "@/lib/money";

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

export function AdminClient() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [authHeader, setAuthHeader] = useState<string | null>(null);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [draft, setDraft] = useState<Product>(emptyProduct());
  const [compatibleWithText, setCompatibleWithText] = useState("");
  const [showPanel, setShowPanel] = useState(false);

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

    const payload: Product = {
      ...draft,
      slug: draft.slug.trim(),
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
        setError("El slug ya existe.");
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
  }

  return (
    <Container className="py-10 sm:py-14">
      {!authHeader ? (
        <div className="mx-auto mt-10 grid w-full max-w-md gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-zinc-950">Iniciar sesión</div>
            <div className="mt-1 text-sm text-zinc-600">Panel de administración</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="user" className="text-sm font-semibold text-zinc-900">
                Usuario
              </label>
              <input
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-zinc-900">
                Contraseña
              </label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error}
            </div>
          ) : null}
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90"
              onClick={() => {
                const header = toAuthHeader(user, password);
                setAuthHeader(header);
                load(header);
              }}
            >
              Entrar
            </button>
          </div>
        </div>
      ) : (
        <>
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
              Agrega/edita repuestos con imagen, precio y cantidad. La tienda se actualiza con
              estos cambios.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white">
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
                          {p.category} · {p.slug}
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
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="slug">
                        Slug
                      </label>
                      <input
                        id="slug"
                        value={draft.slug}
                        onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="pastillas-freno-delanteras"
                        disabled={isEditingExisting}
                      />
                    </div>

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
                      <input
                        id="category"
                        value={draft.category}
                        onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Frenos"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="imageUrl">
                        Imagen (URL)
                      </label>
                      <input
                        id="imageUrl"
                        value={draft.imageUrl ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="https://..."
                      />
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
                        <input
                          id="currency"
                          value={draft.currency}
                          onChange={(e) => setDraft((p) => ({ ...p, currency: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                          placeholder="USD"
                        />
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
        </>
      )}
    </Container>
  );
}
