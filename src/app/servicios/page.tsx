import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { services } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Servicios",
};

export default function ServiciosPage() {
  return (
    <Container className="py-10 sm:py-14">
      <section
        id="lista-servicios"
        className="overflow-hidden rounded-3xl bg-zinc-950 shadow-sm"
      >
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold tracking-[0.25em] text-primary">
              NUESTROS SERVICIOS
            </div>
            <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Explora nuestros servicios
            </div>
            <p className="max-w-3xl text-sm text-zinc-300">
              Cada servicio incluye un resumen y sus puntos clave. Entra a “Más información”
              para ver el detalle completo.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.slug}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="text-lg font-semibold text-white">{s.name}</div>
                  <p className="mt-2 text-sm text-zinc-300">{s.summary}</p>

                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      href={`/servicios/${s.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-50"
                    >
                      Más información →
                    </Link>
                    <WhatsAppLink
                      className="w-full"
                      message={`Hola, quiero cotizar el servicio: ${s.name}. Mi vehículo es:`}
                    >
                      Cotizar por WhatsApp
                    </WhatsAppLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}
