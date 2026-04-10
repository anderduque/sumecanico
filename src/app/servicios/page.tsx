import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { services } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Servicios",
};

export default function ServiciosPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-primary to-zinc-950 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
            Servicios
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700">
            Cuéntanos marca, modelo, año y el síntoma. Te respondemos con un
            diagnóstico inicial y una cotización estimada.
          </p>
        </div>
        <WhatsAppLink message="Hola, quiero cotizar un servicio. Mi vehículo es:" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {services.map((s) => (
          <div
            key={s.slug}
            className="rounded-2xl border border-zinc-200 bg-white p-6"
          >
            <div className="text-lg font-semibold text-zinc-950">{s.name}</div>
            <p className="mt-2 text-sm text-zinc-700">{s.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              {s.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <WhatsAppLink
                className="w-full"
                message={`Hola, quiero cotizar el servicio: ${s.name}. Mi vehículo es:`}
              >
                Cotizar {s.name}
              </WhatsAppLink>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
