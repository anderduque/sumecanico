"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/cart/CartProvider";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";

function CartSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="19" r="1.8" />
      <circle cx="17" cy="19" r="1.8" />
      <path d="M3 4h2l2.5 11.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5L21 8H7" />
    </svg>
  );
}

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
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const cartActive = pathname === "/carrito";

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
          <Link
            href="/carrito"
            aria-label="Carrito"
            className={[
              "relative inline-flex h-9 w-11 items-center justify-center rounded-full border text-zinc-900 transition-colors",
              cartActive
                ? "border-primary bg-primary/10"
                : "border-zinc-200 bg-white hover:bg-zinc-50",
            ].join(" ")}
          >
            <CartSvg className="h-5 w-5 text-primary" />
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/carrito" aria-label="Carrito" className="relative inline-flex h-9 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900">
            <CartSvg className="h-5 w-5 text-primary" />
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
        </div>
      </Container>
    </header>
  );
}
