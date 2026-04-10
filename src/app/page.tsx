import Link from "next/link";
import { Container } from "@/components/Container";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { services } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getProducts } from "@/lib/productsStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const featuredServices = services.slice(0, 3);
  const featuredProducts = (await getProducts()).slice(0, 3);

  return (
    <div className="bg-white">
      <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
        <Container className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="bg-gradient-to-r from-primary to-zinc-950 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
                Taller mecánico y repuestos en un solo lugar
              </h1>
              <div className="mt-3 text-base font-semibold text-zinc-900 sm:text-lg">
                Cotiza al instante por WhatsApp <span aria-hidden="true">⚡</span>
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
                Agenda mantenimientos, diagnósticos y reparaciones sin perder tiempo.
                Consulta disponibilidad y precios en minutos, directo desde tu celular.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <WhatsAppLink message="Hola, quiero cotizar un servicio para mi vehículo." />
                <Link
                  href="/tienda"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  Ver repuestos
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-600">
                <span className="rounded-full bg-zinc-100 px-3 py-1">Diagnóstico</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Mantenimiento
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Frenos y suspensión
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Electricidad
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-950">
                  ¿Qué necesitas hoy?
                </div>
                <p className="mt-2 text-sm text-zinc-700">
                  Escríbenos con marca, modelo, año y un resumen del problema. Si es
                  repuesto, agrega número de pieza o foto.
                </p>
                <div className="mt-5 grid gap-3">
                  <Link
                    href="/servicios"
                    className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:brightness-90"
                  >
                    Ver servicios
                  </Link>
                  <Link
                    href="/contacto"
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Contacto y ubicación
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Servicios</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Selección de servicios más solicitados.
              </p>
            </div>
            <Link
              href="/servicios"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s) => (
              <div
                key={s.slug}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                <div className="text-base font-semibold text-zinc-950">{s.name}</div>
                <p className="mt-2 text-sm text-zinc-700">{s.summary}</p>
                <Link
                  href="/servicios"
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Ver detalles
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50">
        <Container className="py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Repuestos</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Catálogo inicial (precios referenciales).
              </p>
            </div>
            <Link
              href="/tienda"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ir a la tienda
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((p) => (
              <div
                key={p.slug}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                {p.imageUrl ? (
                  <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-zinc-950">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">{p.category}</div>
                  </div>
                  <div className="text-sm font-semibold text-zinc-900">
                    {formatMoney(p.priceCents, { currency: p.currency })}
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-700">{p.summary}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/tienda/${p.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Ver producto
                  </Link>
                  <AddToCartButton productSlug={p.slug} />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
