export type Service = {
  slug: string;
  name: string;
  summary: string;
  details: string[];
};

export type Product = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  priceCents: number;
  currency: string;
  stockStatus: "in_stock" | "on_request";
  compatibleWith?: string[];
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

export const products: Product[] = [
  {
    slug: "filtro-aceite-universal",
    name: "Filtro de aceite (universal)",
    summary: "Filtro para mantenimiento básico. Compatibilidad según modelo.",
    category: "Filtros",
    priceCents: 2500_00,
    currency: "USD",
    stockStatus: "on_request",
  },
  {
    slug: "pastillas-freno-delanteras",
    name: "Pastillas de freno delanteras",
    summary: "Kit delantero. Verifica compatibilidad con tu vehículo.",
    category: "Frenos",
    priceCents: 6500_00,
    currency: "USD",
    stockStatus: "on_request",
    compatibleWith: ["Sedán", "Hatchback", "SUV (según referencia)"],
  },
  {
    slug: "bujias-kit-4",
    name: "Bujías (kit x4)",
    summary: "Kit de bujías para encendido. Tipo según motor.",
    category: "Encendido",
    priceCents: 4800_00,
    currency: "USD",
    stockStatus: "on_request",
  },
  {
    slug: "correa-distribucion",
    name: "Correa de distribución",
    summary: "Repuesto crítico. Incluye recomendación de cambio por kilometraje.",
    category: "Motor",
    priceCents: 12000_00,
    currency: "USD",
    stockStatus: "on_request",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

