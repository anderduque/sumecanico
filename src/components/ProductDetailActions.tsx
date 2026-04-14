"use client";

import dynamic from "next/dynamic";
import type { CartProductSnapshot } from "@/cart/cartTypes";
import { WhatsAppLink } from "@/components/WhatsAppLink";

const AddToCartButton = dynamic(
  () => import("@/components/AddToCartButton").then((mod) => mod.AddToCartButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-none bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white opacity-80"
        disabled
      >
        Cargando...
      </button>
    ),
  },
);

export function ProductDetailActions({
  product,
}: {
  product: CartProductSnapshot;
}) {
  return (
    <div className="mt-6 grid gap-3">
      <AddToCartButton
        productSlug={product.slug}
        product={product}
        className="w-full rounded-none py-3 uppercase tracking-[0.16em]"
      />
      <WhatsAppLink
        className="w-full rounded-none border-zinc-900 bg-zinc-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-zinc-800"
        message={`Hola, quiero cotizar el repuesto ${product.name}. Mi vehículo es:`}
      >
        Cotizar por WhatsApp
      </WhatsAppLink>
    </div>
  );
}
