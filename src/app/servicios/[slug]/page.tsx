import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { getServiceBySlug, services } from "@/lib/catalog";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);
  if (!service) return { title: "Servicio" };
  return { title: service.name, description: service.summary };
}

export default function ServicioDetallePage({
  params,
}: {
  params: { slug: string };
}) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/servicios" className="text-sm font-semibold text-primary hover:underline">
        ← Volver a servicios
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-12">
          <div className="relative min-h-[280px] overflow-hidden lg:col-span-7 lg:min-h-[520px]">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex rounded-full bg-black/55 px-4 py-2 text-xs font-semibold tracking-[0.25em] text-white">
                SERVICIO
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-5">
            <div className="text-xs font-semibold tracking-[0.25em] text-primary">
              MÁS INFORMACIÓN
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              {service.name}
            </h1>
            <p className="mt-3 text-sm text-zinc-700">{service.summary}</p>

            <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-sm font-semibold text-zinc-950">
                ¿Qué incluye?
              </div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {service.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <WhatsAppLink
                className="w-full"
                message={`Hola, quiero más información y cotizar el servicio: ${service.name}. Mi vehículo es:`}
              >
                Cotizar por WhatsApp
              </WhatsAppLink>
              <Link
                href="/servicios"
                className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Ver otros servicios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
