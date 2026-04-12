import { Container } from "@/components/Container";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="bg-[#121212] text-white">
      <section className="border-b border-white/10 bg-zinc-950">
        <Container className="py-16 sm:py-20">
          <Block className="h-3 w-36" />
          <Block className="mt-5 h-12 w-full max-w-3xl" />
          <Block className="mt-4 h-5 w-full max-w-2xl" />
          <Block className="mt-3 h-5 w-full max-w-xl" />
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden border border-white/10 bg-[#1a1a1a]/95 p-6"
            >
              <Block className="aspect-[16/10] w-full bg-white/8" />
              <Block className="mt-6 h-7 w-3/4 bg-white/12" />
              <Block className="mt-4 h-4 w-1/2 bg-white/8" />
              <Block className="mt-6 h-4 w-full bg-white/8" />
              <Block className="mt-2 h-4 w-5/6 bg-white/8" />
              <Block className="mt-6 h-11 w-full rounded-none bg-white/14" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
