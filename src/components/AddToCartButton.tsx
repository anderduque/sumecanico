"use client";

import { useMemo } from "react";
import type { CartProductSnapshot } from "@/cart/cartTypes";
import { useCart } from "@/cart/CartProvider";

export function AddToCartButton({
  productSlug,
  product,
  className,
}: {
  productSlug: string;
  product?: CartProductSnapshot;
  className?: string;
}) {
  const { add } = useCart();
  const label = useMemo(() => "Agregar al carrito", []);

  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90",
        className ?? "",
      ].join(" ")}
      onClick={() => add(productSlug, 1, product)}
    >
      {label}
    </button>
  );
}
