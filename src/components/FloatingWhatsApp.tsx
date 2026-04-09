import { whatsAppWaMeUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function FloatingWhatsApp() {
  const href = whatsAppWaMeUrl(
    "Hola, necesito ayuda con servicios o repuestos. Mi consulta es:",
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-700"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}

