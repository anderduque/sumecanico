"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0] ?? "";
  const hasMultipleImages = images.length > 1;

  if (!selectedImage) return null;

  const isUnoptimizedImage = (value: string) =>
    value.startsWith("data:") ||
    value.includes("firebasestorage.googleapis.com") ||
    value.includes(".firebasestorage.app/");

  return (
    <div className="overflow-hidden border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">Galería</div>
      </div>

      <div className="p-3 sm:p-6">
        <div className={hasMultipleImages ? "grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-stretch lg:gap-4" : ""}>
          {hasMultipleImages ? (
            <div className="order-2 lg:order-1">
              <div className="rounded-[1.15rem] border border-zinc-200 bg-[#f7f4ef] p-2 sm:rounded-[1.5rem] sm:p-3">
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
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
                          "relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.8rem] border bg-white transition sm:h-18 sm:w-18 lg:h-auto lg:w-full lg:aspect-square lg:rounded-[0.9rem]",
                          isActive
                            ? "border-zinc-950 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.55)]"
                            : "border-zinc-200 opacity-75 hover:border-primary hover:opacity-100",
                        ].join(" ")}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${name} miniatura ${index + 1}`}
                          fill
                          unoptimized={isUnoptimizedImage(imageUrl)}
                          className="object-cover"
                          sizes="(min-width: 1024px) 72px, 64px"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div className={hasMultipleImages ? "order-1 lg:order-2" : ""}>
            <div
              className={[
                "relative overflow-hidden border border-zinc-200 bg-white",
                hasMultipleImages
                  ? "aspect-[1/1.08] rounded-[1.15rem] sm:aspect-[4/3.8] sm:rounded-[1.75rem] lg:h-[38rem] lg:aspect-auto"
                  : "min-h-[22rem] rounded-[1.25rem] sm:min-h-[30rem] sm:rounded-[1.75rem] lg:min-h-[42rem]",
              ].join(" ")}
            >
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${name} imagen ${selectedIndex + 1}`}
                fill
                priority={selectedIndex === 0}
                unoptimized={isUnoptimizedImage(selectedImage)}
                className={hasMultipleImages ? "object-contain p-3 sm:p-6" : "object-contain p-2 sm:p-4"}
                sizes={hasMultipleImages ? "(min-width: 1024px) 42rem, 100vw" : "100vw"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
