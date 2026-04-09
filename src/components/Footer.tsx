import Link from "next/link";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { whatsAppWaMeUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <div className="text-sm font-semibold text-zinc-950">{site.name}</div>
          <div className="mt-1 text-sm text-zinc-600">{site.tagline}</div>
          <div className="mt-4 text-sm text-zinc-600">
            <div>{site.addressLine}</div>
            <div>{site.cityLine}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link className="text-zinc-700 hover:text-zinc-950" href="/servicios">
            Servicios
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-950" href="/tienda">
            Tienda
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-950" href="/contacto">
            Contacto
          </Link>
          <a
            className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-950"
            href={whatsAppWaMeUrl("Hola, necesito información.")}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>WhatsApp {site.whatsappPhoneE164}</span>
          </a>
          <a
            className="text-zinc-700 hover:text-zinc-950"
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </div>

        <div className="text-sm text-zinc-600">
          <div className="font-medium text-zinc-800">Horario</div>
          <div className="mt-2 space-y-1">
            {site.openingHours.map((h) => (
              <div key={h.label} className="flex items-center justify-between gap-6">
                <span>{h.label}</span>
                <span className="text-zinc-700">{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
