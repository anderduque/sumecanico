import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { MailIcon } from "@/components/icons/MailIcon";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { site, whatsAppWaMeUrl } from "@/lib/site";

const serviceItems = [
  { label: "Motores", icon: EngineIcon },
  { label: "Diagnóstico", icon: ScanIcon },
  { label: "Mantenimiento", icon: WrenchIcon },
  { label: "Frenos", icon: BrakeIcon },
  { label: "Electricidad", icon: BoltIcon },
  { label: "Repuestos", icon: PartsIcon },
] as const;

const aboutStats = [
  { value: "+20", label: "Años de experiencia" },
  { value: "1,000+", label: "Servicios realizados" },
  { value: "100%", label: "Atención directa" },
] as const;

function EngineIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M4 10h3l2-3h4l2 2h3l2 3v5h-2a2 2 0 0 1-4 0H10a2 2 0 0 1-4 0H4z" />
      <path d="M7 10V7M15 9V6M19 12h1" />
    </svg>
  );
}

function ScanIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M8 4H6a2 2 0 0 0-2 2v2M16 4h2a2 2 0 0 1 2 2v2M8 20H6a2 2 0 0 1-2-2v-2M16 20h2a2 2 0 0 0 2-2v-2" />
      <path d="M7 12h10M9 9h6M10 15h4" />
    </svg>
  );
}

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M14 6a4 4 0 0 0 4.7 4.7l-8 8a2 2 0 1 1-2.8-2.8l8-8A4 4 0 0 0 14 6z" />
      <path d="M13 7l4 4" />
    </svg>
  );
}

function BrakeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 5v2M19 12h-2M12 19v-2M5 12h2" />
    </svg>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M13 2L6 13h5l-1 9 8-12h-5l0-8z" />
    </svg>
  );
}

function PartsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M9 4l1.5 2.5L13 6l1 2.7L17 10l-2 2 1 3-3-.7L11 17l-1.5-2.4L7 15l1-3-2-2 3-1.3L9 4z" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

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

export default function Home() {
  return (
    <div className="bg-white">
      <section className="border-b border-zinc-800 bg-black text-white">
        <Container className="py-3">
          <div className="flex flex-col gap-3 text-xs text-zinc-300 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-sm">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
              <span>{site.addressLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-primary" />
              <span>{site.whatsappPhoneE164}</span>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 shrink-0 text-primary" />
              <span>{site.email}</span>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative isolate overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <Image
            src="/home-hero-mechanic-optimized.jpg"
            alt="Mecánico trabajando en un vehículo"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.58)_42%,rgba(0,0,0,0.44)_100%)]" />
        </div>

        <Container className="relative py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.36em] text-yellow-300">
              Servicio automotriz de calidad
            </div>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Taller mecánico
            </h1>
            <p className="mt-6 max-w-2xl text-justify text-base leading-7 text-zinc-200 sm:text-lg">
              Mantenimientos, reparaciones y repuestos con una ejecución ordenada y una atención
              más clara. Especialistas en motores para clientes que buscan confianza y resultados.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppLink
                message="Hola, quiero agendar una cita para revisar mi vehículo."
                className="rounded-[1rem] bg-white px-7 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Agenda tu cita
              </WhatsAppLink>
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center rounded-[1rem] border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Ver servicios
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-zinc-800 bg-black text-white">
        <Container className="py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            {serviceItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-zinc-200">{item.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Tu confianza, nuestra inspiración
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
                Sobre nosotros
              </h2>
            </div>

            <div className="lg:col-span-7">
              <div className="mb-8">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-zinc-100">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src="/home-engine-service-optimized.jpg"
                      alt="Trabajo mecánico sobre el motor de un vehículo"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 720px, 100vw"
                    />
                  </div>
                </div>
              </div>

              <p className="text-justify text-base leading-8 text-zinc-700 sm:text-lg">
                En {site.name}, reunimos la experiencia de un taller especializado con la
                practicidad de resolver diagnóstico, reparación y repuestos en un solo lugar.
                Nuestro trabajo parte de una idea simple: explicar bien, reparar con criterio y
                entregar el vehículo en condiciones.
              </p>
              <p className="mt-5 text-justify text-base leading-8 text-zinc-700 sm:text-lg">
                Llevamos más de 20 años atendiendo en Valencia, con foco en motores, mantenimiento
                y soluciones mecánicas que realmente responden a lo que el vehículo necesita. Sin
                vueltas, sin sobrecargar el proceso, con atención directa.
              </p>

              <div className="mt-8 grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-3">
                {aboutStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-zinc-200 bg-[#f8f5f1] px-5 py-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.35)]"
                  >
                    <div className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm text-zinc-600">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-[1rem] border border-primary bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#981b1f]"
                >
                  Más información
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-zinc-200 bg-primary">
        <Container className="py-8 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
                Servicio confiable
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Agenda diagnóstico, mantenimiento o reparación.
              </div>
            </div>
            <a
              href={whatsAppWaMeUrl("Hola, quiero cotizar un servicio/repuesto para mi vehículo.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-[1rem] border border-white bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
            >
              <WhatsAppIcon className="h-5 w-5 text-primary" />
              <span>Cotizar ahora</span>
            </a>
          </div>
        </Container>
      </section>

      <section className="bg-[#111111]">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Cuidado y seguridad
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Trabajo técnico bien hecho, desde el diagnóstico hasta la entrega.
              </h2>
              <p className="mt-5 max-w-2xl text-justify text-base leading-8 text-zinc-300">
                Revisamos compatibilidad, alcance del trabajo y repuestos antes de cerrar el
                servicio. Ese orden reduce retrabajos y te da una decisión más clara desde el
                inicio.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden border border-white/10 bg-white/5">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/home-engine-detail-optimized.jpg"
                    alt="Servicio mecánico profesional en taller"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 420px, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.75)_100%)]" />
                </div>
                <div className="space-y-4 p-8">
                  <div className="border-b border-white/10 pb-4 text-sm font-medium text-white/90">
                    Diagnóstico preciso
                  </div>
                  <div className="border-b border-white/10 pb-4 text-sm font-medium text-white/90">
                    Repuestos adecuados
                  </div>
                  <div className="text-sm font-medium text-white/90">Atención directa</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
