"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18 9 12l6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbRailRef = useRef<HTMLDivElement | null>(null);
  const selectedImage = images[selectedIndex] ?? images[0] ?? "";

  if (!selectedImage) return null;

  function scrollThumbs(direction: -1 | 1) {
    const node = thumbRailRef.current;
    if (!node) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const amount = isDesktop ? 220 : 180;
    if (isDesktop) {
      node.scrollBy({ top: direction * amount, behavior: "smooth" });
      return;
    }
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div className="overflow-hidden border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-4">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">Galería</div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)] lg:items-stretch">
          {images.length > 1 ? (
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 lg:h-full lg:flex-col">
                <button
                  type="button"
                  aria-label="Ver miniaturas anteriores"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => scrollThumbs(-1)}
                >
                  <ChevronLeftIcon className="h-5 w-5 lg:hidden" />
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" className="hidden h-5 w-5 lg:block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 15 12 9l-6 6" />
                  </svg>
                </button>

                <div
                  ref={thumbRailRef}
                  className="flex min-w-0 flex-1 snap-x gap-3 overflow-x-auto rounded-[1.5rem] border border-zinc-200 bg-[#f7f4ef] p-3 lg:h-[38rem] lg:snap-y lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden"
                >
                  {images.map((imageUrl, index) => {
                    const isActive = index === selectedIndex;
                    return (
                      <button
                        key={`${imageUrl.slice(0, 40)}-${index}`}
                        type="button"
                        aria-label={`Ver foto ${index + 1}`}
                        aria-pressed={isActive}
                        onClick={() => setSelectedIndex(index)}
                        className={[
                          "relative h-24 w-24 shrink-0 snap-start overflow-hidden rounded-[1rem] border bg-white transition lg:w-full",
                          isActive
                            ? "border-zinc-950 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.55)]"
                            : "border-zinc-200 opacity-75 hover:border-primary hover:opacity-100",
                        ].join(" ")}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${name} miniatura ${index + 1}`}
                          fill
                          unoptimized={imageUrl.startsWith("data:")}
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  aria-label="Ver miniaturas siguientes"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary"
                  onClick={() => scrollThumbs(1)}
                >
                  <ChevronRightIcon className="h-5 w-5 lg:hidden" />
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" className="hidden h-5 w-5 lg:block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/4.2] overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white sm:aspect-[4/3.8] lg:h-[38rem] lg:aspect-auto">
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${name} imagen ${selectedIndex + 1}`}
                fill
                priority={selectedIndex === 0}
                unoptimized={selectedImage.startsWith("data:")}
                className="object-contain p-4 sm:p-6"
                sizes="(min-width: 1024px) 42rem, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
