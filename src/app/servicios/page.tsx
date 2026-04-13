import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { services } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Servicios",
};

export default function ServiciosPage() {
  return (
    <div className="bg-[#f6f3ef] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/module-services-hero.png"
            alt="Servicio automotriz profesional"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.72)_0%,rgba(18,18,18,0.78)_40%,rgba(18,18,18,0.92)_100%)]" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
              Mantenimiento y reparación
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Servicios automotrices pensados para resolver de verdad.
            </h1>
            <p className="mt-5 max-w-3xl text-justify text-base leading-8 text-zinc-300 sm:text-lg">
              En {services.length} áreas clave, combinamos diagnóstico, ejecución técnica y
              orientación clara para que sepas qué hacer con tu vehículo antes de gastar de más.
            </p>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#f6f3ef]">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/home-engine-detail.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <Container className="relative py-12 sm:py-16">
          <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2">
            {services.map((service, index) => (
              <article
                key={service.slug}
                className={[
                  "group flex h-full flex-col overflow-hidden border bg-[#1b1b1b]/95 transition duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_30px_70px_-40px_rgba(0,0,0,0.8)]",
                  index === 0 ? "border-primary/70" : "border-white/10",
                ].join(" ")}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.32)_58%,rgba(0,0,0,0.82)_100%)]" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {service.name}
                  </h2>
                  <p className="mt-4 flex-1 text-justify text-sm leading-8 text-zinc-300">{service.intro}</p>

                  <div className="mt-6">
                    <Link
                      href={`/servicios/${service.slug}`}
                      className="inline-flex w-full items-center justify-center border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 transition hover:border-primary hover:bg-primary hover:text-white"
                    >
                      Más información →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
