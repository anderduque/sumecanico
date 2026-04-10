import Image from "next/image";
import { Container } from "@/components/Container";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="bg-white">
      <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-40">
                  <Image
                    src={site.logoPath}
                    alt={`${site.name} logo`}
                    fill
                    className="object-contain"
                    sizes="160px"
                    priority
                  />
                </div>
                <div className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:block">
                  Valencia · Carabobo
                </div>
              </div>

              <h1 className="mt-6 bg-gradient-to-r from-primary to-zinc-950 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
                Especialistas en motores y repuestos, desde hace más de 20 años
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
                {site.name} nació hace más de 20 años con una meta clara: resolver problemas de
                motor con diagnóstico preciso y reparaciones confiables. Hoy también te apoyamos con
                mantenimiento, encendido, frenos y venta de repuestos para que salgas rápido y
                seguro.
              </p>

              <div className="mt-7">
                <WhatsAppLink message="Hola, quiero cotizar un servicio/repuesto para mi vehículo." />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-600">
                <span className="rounded-full bg-zinc-100 px-3 py-1">Motores</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">Diagnóstico</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">Mantenimiento</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">Encendido</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">Frenos</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">Repuestos</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                    <Image src="/window.svg" alt="" width={18} height={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-950">Atención clara y directa</div>
                    <div className="mt-1 text-sm text-zinc-700">
                      Comparte marca, modelo, año y el síntoma. Si es repuesto, agrega foto o número.
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <WhatsAppLink message="Hola, quiero cotizar un servicio/repuesto para mi vehículo." />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Experiencia
                      </div>
                      <div className="mt-1 break-words text-base font-semibold text-zinc-950 sm:text-lg">
                        +20 años
                      </div>
                    </div>
                    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Motores
                      </div>
                      <div className="mt-1 break-words text-base font-semibold text-zinc-950 sm:text-lg">
                        Especialistas
                      </div>
                    </div>
                    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Repuestos
                      </div>
                      <div className="mt-1 break-words text-base font-semibold text-zinc-950 sm:text-lg">
                        Catálogo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-zinc-200 bg-primary">
        <Container className="py-6 sm:py-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-white/90">
                ¿Listo para resolverlo hoy?
              </div>
              <div className="mt-1 text-sm text-white/80">
                Agenda servicio o compra repuestos en pocos pasos.
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <WhatsAppLink message="Hola, quiero cotizar un servicio/repuesto para mi vehículo." />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-950">
        <Container className="py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Confianza y seguridad
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Cuidando tu motor y tu seguridad en cada kilómetro
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Trabajamos con diagnóstico claro, repuestos adecuados y un proceso ordenado para
                evitar retrabajos. Te orientamos sobre compatibilidad y disponibilidad antes de
                finalizar.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white">
                  Diagnóstico preciso
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white">
                  Repuestos correctos
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white">
                  Atención directa
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <div className="relative h-56 w-full sm:h-72">
                  <Image
                    src={site.logoPath}
                    alt={`${site.name}`}
                    fill
                    className="object-contain p-10"
                    sizes="(min-width: 1024px) 420px, 100vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
