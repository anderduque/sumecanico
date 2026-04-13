import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { MailIcon } from "@/components/icons/MailIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { site, whatsAppWaMeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
};

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M12 21s6-4.8 6-11a6 6 0 1 0-12 0c0 6.2 6 11 6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function ContactoPage() {
  const mapsQuery = encodeURIComponent(`${site.addressLine}, ${site.cityLine}`);
  const googleEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=m&z=16&output=embed`;

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/module-contact-hero-v2.png"
            alt="Atención y contacto del taller"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.86)_0%,rgba(10,10,10,0.68)_44%,rgba(10,10,10,0.58)_100%)]" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
              Contacto directo
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Escríbenos y coordinamos tu atención.
            </h1>
            <p className="mt-5 max-w-2xl text-justify text-base leading-8 text-zinc-200 sm:text-lg">
              Si necesitas cotizar un servicio, confirmar un repuesto o ubicar el taller, aquí
              tienes los canales directos para resolverlo sin vueltas.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-zinc-200 bg-[#f6f3ef]">
        <Container className="py-14 sm:py-16">
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/70 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-6 sm:p-7">
                <MapPinIcon className="h-6 w-6 text-primary" />
                <div className="mt-4 text-base font-bold uppercase tracking-[0.16em] text-zinc-950">
                  Dirección
                </div>
                <div className="mt-3 text-sm leading-7 text-zinc-700">
                  <div>{site.addressLine}</div>
                  <div>{site.cityLine}</div>
                </div>
              </div>

              <div className="border-t border-zinc-200/80 p-6 sm:p-7 md:border-l md:border-t-0">
                <ClockIcon className="h-6 w-6 text-primary" />
                <div className="mt-4 text-base font-bold uppercase tracking-[0.16em] text-zinc-950">
                  Horario
                </div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-700">
                  {site.openingHours.map((h) => (
                    <div key={h.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1">
                      <span className="min-w-0">{h.label}</span>
                      <span className="text-right font-medium text-zinc-950">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#f6f3ef]">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/home-engine-detail-optimized.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <Container className="relative py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Canales de atención
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Elige cómo quieres contactarnos
              </h2>
              <p className="mt-4 text-justify text-base leading-8 text-zinc-600">
                Puedes escribirnos por WhatsApp, abrir ubicación en Maps, enviarnos un correo o
                revisar nuestras redes.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-5 md:grid-cols-2">
              <a
                className="group flex items-center gap-4 overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white px-5 py-5 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-green-500/40 hover:shadow-[0_24px_60px_-40px_rgba(22,163,74,0.28)]"
                href={whatsAppWaMeUrl("Hola, necesito información.")}
                target="_blank"
                rel="noreferrer"
              >
                <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-green-600 text-white shadow-sm shadow-green-900/20 transition duration-300 group-hover:scale-[1.03]">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    WhatsApp
                  </span>
                  <span className="mt-2 block text-lg font-semibold tracking-tight text-zinc-950">
                    Escribir ahora
                  </span>
                </span>
              </a>

              <a
                className="group flex items-center gap-4 overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white px-5 py-5 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-zinc-900/25 hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,0.28)]"
                href={`mailto:${site.email}`}
              >
                <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white shadow-sm shadow-zinc-900/20 transition duration-300 group-hover:scale-[1.03]">
                  <MailIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Correo
                  </span>
                  <span className="mt-2 block text-lg font-semibold tracking-tight text-zinc-950">
                    Enviar email
                  </span>
                  <span className="mt-1 block truncate text-sm text-zinc-600">{site.email}</span>
                </span>
              </a>

              <a
                className="group flex items-center gap-4 overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white px-5 py-5 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-pink-500/35 hover:shadow-[0_24px_60px_-40px_rgba(219,39,119,0.26)]"
                href={site.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-pink-600 text-white shadow-sm shadow-pink-900/20 transition duration-300 group-hover:scale-[1.03]">
                  <InstagramIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Instagram
                  </span>
                  <span className="mt-2 block text-lg font-semibold tracking-tight text-zinc-950">
                    Ver perfil
                  </span>
                  <span className="mt-1 block truncate text-sm text-zinc-600">
                    {"@" + (site.instagramUrl.replace(/\/+$/, "").split("/").pop() || "instagram")}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-zinc-200 bg-[#f6f3ef]">
        <Container className="py-14 sm:py-16">
          <div className="max-w-4xl">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Ubicación
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Encuéntranos en Valencia
              </h2>
              <p className="mt-4 max-w-3xl text-justify text-base leading-8 text-zinc-600">
                Visítanos en el taller o abre la ruta directamente desde tu aplicación de mapas.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.22)]">
              <div className="grid gap-4 border-b border-zinc-200 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="text-center lg:text-center">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Taller Sumecánico
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                    {site.addressLine}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-zinc-600">{site.cityLine}</div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200">
                  <div className="relative aspect-[16/9] w-full bg-zinc-100">
                    <iframe
                      title="Mapa de ubicación"
                      src={googleEmbedUrl}
                      className="h-full w-full"
                      loading="eager"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-zinc-200 px-4 py-4 sm:px-5 sm:py-5">
                <a
                  className="inline-flex items-center justify-center gap-3 rounded-[1rem] border border-primary bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_-30px_rgba(181,31,36,0.45)] transition hover:bg-[#981b1f]"
                  href={site.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPinIcon className="h-4.5 w-4.5" />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
