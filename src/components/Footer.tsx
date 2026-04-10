"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { whatsAppWaMeUrl } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="border-t border-primary/30 bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-200">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-36 shrink-0">
                <Image
                  src={site.logoPath}
                  alt={`${site.name} logo`}
                  fill
                  className="object-contain"
                  sizes="144px"
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">{site.name}</div>
                <div className="text-sm text-zinc-300">{site.tagline}</div>
              </div>
            </div>

            <div className="mt-5 text-sm text-zinc-300">
              <div>{site.addressLine}</div>
              <div>{site.cityLine}</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                href={whatsAppWaMeUrl("Hola, necesito información.")}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon className="h-4 w-4 text-green-400" />
                <span>WhatsApp</span>
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                href={site.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="text-sm font-semibold text-white">Páginas</div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link className="text-zinc-300 hover:text-white" href="/servicios">
                Servicios
              </Link>
              <Link className="text-zinc-300 hover:text-white" href="/tienda">
                Tienda
              </Link>
              <Link className="text-zinc-300 hover:text-white" href="/contacto">
                Contacto
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-200/80">
              Horario
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {site.openingHours.map((h) => (
                <div
                  key={h.label}
                  className="grid grid-cols-[1fr_auto] items-center gap-6 rounded-lg px-2 py-1 hover:bg-white/5"
                >
                  <span className="text-zinc-200/80">{h.label}</span>
                  <span className="font-semibold tabular-nums text-white">{h.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</span>
            <span className="text-zinc-500">Cotizaciones sujetas a disponibilidad.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
