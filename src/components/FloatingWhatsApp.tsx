"use client";

import { whatsAppWaMeUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { usePathname } from "next/navigation";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const href = whatsAppWaMeUrl(
    "Hola, necesito ayuda con servicios o repuestos. Mi consulta es:",
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-700 sm:right-6"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
