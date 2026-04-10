import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { whatsAppWaMeUrl } from "@/lib/site";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { MailIcon } from "@/components/icons/MailIcon";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-primary to-zinc-950 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
            Contacto
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">
            Escríbenos para cotizar servicios o repuestos. Responderemos lo antes posible.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="text-sm font-semibold text-zinc-950">Ubicación</div>
          <div className="mt-3 text-sm text-zinc-700">
            <div>{site.addressLine}</div>
            <div>{site.cityLine}</div>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
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
          <a
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            href={site.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir en Google Maps
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-950">Horario</div>
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-900">Atención al público</div>
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <div className="mt-2 text-xs text-zinc-700">
              Llegar a tiempo garantiza una atención más rápida.
            </div>
          </div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            {site.openingHours.map((h) => (
              <div key={h.label} className="flex items-center justify-between gap-6">
                <span>{h.label}</span>
                <span className="font-medium text-zinc-900">{h.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm font-semibold text-zinc-950">WhatsApp</div>
          <a
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            href={whatsAppWaMeUrl("Hola, necesito información.")}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>

          <div className="mt-6 text-sm font-semibold text-zinc-950">Redes</div>
          <div className="mt-2">
            <a
              className="inline-flex items-center gap-3 rounded-full border border-pink-600/30 bg-pink-600/10 px-4 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-600/15"
              href={site.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-pink-600 text-white">
                <InstagramIcon className="h-3.5 w-3.5" />
              </span>
              {"@" + (site.instagramUrl.replace(/\/+$/, "").split("/").pop() || "instagram")}
            </a>
          </div>

          <div className="mt-6 text-sm font-semibold text-zinc-950">Email</div>
          <div className="mt-2">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
              href={`mailto:${site.email}`}
            >
              <MailIcon className="h-4 w-4 text-zinc-700" />
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}
