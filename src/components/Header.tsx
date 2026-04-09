"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/cart/CartProvider";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-white" : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const { totalItems } = useCart();
  const cartLabel = useMemo(() => {
    if (totalItems <= 0) return "Carrito";
    return `Carrito (${totalItems})`;
  }, [totalItems]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-28 shrink-0">
            <Image
              src={site.logoPath}
              alt={`${site.name} logo`}
              fill
              className="object-contain"
              sizes="112px"
              priority
            />
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold text-zinc-950">{site.name}</div>
            <div className="text-xs text-zinc-600">{site.tagline}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/" label="Inicio" />
          <NavLink href="/servicios" label="Servicios" />
          <NavLink href="/tienda" label="Tienda" />
          <NavLink href="/contacto" label="Contacto" />
          <NavLink href="/carrito" label={cartLabel} />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/carrito"
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800"
          >
            {totalItems > 0 ? totalItems : "Carrito"}
          </Link>
        </div>
      </Container>
    </header>
  );
}
