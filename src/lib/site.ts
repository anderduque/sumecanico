export const site = {
  name: "Sumecánico",
  tagline: "Taller mecánico y venta de repuestos",
  logoPath: "/logo.jpg",
  instagramUrl: "https://www.instagram.com/sumecanico/",
  whatsappPhoneE164: "+584144058359",
  email: "contacto@sumecanico.com",
  addressLine: "Calle Michelena entre Anzoátegui y Briceño Méndez",
  cityLine: "Valencia, Carabobo",
  googleMapsUrl: "https://maps.app.goo.gl/RJBu484Hn3jEXCYC9",
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
