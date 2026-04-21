export const site = {
  name: "Sumecánico",
  tagline: "Taller mecánico y venta de repuestos",
  logoPath: "/logo.jpg",
  instagramUrl: "https://www.instagram.com/sumecanico/",
  whatsappPhoneE164: "+584144058359",
  email: "sumecanicoca6@gmail.com",
  addressLine: "Calle Michelena entre Anzoátegui y Briceño Méndez",
  cityLine: "Valencia, Carabobo",
  googleMapsUrl: "https://maps.app.goo.gl/RJBu484Hn3jEXCYC9",
  openingHours: [
    { label: "Lunes a Viernes", value: "8:30 am - 5:00 pm" },
    { label: "Sabados", value: "9:00 am - 2:00 pm" },
  ],
} as const;

export function whatsAppWaMeUrl(text: string) {
  const digits = site.whatsappPhoneE164.replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${encoded}`;
}
