"use client";

import Link from "next/link";
import { useState } from "react";

type StoreFiltersProps = {
  q: string;
  category: string;
  stock: string;
  pricing: string;
  brand: string;
  position: string;
  categories: string[];
  hasActiveFilters: boolean;
  filterProducts: Array<{
    category: string;
    stockStatus: "in_stock" | "on_request";
    pricingMode?: "fixed" | "check_availability";
    shockBrand?: string;
    shockPosition?: "delantero" | "trasero";
  }>;
};

function fieldClassName(disabled = false) {
  return [
    "min-w-0 rounded-[1rem] border px-4 py-3 text-sm outline-none transition",
    disabled
      ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
      : "border-zinc-200 bg-white text-zinc-950 focus:border-primary",
  ].join(" ");
}

function uniqueSortedStrings(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && value.trim() !== ""))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function StoreFilters({
  q,
  category: initialCategory,
  stock: initialStock,
  pricing: initialPricing,
  brand: initialBrand,
  position: initialPosition,
  categories,
  hasActiveFilters,
  filterProducts,
}: StoreFiltersProps) {
  const [category, setCategory] = useState(initialCategory);
  const [stock, setStock] = useState(initialStock);
  const [pricing, setPricing] = useState(initialPricing);
  const [brand, setBrand] = useState(initialBrand);
  const [position, setPosition] = useState(initialPosition);

  const hasCategory = category.trim() !== "";
  const isShockCategory = category === "Amortiguadores";
  const categoryProducts = filterProducts.filter((item) => item.category === category);
  const availableShockBrands = uniqueSortedStrings(categoryProducts.map((item) => item.shockBrand));
  const availableShockPositions = uniqueSortedStrings(
    categoryProducts.filter((item) => item.shockBrand === brand).map((item) => item.shockPosition),
  );
  const availableShockStocks = uniqueSortedStrings(
    categoryProducts
      .filter((item) => item.shockBrand === brand && item.shockPosition === position)
      .map((item) => item.stockStatus),
  );
  const availableStocks = uniqueSortedStrings(categoryProducts.map((item) => item.stockStatus));
  const availablePricingModes = uniqueSortedStrings(
    categoryProducts.filter((item) => item.stockStatus === stock).map((item) => item.pricingMode ?? "fixed"),
  );
  const canUseSecondFilter = hasCategory;
  const canUseThirdFilter = isShockCategory ? brand.trim() !== "" : stock.trim() !== "";
  const canUseFourthFilter = isShockCategory ? position.trim() !== "" : false;

  return (
    <form
      action="/tienda"
      method="get"
      className="mb-8 w-full rounded-[1.75rem] border border-zinc-200 bg-white p-4 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.2)] sm:p-6"
    >
      <input type="hidden" name="q" value={q} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Categoría</span>
            <select
              name="category"
              value={category}
              onChange={(e) => {
                const nextCategory = e.target.value;
                setCategory(nextCategory);
                setStock("");
                setPricing("");
                setBrand("");
                setPosition("");
              }}
              className={fieldClassName()}
            >
              <option value="">Todas las categorías</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

        {isShockCategory ? (
          <label className="grid gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Marca</span>
            <select
              name="brand"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPosition("");
                setStock("");
              }}
              className={fieldClassName(!canUseSecondFilter)}
              disabled={!canUseSecondFilter}
            >
              <option value="">Cualquier marca</option>
              {availableShockBrands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="grid gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Estado</span>
            <select
              name="stock"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                setPricing("");
              }}
              className={fieldClassName(!canUseSecondFilter)}
              disabled={!canUseSecondFilter}
            >
              <option value="">Cualquier estado</option>
              {availableStocks.includes("in_stock") ? <option value="in_stock">En stock</option> : null}
              {availableStocks.includes("on_request") ? <option value="on_request">Bajo pedido</option> : null}
            </select>
          </label>
        )}

        {isShockCategory ? (
          <label className="grid gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Posición</span>
            <select
              name="position"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                setStock("");
              }}
              className={fieldClassName(!canUseThirdFilter)}
              disabled={!canUseThirdFilter}
            >
              <option value="">Cualquier posición</option>
              {availableShockPositions.includes("delantero") ? <option value="delantero">Delantero</option> : null}
              {availableShockPositions.includes("trasero") ? <option value="trasero">Trasero</option> : null}
            </select>
          </label>
        ) : (
          <label className="grid gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Precio</span>
            <select
              name="pricing"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              className={fieldClassName(!canUseThirdFilter)}
              disabled={!canUseThirdFilter}
            >
              <option value="">Cualquier precio</option>
              {availablePricingModes.includes("fixed") ? <option value="fixed">Precio definido</option> : null}
              {availablePricingModes.includes("check_availability") ? (
                <option value="check_availability">Consultar disponibilidad</option>
              ) : null}
            </select>
          </label>
        )}

        {isShockCategory ? (
          <label className="grid gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Estado</span>
            <select
              name="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={fieldClassName(!canUseFourthFilter)}
              disabled={!canUseFourthFilter}
            >
              <option value="">Cualquier estado</option>
              {availableShockStocks.includes("in_stock") ? <option value="in_stock">En stock</option> : null}
              {availableShockStocks.includes("on_request") ? <option value="on_request">Bajo pedido</option> : null}
            </select>
          </label>
        ) : null}

        <div className="grid gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-transparent select-none">
            Acción
          </span>
          <div className={["grid gap-3", hasActiveFilters ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
            <button
              type="submit"
              className="inline-flex min-h-[50px] items-center justify-center rounded-[1rem] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#981b1f]"
            >
              Buscar
            </button>
            {hasActiveFilters ? (
              <Link
                href="/tienda"
                className="inline-flex min-h-[50px] items-center justify-center rounded-[1rem] border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Limpiar
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
