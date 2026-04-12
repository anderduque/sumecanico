"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const commonRoutes = ["/", "/servicios", "/tienda", "/contacto", "/carrito"] as const;

export function RoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const href of commonRoutes) {
      router.prefetch(href);
    }
  }, [router]);

  return null;
}
