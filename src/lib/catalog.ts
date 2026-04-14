export type Service = {
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  details: string[];
  intro: string;
  whyItMatters: string;
  process: string[];
  includes: string[];
  benefits: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const services: Service[] = [
  {
    slug: "diagnostico",
    name: "Diagnóstico computarizado",
    summary: "Lectura de fallas, sensores y sistemas electrónicos.",
    imageUrl: "/service-diagnostico-hd.png",
    intro:
      "Analizamos los sistemas electrónicos del vehículo para detectar fallas, validar síntomas y orientar la reparación correcta antes de cambiar piezas sin criterio.",
    whyItMatters:
      "Un diagnóstico bien hecho reduce retrabajos, evita gastos innecesarios y permite tomar decisiones con información real sobre motor, transmisión, encendido y sensores.",
    details: [
      "Escaneo y reporte de códigos de falla",
      "Revisión de parámetros en tiempo real",
      "Recomendación de reparación y cotización",
    ],
    process: [
      "Recepción del vehículo y levantamiento de síntomas reportados",
      "Escaneo con equipo de diagnóstico y revisión de módulos relacionados",
      "Interpretación técnica de códigos, datos y señales de sensores",
      "Entrega de hallazgos con explicación clara y recomendación de trabajo",
    ],
    includes: [
      "Lectura de códigos almacenados y pendientes",
      "Revisión de datos en vivo",
      "Borrado de fallas cuando aplica",
      "Orientación de reparación posterior",
    ],
    benefits: [
      "Identifica la causa antes de intervenir",
      "Ahorra tiempo y repuestos mal comprados",
      "Aclara el alcance real de la reparación",
    ],
    faqs: [
      {
        question: "¿El diagnóstico corrige la falla?",
        answer:
          "No siempre. El diagnóstico detecta el origen probable y define la reparación necesaria. Si la corrección puede hacerse de inmediato, la cotizamos aparte.",
      },
      {
        question: "¿Qué pasa si la luz del tablero no está encendida?",
        answer:
          "Igualmente puede revisarse. Muchas fallas intermitentes dejan registros o parámetros anormales que ayudan a identificar el problema.",
      },
      {
        question: "¿Cuánto tiempo demora?",
        answer:
          "Depende del síntoma y del sistema involucrado, pero normalmente la evaluación inicial se hace el mismo día.",
      },
    ],
  },
  {
    slug: "mantenimiento",
    name: "Mantenimiento preventivo",
    summary: "Servicios para alargar la vida útil del vehículo.",
    imageUrl: "/service-mantenimiento-hd.png",
    intro:
      "Realizamos mantenimiento periódico para conservar el rendimiento del vehículo y evitar fallas mayores por desgaste, fluidos vencidos o componentes fuera de condición.",
    whyItMatters:
      "La mantención correcta protege el motor, mejora la seguridad y evita que pequeños descuidos se conviertan en reparaciones más costosas.",
    details: [
      "Cambio de aceite y filtros",
      "Revisión de niveles y fugas",
      "Inspección de frenos, suspensión y dirección",
    ],
    process: [
      "Inspección general del vehículo y kilometraje",
      "Reemplazo de fluidos, aceite y filtros según necesidad",
      "Revisión visual y funcional de sistemas clave",
      "Entrega con observaciones y próximos mantenimientos sugeridos",
    ],
    includes: [
      "Cambio de aceite de motor",
      "Cambio de filtros según aplique",
      "Revisión de frenos, dirección y suspensión",
      "Verificación de niveles y fugas",
    ],
    benefits: [
      "Extiende la vida útil del vehículo",
      "Reduce el riesgo de fallas inesperadas",
      "Mantiene el desempeño y consumo en mejores condiciones",
    ],
    faqs: [
      {
        question: "¿Cada cuánto debo hacer mantenimiento?",
        answer:
          "Depende del uso, tipo de aceite y recomendaciones del fabricante. Como referencia, conviene revisarlo por kilometraje y al menos en intervalos regulares durante el año.",
      },
      {
        question: "¿Solo cambian aceite?",
        answer:
          "No. El servicio también contempla revisión general de fluidos, desgaste y sistemas básicos para detectar necesidades adicionales.",
      },
      {
        question: "¿Puedo llevar mis propios repuestos?",
        answer:
          "Sí, aunque primero validamos compatibilidad y calidad para evitar instalar componentes que luego generen problemas.",
      },
    ],
  },
  {
    slug: "frenos",
    name: "Frenos y suspensión",
    summary: "Seguridad y estabilidad: revisión y reemplazos.",
    imageUrl: "/service-frenos-hd.png",
    intro:
      "Atendemos sistema de frenos, amortiguación y componentes de suspensión para recuperar estabilidad, seguridad y respuesta de manejo.",
    whyItMatters:
      "Cuando frenos o suspensión están comprometidos, el vehículo pierde control, aumenta distancias de frenado y acelera el desgaste de otras piezas.",
    details: [
      "Cambio de pastillas/discos",
      "Revisión de amortiguadores y bujes",
      "Pruebas de frenado y ruidos",
    ],
    process: [
      "Inspección de desgaste, ruidos, vibraciones y holguras",
      "Revisión de discos, pastillas, amortiguadores, bujes y terminales",
      "Reemplazo o ajuste según condición encontrada",
      "Prueba final de funcionamiento y recomendaciones preventivas",
    ],
    includes: [
      "Evaluación de frenos delanteros y traseros",
      "Revisión de suspensión y dirección",
      "Diagnóstico de vibraciones o ruidos",
      "Cotización de piezas necesarias",
    ],
    benefits: [
      "Mejora la seguridad al frenar",
      "Recupera estabilidad y confort de manejo",
      "Previene desgaste irregular de neumáticos y otros componentes",
    ],
    faqs: [
      {
        question: "¿Qué señales indican problemas de frenos?",
        answer:
          "Ruidos al frenar, vibración en el pedal, mayor distancia de frenado o desvío del vehículo al frenar son señales claras de revisión inmediata.",
      },
      {
        question: "¿La suspensión también afecta la frenada?",
        answer:
          "Sí. Una suspensión en mal estado reduce estabilidad y contacto correcto del neumático con el piso, afectando la capacidad de frenado.",
      },
      {
        question: "¿Se puede revisar sin desmontar todo?",
        answer:
          "Sí. Hacemos una evaluación inicial para detectar el área comprometida y luego definimos si requiere desarme o reemplazo.",
      },
    ],
  },
  {
    slug: "electricidad",
    name: "Electricidad automotriz",
    summary: "Arranque, carga, luces, sensores y diagnósticos.",
    imageUrl: "/service-electricidad-hd.png",
    intro:
      "Resolvemos fallas eléctricas relacionadas con arranque, batería, alternador, iluminación, sensores y componentes electrónicos del vehículo.",
    whyItMatters:
      "Los problemas eléctricos pueden inmovilizar el vehículo o afectar múltiples sistemas al mismo tiempo. Detectarlos bien evita reemplazos innecesarios y fallas repetitivas.",
    details: [
      "Revisión de batería/alternador",
      "Solución de fallas eléctricas",
      "Instalación y reparación de componentes",
    ],
    process: [
      "Evaluación de síntomas: descarga, luces, arranque o fallas intermitentes",
      "Pruebas de batería, carga y continuidad",
      "Revisión de componentes, cableado y conexiones",
      "Corrección, reemplazo o recomendación técnica según hallazgo",
    ],
    includes: [
      "Medición de carga y voltaje",
      "Revisión de sistema de arranque",
      "Inspección de fusibles y conexiones",
      "Diagnóstico de luces o sensores",
    ],
    benefits: [
      "Disminuye fallas intermitentes difíciles de rastrear",
      "Protege otros sistemas sensibles del vehículo",
      "Evita quedarte varado por problemas de arranque o carga",
    ],
    faqs: [
      {
        question: "¿Cómo sé si el problema es batería o alternador?",
        answer:
          "No conviene asumirlo. Con pruebas de carga y voltaje verificamos si la falla está en la batería, el alternador, el arranque o una fuga eléctrica.",
      },
      {
        question: "¿Revisan fallas de luces y accesorios?",
        answer:
          "Sí. Revisamos circuitos de iluminación, fusibles, conexiones y elementos relacionados para corregir la falla desde la causa.",
      },
      {
        question: "¿La revisión incluye escaneo?",
        answer:
          "Si el sistema lo requiere, combinamos pruebas eléctricas con diagnóstico computarizado para tener una lectura más completa.",
      },
    ],
  },
  {
    slug: "limpieza-inyectores",
    name: "Limpieza de inyectores",
    summary: "Mejora la combustión y el rendimiento con una limpieza profesional.",
    imageUrl: "/service-inyectores-hd.png",
    intro:
      "Limpieza orientada a recuperar pulverización, respuesta y eficiencia de combustible cuando el motor presenta tirones, ralentí inestable o consumo elevado.",
    whyItMatters:
      "Un sistema de inyección sucio altera la combustión, baja el rendimiento del motor y puede generar fallas de encendido, humo o pérdida de potencia.",
    details: [
      "Diagnóstico de inyección y síntomas",
      "Limpieza para recuperar pulverización y respuesta",
      "Revisión de consumo, ralentí y encendido",
    ],
    process: [
      "Evaluación de síntomas asociados a inyección",
      "Revisión del estado general del sistema",
      "Limpieza y comprobación de funcionamiento",
      "Prueba de respuesta y recomendaciones posteriores",
    ],
    includes: [
      "Inspección previa del sistema",
      "Proceso de limpieza profesional",
      "Validación de marcha mínima y respuesta",
      "Sugerencias de mantenimiento complementario",
    ],
    benefits: [
      "Mejora respuesta del motor",
      "Ayuda a estabilizar ralentí y consumo",
      "Reduce síntomas asociados a combustión deficiente",
    ],
    faqs: [
      {
        question: "¿Cuándo conviene limpiar inyectores?",
        answer:
          "Cuando el motor presenta tirones, consumo alto, ralentí irregular o pérdida de respuesta, y tras confirmar que la causa apunta al sistema de inyección.",
      },
      {
        question: "¿La limpieza reemplaza otras reparaciones?",
        answer:
          "No. Si hay fallas de sensores, bobinas, bombas o presión de combustible, primero hay que identificarlas. La limpieza es una parte del diagnóstico global.",
      },
      {
        question: "¿Se nota el cambio de inmediato?",
        answer:
          "En muchos casos sí, especialmente en marcha mínima y respuesta. Todo depende del estado general del sistema y de si existen otras fallas asociadas.",
      },
    ],
  },
  {
    slug: "latoneria-pintura",
    name: "Latonería y pintura",
    summary: "Corrección estética, reparación de golpes y acabado profesional.",
    imageUrl: "/service-latoneria-pintura.png",
    intro:
      "Recuperamos la apariencia del vehículo con trabajos de latonería, preparación de superficies y pintura orientados a corregir golpes, rayones, abolladuras y desgaste visible.",
    whyItMatters:
      "Una buena reparación estética no solo mejora la presentación del vehículo; también ayuda a proteger la carrocería frente a corrosión, deterioro prematuro y pérdida de valor por daños mal resueltos.",
    details: [
      "Corrección de golpes, abolladuras y rayones",
      "Preparación de superficie, masillado y nivelación",
      "Aplicación de pintura y acabado según el daño",
    ],
    process: [
      "Inspección visual del daño, panel comprometido y nivel de corrección requerido",
      "Desarme parcial y trabajo de latonería para recuperar forma y alineación",
      "Preparación de la superficie con lijado, fondo y ajuste de imperfecciones",
      "Aplicación de pintura, secado, revisión final y entrega estética del área intervenida",
    ],
    includes: [
      "Evaluación del daño y alcance del trabajo",
      "Corrección de lámina en áreas afectadas",
      "Preparación técnica previa a pintura",
      "Acabado final con revisión visual",
    ],
    benefits: [
      "Mejora la imagen general del vehículo",
      "Protege la carrocería contra corrosión y desgaste",
      "Ayuda a conservar valor estético y comercial",
    ],
    faqs: [
      {
        question: "¿Se puede reparar un golpe sin pintar toda la pieza?",
        answer:
          "Depende del tipo de daño, la profundidad y la zona afectada. Primero evaluamos si conviene una corrección localizada o un trabajo más completo para que el acabado quede uniforme.",
      },
      {
        question: "¿Trabajan rayones y detalles estéticos menores?",
        answer:
          "Sí. Atendemos desde rayones, abolladuras leves y desgaste visible hasta correcciones más amplias de latonería y pintura.",
      },
      {
        question: "¿Cuánto tarda un trabajo de latonería y pintura?",
        answer:
          "El tiempo varía según la magnitud del daño, el número de piezas involucradas y el proceso de preparación. Tras la inspección te indicamos un tiempo estimado realista.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
