import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { ServiceFaqAccordion } from "@/components/ServiceFaqAccordion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { getServiceBySlug, services } from "@/lib/catalog";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Servicio" };
  return { title: service.name, description: service.summary };
}

export default async function ServicioDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.86)_0%,rgba(10,10,10,0.68)_44%,rgba(10,10,10,0.58)_100%)]" />
        </div>

        <Container className="relative py-16 sm:py-20 lg:py-24">
          <Link
            href="/servicios"
            className="inline-flex items-center text-sm font-semibold text-white/80 transition hover:text-white"
          >
            ← Volver a servicios
          </Link>

          <div className="mt-8 max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
              Servicio especializado
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-2xl text-justify text-base leading-8 text-zinc-200 sm:text-lg">
              {service.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppLink
                className="rounded-none bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
                message={`Hola, quiero más información y cotizar el servicio: ${service.name}. Mi vehículo es:`}
              >
                Solicitar cotización
              </WhatsAppLink>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Hablar con asesor
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Por qué importa
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Información completa del servicio
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="text-justify text-base leading-8 text-zinc-700 sm:text-lg">{service.whyItMatters}</p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="border border-zinc-200 bg-zinc-50 p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Qué incluye
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-700">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-zinc-200 bg-zinc-50 p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Beneficios
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-700">
                    {service.benefits.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f6f3ef]">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Proceso de trabajo
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Cómo abordamos este servicio
              </h2>
            </div>

            <div className="lg:col-span-7 grid gap-4">
              {service.process.map((step, index) => (
                <div key={step} className="flex gap-4 border border-zinc-200 bg-white p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-justify text-sm leading-7 text-zinc-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Preguntas frecuentes
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Respuestas claras antes de agendar
              </h2>
              <p className="mt-4 text-justify text-base leading-8 text-zinc-600">
                Si necesitas más contexto sobre el servicio, estos puntos suelen resolver las
                dudas más comunes antes de cotizar.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ServiceFaqAccordion faqs={service.faqs} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
