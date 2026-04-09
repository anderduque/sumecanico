import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { whatsAppWaMeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">Contacto</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">
            Escríbenos para cotizar servicios o repuestos. Responderemos lo antes posible.
          </p>
        </div>
        <WhatsAppLink message="Hola, quiero información. Mi consulta es:" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="text-sm font-semibold text-zinc-950">Ubicación</div>
          <div className="mt-3 text-sm text-zinc-700">
            <div>{site.addressLine}</div>
            <div>{site.cityLine}</div>
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-700">
            Agrega aquí el enlace a Google Maps cuando tengas la ubicación exacta.
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-950">Horario</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            {site.openingHours.map((h) => (
              <div key={h.label} className="flex items-center justify-between gap-6">
                <span>{h.label}</span>
                <span className="font-medium text-zinc-900">{h.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm font-semibold text-zinc-950">WhatsApp</div>
          <div className="mt-2 flex items-center gap-2">
            <WhatsAppIcon className="h-4 w-4 text-green-600" />
            <a
              className="text-sm text-zinc-700 hover:underline"
              href={whatsAppWaMeUrl("Hola, necesito información.")}
              target="_blank"
              rel="noreferrer"
            >
              {site.whatsappPhoneE164}
            </a>
          </div>

          <div className="mt-6 text-sm font-semibold text-zinc-950">Redes</div>
          <div className="mt-2">
            <a
              className="text-sm font-semibold text-zinc-900 hover:underline"
              href={site.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>

          <div className="mt-6 text-sm font-semibold text-zinc-950">Email</div>
          <div className="mt-2">
            <a className="text-sm text-zinc-700 hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}
