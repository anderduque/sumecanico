export type Service = {
  slug: string;
  name: string;
  summary: string;
  details: string[];
};

export const services: Service[] = [
  {
    slug: "diagnostico",
    name: "Diagnóstico computarizado",
    summary: "Lectura de fallas, sensores y sistemas electrónicos.",
    details: [
      "Escaneo y reporte de códigos de falla",
      "Revisión de parámetros en tiempo real",
      "Recomendación de reparación y cotización",
    ],
  },
  {
    slug: "mantenimiento",
    name: "Mantenimiento preventivo",
    summary: "Servicios para alargar la vida útil del vehículo.",
    details: [
      "Cambio de aceite y filtros",
      "Revisión de niveles y fugas",
      "Inspección de frenos, suspensión y dirección",
    ],
  },
  {
    slug: "frenos",
    name: "Frenos y suspensión",
    summary: "Seguridad y estabilidad: revisión y reemplazos.",
    details: [
      "Cambio de pastillas/discos",
      "Revisión de amortiguadores y bujes",
      "Pruebas de frenado y ruidos",
    ],
  },
  {
    slug: "electricidad",
    name: "Electricidad automotriz",
    summary: "Arranque, carga, luces, sensores y diagnósticos.",
    details: [
      "Revisión de batería/alternador",
      "Solución de fallas eléctricas",
      "Instalación y reparación de componentes",
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
