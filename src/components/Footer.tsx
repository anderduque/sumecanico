"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="border-t border-white/10 bg-black text-zinc-200">
      <Container className="py-14">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-14 w-56">
            <Image
              src={site.logoPath}
              alt={`${site.name} logo`}
              fill
              className="object-contain"
              sizes="224px"
            />
          </div>

          <div className="mt-7 text-2xl font-extrabold tracking-wide text-white sm:text-3xl">
            {site.name.toUpperCase()}
          </div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
            © {new Date().getFullYear()} Todos los derechos reservados
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              className="inline-flex items-center gap-3 rounded-full border border-pink-600/30 bg-pink-600/10 px-5 py-3 text-sm font-semibold text-pink-100 shadow-sm shadow-black/30 hover:bg-pink-600/15"
              href={site.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-pink-600 text-white">
                <InstagramIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-pink-100/90">
                {"@" + (site.instagramUrl.replace(/\/+$/, "").split("/").pop() || "instagram")}
              </span>
            </a>

            <a
              className="inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/15"
              href="mailto:anderduquem19@gmail.com"
            >
              Soporte técnico
              <span className="text-emerald-100/80">Contactar</span>
            </a>
          </div>

          <div className="mt-10 w-full border-t border-white/10 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-xs text-zinc-500 sm:flex-row">
              <div className="flex items-center gap-4">
                <Link className="hover:text-white" href="/servicios">
                  Servicios
                </Link>
                <Link className="hover:text-white" href="/tienda">
                  Tienda
                </Link>
                <Link className="hover:text-white" href="/contacto">
                  Contacto
                </Link>
              </div>

              <a
                className="text-zinc-500 hover:text-white"
                href="https://www.instagram.com/anderduque7/"
                target="_blank"
                rel="noreferrer"
              >
                Plataforma Desarrollada por @anderduque7
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
