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

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M21 16.2v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 1 3.3 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.8L6 9a16 16 0 0 0 9 9l1.7-1.8a2 2 0 0 1 1.8-.6l2.8.4A2 2 0 0 1 21 16.2z" />
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
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
              Si necesitas cotizar un servicio, confirmar un repuesto o ubicar el taller, aquí
              tienes los canales directos para resolverlo sin vueltas.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-zinc-200 bg-zinc-50 p-6">
              <MapPinIcon className="h-6 w-6 text-primary" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                Dirección
              </div>
              <div className="mt-3 text-sm leading-7 text-zinc-700">
                <div>{site.addressLine}</div>
                <div>{site.cityLine}</div>
              </div>
            </div>

            <div className="border border-zinc-200 bg-zinc-50 p-6">
              <PhoneIcon className="h-6 w-6 text-primary" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                WhatsApp
              </div>
              <div className="mt-3 text-sm leading-7 text-zinc-700">{site.whatsappPhoneE164}</div>
            </div>

            <div className="border border-zinc-200 bg-zinc-50 p-6">
              <MailIcon className="h-6 w-6 text-primary" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                Email
              </div>
              <div className="mt-3 break-all text-sm leading-7 text-zinc-700">{site.email}</div>
            </div>

            <div className="border border-zinc-200 bg-zinc-50 p-6">
              <ClockIcon className="h-6 w-6 text-primary" />
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
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
        </Container>
      </section>

      <section className="bg-[#f6f3ef]">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Canales de atención
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Elige cómo quieres contactarnos
              </h2>
              <p className="mt-4 text-base leading-8 text-zinc-600">
                Puedes escribirnos por WhatsApp, abrir ubicación en Maps, enviarnos un correo o
                revisar nuestras redes.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-4 md:grid-cols-2">
              <a
                className="flex items-center gap-4 border border-zinc-200 bg-white p-5 transition hover:border-primary"
                href={whatsAppWaMeUrl("Hola, necesito información.")}
                target="_blank"
                rel="noreferrer"
              >
                <span className="grid h-12 w-12 place-items-center bg-green-600 text-white">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950">
                    WhatsApp
                  </span>
                  <span className="mt-1 block text-sm text-zinc-600">Escribir ahora</span>
                </span>
              </a>

              <a
                className="flex items-center gap-4 border border-zinc-200 bg-white p-5 transition hover:border-primary"
                href={site.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="grid h-12 w-12 place-items-center bg-primary text-white">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950">
                    Google Maps
                  </span>
                  <span className="mt-1 block text-sm text-zinc-600">Abrir ubicación</span>
                </span>
              </a>

              <a
                className="flex items-center gap-4 border border-zinc-200 bg-white p-5 transition hover:border-primary"
                href={`mailto:${site.email}`}
              >
                <span className="grid h-12 w-12 place-items-center bg-zinc-950 text-white">
                  <MailIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950">
                    Correo
                  </span>
                  <span className="mt-1 block text-sm text-zinc-600">Enviar email</span>
                </span>
              </a>

              <a
                className="flex items-center gap-4 border border-zinc-200 bg-white p-5 transition hover:border-primary"
                href={site.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="grid h-12 w-12 place-items-center bg-pink-600 text-white">
                  <InstagramIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950">
                    Instagram
                  </span>
                  <span className="mt-1 block text-sm text-zinc-600">
                    {"@" + (site.instagramUrl.replace(/\/+$/, "").split("/").pop() || "instagram")}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Ubicación
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                Encuéntranos en Valencia
              </h2>
            </div>

            <div className="lg:col-span-7 overflow-hidden border border-zinc-200">
              <div className="relative aspect-[16/9] w-full">
                <iframe
                  title="Mapa de ubicación"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${site.addressLine}, ${site.cityLine}`)}&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
