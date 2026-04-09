export const site = {
  name: "Sumecánico",
  tagline: "Taller mecánico y venta de repuestos",
  logoPath: "/logo.jpg",
  instagramUrl: "https://www.instagram.com/sumecanico/",
  whatsappPhoneE164: "+584144058359",
  email: "contacto@sumecanico.com",
  addressLine: "Dirección por confirmar",
  cityLine: "Ciudad por confirmar",
  openingHours: [
    { label: "Lunes a Viernes", value: "08:00 – 18:00" },
    { label: "Sábado", value: "08:00 – 13:00" },
  ],
} as const;

export function whatsAppWaMeUrl(text: string) {
  const digits = site.whatsappPhoneE164.replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${encoded}`;
}
