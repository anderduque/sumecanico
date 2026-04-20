"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" className="stroke-current/25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: (href: string, event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={(event) => onNavigate?.(href, event)}
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
  const hideHeader = pathname.startsWith("/admin");
  const cartActive = pathname === "/carrito";
  const [showPendingBanner, setShowPendingBanner] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const watchTimerRef = useRef<number | null>(null);
  const watchDeadlineRef = useRef<number | null>(null);
  const pathnameRef = useRef("");
  const pendingHrefRef = useRef<string | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  function clearNavigationState() {
    pendingHrefRef.current = null;
    setShowPendingBanner(false);
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (watchTimerRef.current !== null) {
      window.clearInterval(watchTimerRef.current);
      watchTimerRef.current = null;
    }
    if (watchDeadlineRef.current !== null) {
      window.clearTimeout(watchDeadlineRef.current);
      watchDeadlineRef.current = null;
    }
  }

  function isAtTarget(targetHref: string) {
    const current = pathnameRef.current;
    return current === targetHref || (targetHref !== "/" && current.startsWith(targetHref));
  }

  function handleNavigate(nextHref: string, event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    if (nextHref === pathname) return;
    if (!nextHref.startsWith("/tienda")) return;

    pendingHrefRef.current = nextHref;
    clearNavigationState();
    pendingHrefRef.current = nextHref;

    showTimerRef.current = window.setTimeout(() => {
      const target = pendingHrefRef.current;
      if (!target) return;
      if (isAtTarget(target)) {
        clearNavigationState();
        return;
      }
      setShowPendingBanner(true);
    }, 220);

    watchTimerRef.current = window.setInterval(() => {
      const target = pendingHrefRef.current;
      if (!target) {
        clearNavigationState();
        return;
      }
      if (isAtTarget(target)) {
        clearNavigationState();
      }
    }, 180);

    watchDeadlineRef.current = window.setTimeout(() => {
      clearNavigationState();
    }, 12_000);
  }

  if (hideHeader) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <Container className="py-2 md:py-0">
        <div className="hidden items-center justify-between gap-6 md:flex md:min-h-[5.5rem]">
          <Link href="/" className="flex min-w-0 flex-1 items-center justify-start gap-3">
            <div className="shrink-0 px-3 py-2">
              <Image
                src="/logo-white.png"
                alt={`${site.name} logo`}
                width={682}
                height={338}
                className="h-auto w-44 lg:w-48"
                sizes="(min-width: 1280px) 192px, 176px"
                priority
              />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-base font-extrabold tracking-[-0.03em] text-primary lg:text-lg">
                {site.name}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600 lg:text-sm">
                {site.tagline}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/" label="Inicio" />
            <NavLink href="/servicios" label="Servicios" />
            <NavLink href="/tienda" label="Tienda" onNavigate={handleNavigate} />
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

        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
          <NavLink href="/" label="Inicio" />
          <NavLink href="/servicios" label="Servicios" />
          <NavLink href="/tienda" label="Tienda" onNavigate={handleNavigate} />
          <NavLink href="/contacto" label="Contacto" />
          <Link
            href="/carrito"
            aria-label="Carrito"
            className="relative ml-auto inline-flex h-9 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900"
          >
            <CartSvg className="h-5 w-5 text-primary" />
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
        </nav>
      </Container>
      {showPendingBanner ? (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900 shadow-2xl">
            <SpinnerIcon className="h-5 w-5 animate-spin" />
            <div>Cargando tienda...</div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
