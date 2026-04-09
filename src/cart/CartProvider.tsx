"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/cart/cartTypes";

type CartContextValue = {
  lines: CartLine[];
  totalItems: number;
  add: (productSlug: string, quantity?: number) => void;
  remove: (productSlug: string) => void;
  setQuantity: (productSlug: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const storageKey = "sumecanico_cart_v1";

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(value)));
}

function mergeAdd(lines: CartLine[], productSlug: string, quantity: number) {
  const idx = lines.findIndex((l) => l.productSlug === productSlug);
  if (idx === -1) return [...lines, { productSlug, quantity }];
  const next = [...lines];
  next[idx] = {
    productSlug,
    quantity: clampQuantity(next[idx].quantity + quantity),
  };
  return next;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      const normalized: CartLine[] = parsed
        .map((x) => x as CartLine)
        .filter(
          (x) =>
            typeof x?.productSlug === "string" &&
            typeof x?.quantity === "number" &&
            x.quantity > 0,
        )
        .map((x) => ({ productSlug: x.productSlug, quantity: clampQuantity(x.quantity) }));
      return normalized;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback((productSlug: string, quantity = 1) => {
    const q = clampQuantity(quantity);
    setLines((prev) => mergeAdd(prev, productSlug, q));
  }, []);

  const remove = useCallback((productSlug: string) => {
    setLines((prev) => prev.filter((l) => l.productSlug !== productSlug));
  }, []);

  const setQuantity = useCallback((productSlug: string, quantity: number) => {
    const q = clampQuantity(quantity);
    setLines((prev) =>
      prev.map((l) => (l.productSlug === productSlug ? { ...l, quantity: q } : l)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({ lines, totalItems, add, remove, setQuantity, clear }),
    [add, clear, lines, remove, setQuantity, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
