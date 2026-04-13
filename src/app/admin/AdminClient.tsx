"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import type { Product } from "@/lib/productTypes";
import type { PaymentMethod } from "@/lib/paymentMethodsStore";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";

type LoadState = "idle" | "loading" | "ready" | "error";

type OrderStatus = "new" | "taken" | "closed";

type OrderRecord = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  takenAt?: string;
  closedAt?: string;
  customer: {
    fullName: string;
    idNumber: string;
    phoneE164: string;
    email?: string;
    address: string;
  };
  items: {
    productSlug: string;
    name: string;
    quantity: number;
    priceCents: number;
    currency: string;
  }[];
  totalCents: number;
  currency: string;
  payment: {
    methodId: string;
    methodName: string;
    reference?: string;
  };
  message: string;
};

function toAuthHeader(user: string, password: string) {
  const token = btoa(`${user}:${password}`);
  return `Basic ${token}`;
}

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function phoneToWhatsAppDigits(phoneE164: string) {
  return phoneE164.replace(/\D+/g, "");
}

function buildCustomerWhatsAppUrl(phoneE164: string, message: string) {
  const digits = phoneToWhatsAppDigits(phoneE164);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function buildOrderReplyMessage(order: OrderRecord) {
  const firstName = order.customer.fullName.trim().split(/\s+/)[0] || "Hola";
  const lines = [
    `Hola ${firstName}, soy del taller ${site.name}.`,
    "",
    `Recibimos tu solicitud de reserva de repuestos (orden ${order.id}).`,
    "Para confirmar compatibilidad y disponibilidad, ¿me indicas marca, modelo, año y motor de tu vehículo?",
    "",
    "Resumen:",
    ...order.items.map((i) => `- ${i.quantity} x ${i.name}`),
    "",
    "Quedo atento.",
  ];
  return lines.join("\n");
}

function emptyProduct(): Product {
  return {
    slug: "",
    name: "",
    summary: "",
    category: "",
    imageUrl: "",
    priceCents: 0,
    currency: "USD",
    stockStatus: "on_request",
    inventoryQty: undefined,
    compatibleWith: [],
    specs: [],
  };
}

function parseCompatibleWith(text: string) {
  const list = text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

function compatibleWithToText(list: string[] | undefined) {
  return list?.join(", ") ?? "";
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateAdminPassword(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 8) return "Usa mínimo 8 caracteres.";
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) return "Usa solo letras y números (sin espacios).";
  if (!/[A-Za-z]/.test(trimmed) || !/[0-9]/.test(trimmed)) return "Incluye al menos 1 letra y 1 número.";
  return null;
}

const productCategoryOptions = [
  "Frenos",
  "Motor",
  "Encendido",
  "Mantenimiento",
  "Accesorios",
  "Filtros",
  "Adicional",
] as const;

const specLabelOptions = [
  "Ancho (cm)",
  "Largo (cm)",
  "Peso (gr)",
  "Fabricado en",
  "Alto (cm)",
  "Nro de pieza",
] as const;

const popularPaymentPresets = [
  { label: "Zelle", id: "zelle", name: "Zelle" },
  { label: "Zinli", id: "zinli", name: "Zinli" },
  { label: "Binance", id: "binance", name: "Binance" },
  { label: "Pago móvil", id: "pago-movil", name: "Pago móvil" },
  { label: "PayPal", id: "paypal", name: "PayPal" },
] as const;

const venezuelaBanks = [
  "Banco de Venezuela",
  "Mercantil Banco",
  "Banesco",
  "BBVA Provincial",
  "Bancamiga",
  "Banco Nacional de Crédito (BNC)",
  "Bancaribe",
  "Banco Exterior",
  "Venezolano de Crédito",
  "BFC Banco Fondo Común",
  "Banplus",
  "Banco Plaza",
  "Banco Sofitasa",
  "Banco Caroní",
  "Banco Activo",
  "DelSur Banco Universal",
  "100% Banco",
  "Banco del Tesoro",
  "BANFANB",
  "Banco Agrícola de Venezuela",
  "Banco Internacional de Desarrollo",
  "Banco Digital de los Trabajadores",
  "N58 Banco Digital",
  "Bancrecer",
  "R4 Banco Microfinanciero",
  "Bangente",
] as const;

const popularVehicleBrands = [
  "Toyota",
  "Chevrolet",
  "Ford",
  "Nissan",
  "Hyundai",
  "Kia",
  "Honda",
  "Mazda",
  "Mitsubishi",
  "Volkswagen",
  "Renault",
  "Peugeot",
  "Fiat",
  "Jeep",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Chery",
  "Geely",
  "Suzuki",
  "Isuzu",
] as const;

const vehicleBodyStyles = ["Sedán", "Hatchback", "SUV", "Pickup", "Van", "Coupé", "Wagon"] as const;

const vehicleModelsByBrandAndBodyStyle: Record<string, Record<string, string[]>> = {
  Toyota: {
    "Sedán": ["Corolla", "Yaris", "Camry"],
    Hatchback: ["Yaris", "Corolla"],
    SUV: ["RAV4", "Fortuner", "Land Cruiser", "Prado"],
    Pickup: ["Hilux"],
    Van: ["Hiace"],
  },
  Chevrolet: {
    "Sedán": ["Aveo", "Optra", "Cruze"],
    Hatchback: ["Spark", "Aveo"],
    SUV: ["Captiva", "Trailblazer"],
    Pickup: ["Colorado", "Silverado"],
    Van: ["N300", "Express"],
  },
  Ford: {
    "Sedán": ["Fiesta", "Focus", "Fusion"],
    Hatchback: ["Fiesta", "Focus"],
    SUV: ["EcoSport", "Escape", "Explorer"],
    Pickup: ["Ranger", "F-150"],
  },
  Nissan: {
    "Sedán": ["Sentra", "Versa", "Altima"],
    Hatchback: ["Tiida", "March"],
    SUV: ["X-Trail", "Kicks", "Pathfinder"],
    Pickup: ["Frontier", "NP300"],
    Van: ["Urvan"],
  },
  Hyundai: {
    "Sedán": ["Elantra", "Accent", "Sonata"],
    Hatchback: ["i20", "Accent"],
    SUV: ["Tucson", "Santa Fe", "Creta"],
    Pickup: ["Santa Cruz"],
    Van: ["H-1"],
  },
  Kia: {
    "Sedán": ["Cerato", "Rio", "Optima"],
    Hatchback: ["Rio", "Picanto"],
    SUV: ["Sportage", "Sorento", "Seltos"],
  },
  Honda: {
    "Sedán": ["Civic", "Accord"],
    Hatchback: ["Civic"],
    SUV: ["CR-V", "HR-V", "Pilot"],
  },
  Mazda: {
    "Sedán": ["Mazda3", "Mazda6"],
    Hatchback: ["Mazda3"],
    SUV: ["CX-3", "CX-5", "CX-9"],
    Pickup: ["BT-50"],
  },
  Mitsubishi: {
    "Sedán": ["Lancer"],
    Hatchback: ["Colt"],
    SUV: ["Outlander", "Montero", "ASX"],
    Pickup: ["L200"],
  },
  Volkswagen: {
    "Sedán": ["Jetta", "Passat"],
    Hatchback: ["Golf", "Polo", "Gol"],
    SUV: ["Tiguan", "T-Cross", "Taos"],
    Pickup: ["Amarok"],
  },
  Renault: {
    "Sedán": ["Logan"],
    Hatchback: ["Sandero"],
    SUV: ["Duster", "Koleos"],
  },
  Peugeot: {
    "Sedán": ["301", "408"],
    Hatchback: ["206", "207", "208", "308"],
    SUV: ["2008", "3008", "5008"],
  },
  Fiat: {
    "Sedán": ["Siena", "Cronos"],
    Hatchback: ["Uno", "Palio"],
    Pickup: ["Strada", "Toro"],
  },
  Jeep: {
    SUV: ["Compass", "Cherokee", "Grand Cherokee", "Wrangler"],
  },
  "Mercedes-Benz": {
    "Sedán": ["Clase C", "Clase E"],
    SUV: ["GLA", "GLC", "GLE"],
  },
  BMW: {
    "Sedán": ["Serie 3", "Serie 5"],
    SUV: ["X1", "X3", "X5"],
  },
  Audi: {
    "Sedán": ["A3", "A4", "A6"],
    SUV: ["Q3", "Q5", "Q7"],
  },
  Chery: {
    "Sedán": ["Orinoco", "Arrizo"],
    SUV: ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 7"],
  },
  Geely: {
    "Sedán": ["Emgrand"],
    SUV: ["Coolray", "GX3"],
  },
  Suzuki: {
    "Sedán": ["Ciaz"],
    Hatchback: ["Swift"],
    SUV: ["Vitara", "Grand Vitara", "Jimny"],
  },
  Isuzu: {
    Pickup: ["D-Max"],
  },
};

function normalizePaymentKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function getPaymentIconKey(method: PaymentMethod) {
  const key = normalizePaymentKey(method.id || method.name);
  if (key.includes("paypal")) return "paypal";
  if (key.includes("binance")) return "binance";
  if (key.includes("zelle")) return "zelle";
  if (key.includes("zinli")) return "zinli";
  if (key.includes("pagomovil") || key.includes("pagomobile")) return "pago-movil";
  return "generic";
}

function getPaymentIconUrl(method: PaymentMethod) {
  const key = getPaymentIconKey(method);
  if (key === "paypal") return "https://cdn.simpleicons.org/paypal?viewbox=auto&size=20";
  if (key === "binance") return "https://cdn.simpleicons.org/binance?viewbox=auto&size=20";
  if (key === "zelle") return "https://cdn.simpleicons.org/zelle?viewbox=auto&size=20";
  return null;
}

function getBanksFromDetails(details: string): string[] {
  const lines = (details ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const found = lines.find((l) => l.toLowerCase().startsWith("banco:") || l.toLowerCase().startsWith("bancos:"));
  if (!found) return [];
  const part = found.replace(/^bancos?:/i, "").trim();
  return part.split(",").map((b) => b.trim()).filter(Boolean);
}

function setBanksInDetails(details: string, banks: string[]): string {
  const nextBanks = banks.filter(Boolean).join(", ");
  const lines = (details ?? "").split("\n");
  const out: string[] = [];
  let replaced = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.toLowerCase().startsWith("banco:") || line.toLowerCase().startsWith("bancos:")) {
      if (!replaced) {
        out.push(banks.length > 1 ? `Bancos: ${nextBanks}` : `Banco: ${nextBanks}`);
        replaced = true;
      }
      continue;
    }
    out.push(raw);
  }
  if (!replaced && nextBanks) {
    out.unshift(banks.length > 1 ? `Bancos: ${nextBanks}` : `Banco: ${nextBanks}`);
  }
  return out.join("\n").trim();
}

function stripBankFromDetails(details: string) {
  const lines = (details ?? "").split("\n");
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.toLowerCase().startsWith("banco:")) continue;
    out.push(raw);
  }
  return out.join("\n").trim();
}

const maxUploadImageBytes = 2_000_000;
const maxUploadImageDimension = 1024;
const maxUploadImageOutputBytes = 900_000;

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

async function fileToOptimizedJpegDataUrl(file: File) {
  if (file.size > maxUploadImageBytes) {
    throw new Error("La imagen es muy pesada. Máximo 2MB.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxUploadImageDimension / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("No se pudo procesar la imagen.");
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close?.();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrlToBytes(dataUrl) > maxUploadImageOutputBytes && quality > 0.5) {
    quality = Math.max(0.5, quality - 0.08);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrlToBytes(dataUrl) > maxUploadImageOutputBytes) {
    throw new Error("No se pudo optimizar la imagen lo suficiente. Usa una imagen más liviana.");
  }
  return dataUrl;
}

export function AdminClient() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [authHeader, setAuthHeader] = useState<string | null>(null);

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [draft, setDraft] = useState<Product>(emptyProduct());
  const [compatibleWithText, setCompatibleWithText] = useState("");
  const [compatBrand, setCompatBrand] = useState("");
  const [compatBodyStyle, setCompatBodyStyle] = useState("");
  const [compatModel, setCompatModel] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [inventoryInput, setInventoryInput] = useState("");

  const [tab, setTab] = useState<"dashboard" | "products" | "payments" | "orders" | "security">("dashboard");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [, setPaymentsState] = useState<LoadState>("idle");
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [paymentsSaved, setPaymentsSaved] = useState(false);
  const [paymentsBusyText, setPaymentsBusyText] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalMode, setPaymentModalMode] = useState<"add" | "edit">("add");
  const [paymentEditIndex, setPaymentEditIndex] = useState<number | null>(null);
  const [selectedPopularPaymentId, setSelectedPopularPaymentId] = useState("");
  const [paymentDraft, setPaymentDraft] = useState<PaymentMethod>({
    id: "",
    name: "",
    details: "",
    enabled: true,
    sort: 10,
  });
  const [paymentDraftBanks, setPaymentDraftBanks] = useState<string[]>([]);
  const [paymentDraftError, setPaymentDraftError] = useState<string | null>(null);
  const [securityCurrentPassword, setSecurityCurrentPassword] = useState("");
  const [securityNextPassword, setSecurityNextPassword] = useState("");
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState("");
  const [securityState, setSecurityState] = useState<LoadState>("idle");
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySaved, setSecuritySaved] = useState<string | null>(null);
  const [securityCanPersist, setSecurityCanPersist] = useState<boolean | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersState, setOrdersState] = useState<LoadState>("idle");
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const isEditingExisting = useMemo(() => {
    return !!draft.slug && products.some((p) => p.slug === draft.slug);
  }, [draft.slug, products]);
  const shouldTrackInventory = draft.stockStatus === "in_stock";
  const compatModelOptions = useMemo(() => {
    if (!compatBrand || !compatBodyStyle) return [];
    const models = vehicleModelsByBrandAndBodyStyle[compatBrand]?.[compatBodyStyle] ?? [];
    return models;
  }, [compatBodyStyle, compatBrand]);

  const logout = useCallback(() => {
    setAuthHeader(null);
    setPassword("");
    setProducts([]);
    setDraft(emptyProduct());
    setCompatibleWithText("");
    setCompatBrand("");
    setCompatBodyStyle("");
    setCompatModel("");
    setPriceInput("");
    setInventoryInput("");
    setError(null);
    setState("idle");
    setShowPanel(false);
    setTab("dashboard");
    setPaymentMethods([]);
    setPaymentsError(null);
    setPaymentsState("idle");
    setPaymentsSaved(false);
    setShowPaymentModal(false);
    setPaymentModalMode("add");
    setPaymentEditIndex(null);
    setSelectedPopularPaymentId("");
    setPaymentDraft({ id: "", name: "", details: "", enabled: true, sort: 10 });
    setPaymentDraftBanks([]);
    setPaymentDraftError(null);
    setSecurityCurrentPassword("");
    setSecurityNextPassword("");
    setSecurityConfirmPassword("");
    setSecurityState("idle");
    setSecurityError(null);
    setSecuritySaved(null);
    setSecurityCanPersist(null);
    setOrders([]);
    setOrdersState("idle");
    setOrdersError(null);
    setSelectedOrderId(null);
  }, []);

  const clearStoredAuth = useCallback(() => {
    return;
  }, []);

  const bumpActivity = useCallback(() => {
    return;
  }, []);

  function openNewPaymentMethodModal() {
    const nextSort = paymentMethods.length > 0 ? Math.max(...paymentMethods.map((m) => m.sort)) + 10 : 10;
    setPaymentDraft({ id: "", name: "", details: "", enabled: true, sort: nextSort });
    setPaymentDraftError(null);
    setPaymentModalMode("add");
    setPaymentEditIndex(null);
    setSelectedPopularPaymentId("");
    setPaymentDraftBanks([]);
    setShowPaymentModal(true);
  }

  function openEditPaymentMethodModal(idx: number) {
    const current = paymentMethods[idx];
    if (!current) return;
    setPaymentDraft({
      id: current.id ?? "",
      name: current.name ?? "",
      details: current.details ?? "",
      enabled: !!current.enabled,
      sort: Number.isFinite(current.sort) ? Math.trunc(current.sort) : 0,
    });
    setSelectedPopularPaymentId("");
    setPaymentDraftBanks(getBanksFromDetails(current.details ?? ""));
    setPaymentDraftError(null);
    setPaymentModalMode("edit");
    setPaymentEditIndex(idx);
    setShowPaymentModal(true);
  }

  async function upsertPaymentMethodFromDraft() {
    if (!authHeader) return;
    const name = paymentDraft.name.trim();
    if (!name) {
      setPaymentDraftError("El nombre es requerido.");
      return;
    }

    const derivedId = paymentDraft.id.trim() ? paymentDraft.id.trim() : slugify(name);
    if (!derivedId) {
      setPaymentDraftError("El código es requerido.");
      return;
    }

    const draftKind = getPaymentIconKey({ ...paymentDraft, id: derivedId, name });
    if (draftKind === "pago-movil") {
      const banks = paymentDraftBanks.length > 0 ? paymentDraftBanks : getBanksFromDetails(paymentDraft.details ?? "");
      if (banks.length === 0) {
        setPaymentDraftError("Selecciona al menos un banco (Pago móvil).");
        return;
      }
    }

    const existingIndex = paymentMethods.findIndex((m) => m.id.trim() === derivedId);
    if (existingIndex !== -1 && existingIndex !== paymentEditIndex) {
      setPaymentDraftError("Ya existe un método con ese código.");
      return;
    }

    const nextMethods =
      paymentModalMode === "edit" && paymentEditIndex !== null
        ? paymentMethods.map((m, i) =>
            i === paymentEditIndex
              ? {
                  ...m,
                  id: derivedId,
                  name,
                  details:
                    draftKind === "pago-movil"
                      ? setBanksInDetails(paymentDraft.details ?? "", paymentDraftBanks.length > 0 ? paymentDraftBanks : getBanksFromDetails(paymentDraft.details ?? ""))
                      : (paymentDraft.details ?? ""),
                  enabled: !!paymentDraft.enabled,
                  sort: Number.isFinite(paymentDraft.sort) ? Math.trunc(paymentDraft.sort) : 0,
                }
              : m,
          )
        : [
            ...paymentMethods,
            {
              id: derivedId,
              name,
              details:
                draftKind === "pago-movil"
                  ? setBanksInDetails(paymentDraft.details ?? "", paymentDraftBanks.length > 0 ? paymentDraftBanks : getBanksFromDetails(paymentDraft.details ?? ""))
                  : (paymentDraft.details ?? ""),
              enabled: !!paymentDraft.enabled,
              sort: Number.isFinite(paymentDraft.sort) ? Math.trunc(paymentDraft.sort) : 0,
            },
          ];

    setPaymentMethods(nextMethods);
    setPaymentDraftError(null);
    setShowPaymentModal(false);
    await savePaymentMethods(nextMethods, paymentModalMode === "edit" ? "Método actualizado." : "Método agregado.");
  }

  async function savePaymentMethods(nextMethodsArg?: PaymentMethod[], successMessage = "Métodos de pago guardados.") {
    if (!authHeader) return;
    setPaymentsState("loading");
    setPaymentsError(null);
    setPaymentsSaved(false);

    const source = nextMethodsArg ?? paymentMethods;
    const normalized: PaymentMethod[] = source
      .map((m, idx) => ({
        id: m.id.trim(),
        name: m.name.trim(),
        details: m.details ?? "",
        enabled: !!m.enabled,
        sort: Number.isFinite(m.sort) ? Math.trunc(m.sort) : (idx + 1) * 10,
      }))
      .filter((m) => m.id && m.name);

    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalized),
      });
      if (res.status === 401) {
        clearStoredAuth();
        setAuthHeader(null);
        setPaymentsState("error");
        setPaymentsError("Credenciales inválidas o no configuradas.");
        return;
      }
      if (!res.ok) {
        setPaymentsState("error");
        setPaymentsError("No se pudieron guardar los métodos de pago.");
        return;
      }
      setSavedNotice(successMessage);
      window.setTimeout(() => setSavedNotice(null), 3200);
      await loadPaymentMethods(authHeader);
      setPaymentsSaved(true);
    } catch {
      setPaymentsState("error");
      setPaymentsError("No se pudieron guardar los métodos de pago.");
    }
  }

  const load = useCallback(async (nextAuthHeader: string): Promise<boolean> => {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: nextAuthHeader },
        cache: "no-store",
      });
      if (res.status === 401) {
        clearStoredAuth();
        setAuthHeader(null);
        setState("error");
        setError("Credenciales inválidas o no configuradas.");
        return false;
      }
      if (!res.ok) {
        setState("error");
        setError("No se pudo cargar el catálogo.");
        return false;
      }
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? (data as Product[]) : [];
      setProducts(list);
      setState("ready");
      bumpActivity();
      return true;
    } catch {
      setState("error");
      setError("No se pudo cargar el catálogo.");
      return false;
    }
  }, [bumpActivity, clearStoredAuth]);

  const loadPaymentMethods = useCallback(async (nextAuthHeader: string): Promise<boolean> => {
    setPaymentsState("loading");
    setPaymentsError(null);
    setPaymentsSaved(false);
    try {
      const res = await fetch("/api/admin/payment-methods", {
        headers: { Authorization: nextAuthHeader },
        cache: "no-store",
      });
      if (res.status === 401) {
        clearStoredAuth();
        setAuthHeader(null);
        setPaymentsState("error");
        setPaymentsError("Credenciales inválidas o no configuradas.");
        return false;
      }
      if (!res.ok) {
        setPaymentsState("error");
        setPaymentsError("No se pudieron cargar los métodos de pago.");
        return false;
      }
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? (data as PaymentMethod[]) : [];
      setPaymentMethods(
        list
          .filter((m) => m && typeof m.id === "string")
          .sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name)),
      );
      setPaymentsState("ready");
      bumpActivity();
      return true;
    } catch {
      setPaymentsState("error");
      setPaymentsError("No se pudieron cargar los métodos de pago.");
      return false;
    }
  }, [bumpActivity, clearStoredAuth]);

  const loadOrders = useCallback(async (nextAuthHeader: string): Promise<boolean> => {
    setOrdersState("loading");
    setOrdersError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: nextAuthHeader },
        cache: "no-store",
      });
      if (res.status === 401) {
        clearStoredAuth();
        setAuthHeader(null);
        setOrdersState("error");
        setOrdersError("Credenciales inválidas o no configuradas.");
        return false;
      }
      if (!res.ok) {
        setOrdersState("error");
        setOrdersError("No se pudieron cargar las órdenes.");
        return false;
      }
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? (data as OrderRecord[]) : [];
      setOrders(list);
      setSelectedOrderId((prev) => prev || list[0]?.id || null);
      setOrdersState("ready");
      bumpActivity();
      return true;
    } catch {
      setOrdersState("error");
      setOrdersError("No se pudieron cargar las órdenes.");
      return false;
    }
  }, [bumpActivity, clearStoredAuth]);

  useEffect(() => {
    if (!authHeader) return;
    const t = window.setTimeout(() => {
      void load(authHeader);
      void loadPaymentMethods(authHeader);
      void loadOrders(authHeader);
    }, 0);
    return () => window.clearTimeout(t);
  }, [authHeader, load, loadOrders, loadPaymentMethods]);

  useEffect(() => {
    if (!authHeader) return;
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/admin/password", { cache: "no-store" });
        const data = (await res.json()) as unknown;
        const canPersist =
          typeof (data as { canPersist?: unknown })?.canPersist === "boolean"
            ? (data as { canPersist: boolean }).canPersist
            : null;
        if (!active) return;
        setSecurityCanPersist(canPersist);
      } catch {
        if (!active) return;
        setSecurityCanPersist(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [authHeader]);

  function selectProduct(p: Product) {
    const normalizedInventory =
      p.stockStatus === "in_stock" && typeof p.inventoryQty === "number" ? p.inventoryQty : undefined;
    setDraft({
      ...p,
      imageUrl: p.imageUrl ?? "",
      inventoryQty: normalizedInventory,
      compatibleWith: p.compatibleWith ?? [],
      specs: p.specs ?? [],
    });
    setCompatibleWithText(compatibleWithToText(p.compatibleWith));
    setCompatBrand("");
    setCompatBodyStyle("");
    setCompatModel("");
    setShowDeleteConfirm(false);
    setPriceInput(p.priceCents ? (Math.max(0, Math.round((p.priceCents ?? 0))) / 100).toFixed(2) : "");
    setInventoryInput(typeof normalizedInventory === "number" && normalizedInventory > 0 ? String(normalizedInventory) : "");
    setError(null);
    setShowPanel(true);
  }

  function startNew() {
    setDraft(emptyProduct());
    setCompatibleWithText("");
    setCompatBrand("");
    setCompatBodyStyle("");
    setCompatModel("");
    setShowDeleteConfirm(false);
    setPriceInput("");
    setInventoryInput("");
    setError(null);
    setShowPanel(true);
  }

  async function save() {
    if (!authHeader) return;
    setState("loading");
    setError(null);

    const derivedSlug = isEditingExisting ? draft.slug.trim() : slugify(draft.name);
    if (!derivedSlug) {
      setState("error");
      setError("Coloca un nombre válido para el repuesto.");
      return;
    }

    const name = draft.name.trim();
    if (!name) {
      setState("error");
      setError("El nombre es requerido.");
      return;
    }
    const category = draft.category.trim();
    if (!category) {
      setState("error");
      setError("La categoría es requerida.");
      return;
    }
    const summary = draft.summary.trim();
    if (!summary) {
      setState("error");
      setError("La descripción corta es requerida.");
      return;
    }
    const imageUrl = draft.imageUrl?.trim() ? draft.imageUrl.trim() : "";
    if (!imageUrl) {
      setState("error");
      setError("La imagen es requerida.");
      return;
    }
    if (!Number.isFinite(draft.priceCents) || draft.priceCents <= 0) {
      setState("error");
      setError("El precio es requerido.");
      return;
    }
    if (!draft.currency?.trim()) {
      setState("error");
      setError("La moneda es requerida.");
      return;
    }
    if (!draft.stockStatus) {
      setState("error");
      setError("El estado es requerido.");
      return;
    }
    if (shouldTrackInventory) {
      if (
        draft.inventoryQty === undefined ||
        !Number.isFinite(draft.inventoryQty) ||
        draft.inventoryQty < 0
      ) {
        setState("error");
        setError("El inventario es requerido.");
        return;
      }
    }

    const payload: Product = {
      ...draft,
      slug: derivedSlug,
      name,
      summary,
      category,
      currency: draft.currency.trim().toUpperCase(),
      imageUrl,
      compatibleWith: parseCompatibleWith(compatibleWithText),
      inventoryQty:
        shouldTrackInventory && typeof draft.inventoryQty === "number"
          ? Math.max(0, Math.trunc(draft.inventoryQty))
          : undefined,
      specs:
        draft.specs
          ?.map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
          .filter((s) => s.label && s.value) ?? undefined,
    };

    const method = isEditingExisting ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        clearStoredAuth();
        setAuthHeader(null);
        setState("error");
        setError("Credenciales inválidas o no configuradas.");
        return;
      }

      if (res.status === 409) {
        setState("error");
        setError("Ya existe un repuesto con ese identificador.");
        return;
      }

      if (!res.ok) {
        setState("error");
        setError("No se pudo guardar el producto.");
        return;
      }

      await load(authHeader);
      setState("ready");
      setShowPanel(false);
      setSavedNotice(isEditingExisting ? "Repuesto actualizado." : "Repuesto guardado.");
      window.setTimeout(() => setSavedNotice(null), 3200);
    } catch {
      setState("error");
      setError("No se pudo guardar el producto.");
    }
  }

  async function remove() {
    if (!authHeader) return;
    if (!draft.slug.trim()) return;

    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: draft.slug }),
      });
      if (res.status === 401) {
        clearStoredAuth();
        setAuthHeader(null);
        setState("error");
        setError("Credenciales inválidas o no configuradas.");
        return;
      }
      if (!res.ok) {
        setState("error");
        setError("No se pudo eliminar el producto.");
        return;
      }
      await load(authHeader);
      setShowDeleteConfirm(false);
      setShowPanel(false);
      setState("ready");
      setSavedNotice("Repuesto eliminado con éxito.");
      window.setTimeout(() => setSavedNotice(null), 3200);
    } catch {
      setState("error");
      setError("No se pudo eliminar el producto.");
    }
  }

  async function login() {
    const nextUser = user.trim();
    if (!nextUser || !password) {
      setError("Completa usuario y contraseña.");
      return;
    }

    const header = toAuthHeader(nextUser, password);
    setAuthHeader(header);
    const ok = await load(header);
    await loadPaymentMethods(header);
    if (ok) {
      setError(null);
      setPassword("");
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }

  async function changeAdminPassword() {
    const nextUser = user.trim();
    const current = securityCurrentPassword;
    const next = securityNextPassword;
    const confirm = securityConfirmPassword;

    setSecurityError(null);
    setSecuritySaved(null);

    if (!nextUser) {
      setSecurityError("Falta el usuario.");
      return;
    }
    if (!current) {
      setSecurityError("Ingresa tu clave actual.");
      return;
    }
    const validation = validateAdminPassword(next);
    if (validation) {
      setSecurityError(validation);
      return;
    }
    if (next !== confirm) {
      setSecurityError("La confirmación no coincide.");
      return;
    }

    setSecurityState("loading");
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          Authorization: toAuthHeader(nextUser, current),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: next.trim() }),
      });
      if (res.status === 401) {
        setSecurityState("error");
        setSecurityError("Clave actual incorrecta.");
        return;
      }
      if (res.status === 501) {
        setSecurityState("error");
        setSecurityError("No hay almacenamiento persistente configurado para guardar la clave en producción.");
        return;
      }
      if (!res.ok) {
        setSecurityState("error");
        setSecurityError("No se pudo actualizar la clave.");
        return;
      }

      setSecurityCurrentPassword("");
      setSecurityNextPassword("");
      setSecurityConfirmPassword("");
      setSecurityState("ready");
      setSecuritySaved("Clave actualizada. Inicia sesión de nuevo.");
      window.setTimeout(() => {
        logout();
        window.location.reload();
      }, 1200);
    } catch {
      setSecurityState("error");
      setSecurityError("No se pudo actualizar la clave.");
    }
  }

  if (!authHeader) {
    return (
      <div className="min-h-dvh bg-[linear-gradient(180deg,#121212_0%,#1a1a1a_42%,#2a0f12_100%)]">
        <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center px-4 py-10">
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
            Acceso administrativo
          </div>
          <div className="mt-6 w-full max-w-md border border-white/10 bg-white p-8 shadow-2xl shadow-black/30">
            <div className="flex justify-center">
              <div className="relative h-12 w-44">
                <Image
                  src={site.logoPath}
                  alt={`${site.name} logo`}
                  fill
                  className="object-contain"
                  sizes="176px"
                  priority
                />
              </div>
            </div>
            <div className="mt-5 text-center text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
              Panel de administración
            </div>
            <div className="mt-2 text-center text-sm leading-6 text-zinc-600">
              Gestiona repuestos, pagos y configuración interna desde un solo lugar.
            </div>

            <form
              className="mt-8 grid gap-5"
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              data-bwignore="true"
              onSubmit={(e) => {
                e.preventDefault();
                void login();
              }}
            >
              <div className="grid gap-2">
                <label
                  htmlFor="user"
                  className="text-xs font-semibold tracking-[0.18em] text-zinc-500"
                >
                  Usuario
                </label>
                <input
                  id="user"
                  name="admin-user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                  placeholder="usuario@ejemplo.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="email"
                  enterKeyHint="next"
                  spellCheck={false}
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold tracking-[0.18em] text-zinc-500"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="admin-passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  enterKeyHint="go"
                  spellCheck={false}
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                />
              </div>

              {error ? (
                <div className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-1 w-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#981b1f] disabled:opacity-60"
                disabled={state === "loading"}
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
          <div className="mt-8 text-xs font-semibold tracking-widest text-white/40">
            © {site.name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f6f3ef] pt-16">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950 text-white">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-28 shrink-0">
              <Image
                src={site.logoPath}
                alt={`${site.name} logo`}
                fill
                className="object-contain"
                sizes="112px"
                priority
              />
            </div>
            <div className="hidden text-xs font-semibold uppercase tracking-[0.24em] text-white/60 sm:block">
              Módulo interno
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="whitespace-nowrap border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-white/10 sm:px-4 sm:text-sm"
              onClick={() => setTab("security")}
            >
              Contraseña
            </button>
            <button
              type="button"
              className="whitespace-nowrap border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-white/10 sm:px-4 sm:text-sm"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </div>
        </Container>
      </div>

      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/module-admin-hero-v2.png"
            alt="Panel administrativo"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.86)_0%,rgba(10,10,10,0.72)_42%,rgba(10,10,10,0.64)_100%)]" />
        </div>

        <Container className="relative py-14 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              {tab === "dashboard"
                ? "Dashboard de administración"
                : tab === "products"
                ? "Repuestos"
                : tab === "payments"
                ? "Métodos de pago"
                : tab === "orders"
                ? "Órdenes"
                : "Seguridad"}
            </h1>
            <p className="mt-4 max-w-2xl text-justify text-base leading-8 text-zinc-200">
              {tab === "dashboard"
                ? "Accede a los módulos principales para gestionar catálogo, pagos y configuración."
                : tab === "products"
                ? "Administra repuestos, imágenes, precios, compatibilidad e inventario."
                : tab === "payments"
                ? "Configura los métodos de pago visibles y su información operativa."
                : tab === "orders"
                ? "Revisa las reservas enviadas desde checkout, toma la orden y responde al cliente."
                : "Actualiza la clave de acceso del módulo administrativo."}
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {site.name}
            </div>
            <p className="mt-2 text-sm text-zinc-700">
              {tab === "dashboard"
                ? "Elige un módulo para gestionar."
                : tab === "products"
                ? "Agrega/edita repuestos con imagen, precio y cantidad."
                : tab === "payments"
                ? "Configura métodos de pago visibles en la tienda."
                : tab === "orders"
                ? "Gestiona órdenes recibidas desde checkout."
                : "Cambia la clave de acceso del administrador."}
            </p>
          </div>
        </div>

      {tab === "dashboard" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setTab("products")}
            className="group border border-zinc-200 bg-white p-6 text-left shadow-sm transition-colors hover:border-primary/60 hover:bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-50 text-zinc-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm3-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7Zm2 3h6v2H9V9Zm0 4h6v2H9v-2Z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-950">Repuestos</div>
                <div className="text-xs text-zinc-600">Gestiona catálogo, precios e inventario</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTab("payments")}
            className="group border border-zinc-200 bg-white p-6 text-left shadow-sm transition-colors hover:border-primary/60 hover:bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-50 text-zinc-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3V7Zm0 4h18v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6Zm3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-950">Métodos de pago</div>
                <div className="text-xs text-zinc-600">Configura los medios aceptados</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTab("orders")}
            className="group border border-zinc-200 bg-white p-6 text-left shadow-sm transition-colors hover:border-primary/60 hover:bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-50 text-zinc-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M7 2a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2H7Zm0 2h10v2H7V4Zm13 6H4v10h16V10ZM7 13h6v2H7v-2Z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-950">Órdenes</div>
                <div className="text-xs text-zinc-600">Toma y responde reservas</div>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            onClick={() => setTab("dashboard")}
          >
            ← Volver
          </button>
          <button
            type="button"
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === "products"
                ? "bg-primary text-white"
                : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setTab("products")}
          >
            Repuestos
          </button>
          <button
            type="button"
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === "payments"
                ? "bg-primary text-white"
                : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setTab("payments")}
          >
            Métodos de pago
          </button>
          <button
            type="button"
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === "orders"
                ? "bg-primary text-white"
                : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setTab("orders")}
          >
            Órdenes
          </button>
        </div>
      )}

      {tab === "products" ? (
        <div className="mt-4 border border-zinc-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Repuestos
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                {products.length} producto{products.length === 1 ? "" : "s"} cargado
                {products.length === 1 ? "" : "s"} en el catálogo.
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center border border-primary bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#981b1f]"
              onClick={startNew}
            >
              Nuevo repuesto
            </button>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => selectProduct(p)}
                  className="group flex h-full flex-col overflow-hidden border border-zinc-200 bg-white text-left transition hover:border-primary/60 hover:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-50">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm font-semibold text-zinc-400">
                        Sin imagen
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.12)_58%,rgba(0,0,0,0.3)_100%)]" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex min-h-[9.5rem] items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="min-h-[4.5rem] text-xl font-semibold tracking-tight text-zinc-950">
                          {p.name}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                            {p.category || "Sin categoría"}
                          </span>
                          <span
                            className={[
                              "px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                              p.stockStatus === "in_stock"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-amber-50 text-amber-800",
                            ].join(" ")}
                          >
                            {p.stockStatus === "in_stock" ? "En stock" : "Bajo pedido"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          Precio
                        </div>
                        <div className="mt-1 text-lg font-semibold text-zinc-950">
                          {formatMoney(p.priceCents, { currency: p.currency })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm">
                      <div className="text-zinc-600">
                        Inventario:{" "}
                        <span className="font-semibold text-zinc-950">
                          {typeof p.inventoryQty === "number" ? p.inventoryQty : "—"}
                        </span>
                      </div>
                      <span className="font-semibold text-primary transition group-hover:text-[#981b1f]">
                        Editar →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-sm text-zinc-600">No hay productos.</div>
          )}
        </div>
      ) : null}
      {tab === "payments" ? (
        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                  Configuración de cobro
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
                  Métodos de pago
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
                  Organiza las opciones visibles en checkout con una presentación más clara,
                  datos bancarios mejor estructurados y activación rápida para cada método.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:brightness-90"
                  onClick={openNewPaymentMethodModal}
                >
                  Nuevo método
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {paymentsBusyText ? (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900">
                {paymentsBusyText}
              </div>
            ) : null}
            {paymentsError ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {paymentsError}
              </div>
            ) : null}
            {paymentsSaved ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Métodos de pago guardados.
              </div>
            ) : null}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Total
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                  {paymentMethods.length}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Activos
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                  {paymentMethods.filter((m) => m.enabled).length}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Checkout
                </div>
                <div className="mt-2 text-sm leading-7 text-zinc-700">
                  Los cambios se publican al agregar, editar o eliminar cada método.
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paymentMethods.map((m, idx) => {
                const iconKey = getPaymentIconKey(m);
                const iconUrl = getPaymentIconUrl(m);
                return (
                  <div
                    key={`${m.id}-${idx}`}
                    className="flex h-full flex-col rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-50">
                          {iconUrl ? (
                            <Image src={iconUrl} alt="" width={20} height={20} unoptimized className="h-5 w-5" />
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              {iconKey === "zinli" ? (
                                <>
                                  <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#5B3BB7" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(45 12 12)" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(90 12 12)" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(135 12 12)" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(180 12 12)" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(225 12 12)" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(270 12 12)" />
                                  <rect x="11" y="4.8" width="2" height="5.2" rx="1" fill="#2ED3B7" transform="rotate(315 12 12)" />
                                </>
                              ) : iconKey === "pago-movil" ? (
                                <>
                                  <rect x="14" y="6.6" width="7.6" height="2.6" rx="1.3" fill="#F5B000" />
                                  <rect x="14" y="10.7" width="7.6" height="2.6" rx="1.3" fill="#F5B000" />
                                  <rect x="14" y="14.8" width="7.6" height="2.6" rx="1.3" fill="#F5B000" />
                                  <path
                                    d="M3.3 6.6h6.2c1.9 0 3.4 1.5 3.4 3.3S11.4 13.2 9.5 13.2H6.2v4.2H3.3V6.6Zm2.9 2.4v2h3.2c.6 0 1.1-.4 1.1-1s-.5-1-1.1-1H6.2Z"
                                    fill="#111111"
                                  />
                                </>
                              ) : (
                                <path
                                  d="M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-1 12h2v6h-2v-6Z"
                                  fill="currentColor"
                                  className="text-zinc-600"
                                />
                              )}
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-semibold tracking-tight text-zinc-950">
                            {m.name?.trim() ? m.name : "Sin nombre"}
                          </div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {m.id || "—"}
                          </div>
                        </div>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                          m.enabled ? "bg-emerald-50 text-emerald-900" : "bg-zinc-100 text-zinc-700",
                        ].join(" ")}
                      >
                        {m.enabled ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {iconKey === "pago-movil" ? (
                      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        {getBanksFromDetails(m.details ?? "").length > 0
                          ? `Bancos · ${getBanksFromDetails(m.details ?? "").join(", ")}`
                          : "Banco · Sin definir"}
                      </div>
                    ) : null}

                    <div className="mt-4 flex-1 whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm leading-7 text-zinc-700">
                      {m.details?.trim()
                        ? iconKey === "pago-movil"
                          ? stripBankFromDetails(m.details)
                          : m.details
                        : "Sin detalles cargados."}
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                        onClick={() => openEditPaymentMethodModal(idx)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 hover:bg-rose-100"
                        onClick={async () => {
                          setPaymentsBusyText("Eliminando método...");
                          try {
                            const nextMethods = paymentMethods.filter((_, i) => i !== idx);
                            setPaymentMethods(nextMethods);
                            setPaymentsSaved(false);
                            await savePaymentMethods(nextMethods, "Método eliminado correctamente.");
                          } finally {
                            setPaymentsBusyText(null);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
              {paymentMethods.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-700 md:col-span-2 xl:col-span-3">
                  No hay métodos de pago.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {tab === "orders" ? (
        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Checkout</div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">Órdenes</div>
                <div className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
                  Reservas enviadas desde “Reservar y Enviar”. Toma la orden y responde al cliente directamente.
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  onClick={() => {
                    if (!authHeader) return;
                    void loadOrders(authHeader);
                  }}
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {ordersError ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {ordersError}
              </div>
            ) : null}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Nuevas</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                  {orders.filter((o) => o.status === "new").length}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">En proceso</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                  {orders.filter((o) => o.status === "taken").length}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Cerradas</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                  {orders.filter((o) => o.status === "closed").length}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-950">
                    Órdenes recientes
                  </div>
                  <div className="divide-y divide-zinc-200">
                    {orders.length ? (
                      orders.map((o) => {
                        const active = o.id === selectedOrderId;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setSelectedOrderId(o.id)}
                            className={[
                              "w-full px-4 py-4 text-left transition",
                              active ? "bg-primary/5" : "bg-white hover:bg-zinc-50",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-zinc-950">
                                  {o.customer?.fullName?.trim() ? o.customer.fullName : "Cliente"}
                                </div>
                                <div className="mt-1 text-xs text-zinc-600">{formatOrderDate(o.createdAt)}</div>
                              </div>
                              <span
                                className={[
                                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                                  o.status === "new"
                                    ? "bg-amber-50 text-amber-900"
                                    : o.status === "taken"
                                    ? "bg-blue-50 text-blue-900"
                                    : "bg-emerald-50 text-emerald-900",
                                ].join(" ")}
                              >
                                {o.status === "new" ? "Nueva" : o.status === "taken" ? "En proceso" : "Cerrada"}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                              <span>{o.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0} ítem(s)</span>
                              <span className="font-semibold text-zinc-900">
                                {formatMoney(o.totalCents, { currency: o.currency || "USD" })}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : ordersState === "loading" ? (
                      <div className="px-4 py-6 text-sm text-zinc-600">Cargando órdenes...</div>
                    ) : (
                      <div className="px-4 py-6 text-sm text-zinc-600">No hay órdenes registradas.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                {(() => {
                  const selected = orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null;
                  if (!selected) {
                    return (
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-700">
                        Selecciona una orden para ver los detalles.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                      <div className="border-b border-zinc-200 px-6 py-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Orden</div>
                            <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                              {selected.id}
                            </div>
                            <div className="mt-1 text-sm text-zinc-600">{formatOrderDate(selected.createdAt)}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                              onClick={() => {
                                const reply = buildOrderReplyMessage(selected);
                                const url = buildCustomerWhatsAppUrl(selected.customer.phoneE164, reply);
                                window.open(url, "_blank", "noopener,noreferrer");
                              }}
                            >
                              Responder por WhatsApp
                            </button>
                            {selected.customer.email ? (
                              <a
                                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                                href={`mailto:${encodeURIComponent(selected.customer.email)}?subject=${encodeURIComponent(
                                  `Orden ${selected.id} - ${site.name}`,
                                )}&body=${encodeURIComponent(buildOrderReplyMessage(selected))}`}
                              >
                                Enviar email
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 opacity-50"
                              >
                                Enviar email
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-6">
                        <div className="grid gap-6 lg:grid-cols-12">
                          <div className="lg:col-span-7">
                            <div className="text-sm font-semibold text-zinc-950">Cliente</div>
                            <div className="mt-3 grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                              <div>
                                <span className="font-semibold text-zinc-900">Nombre:</span> {selected.customer.fullName}
                              </div>
                              <div>
                                <span className="font-semibold text-zinc-900">Cédula:</span> {selected.customer.idNumber}
                              </div>
                              <div>
                                <span className="font-semibold text-zinc-900">Teléfono:</span> {selected.customer.phoneE164}
                              </div>
                              {selected.customer.email ? (
                                <div>
                                  <span className="font-semibold text-zinc-900">Email:</span> {selected.customer.email}
                                </div>
                              ) : null}
                              <div>
                                <span className="font-semibold text-zinc-900">Dirección:</span> {selected.customer.address}
                              </div>
                            </div>

                            <div className="mt-6 text-sm font-semibold text-zinc-950">Repuestos</div>
                            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200">
                              <div className="divide-y divide-zinc-200">
                                {selected.items.map((i) => (
                                  <div key={`${selected.id}-${i.productSlug}-${i.name}`} className="px-4 py-3 text-sm">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <div className="font-semibold text-zinc-950">{i.name}</div>
                                        <div className="mt-1 text-xs text-zinc-600">{i.productSlug}</div>
                                      </div>
                                      <div className="shrink-0 text-right">
                                        <div className="text-xs text-zinc-600">Cantidad</div>
                                        <div className="font-semibold text-zinc-950">{i.quantity}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                                <span className="font-semibold text-zinc-900">Total sugerido</span>
                                <span className="font-semibold text-zinc-950">
                                  {formatMoney(selected.totalCents, { currency: selected.currency || "USD" })}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 text-sm font-semibold text-zinc-950">Mensaje enviado</div>
                            <div className="mt-3 whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                              {selected.message?.trim() ? selected.message : "—"}
                            </div>
                          </div>

                          <div className="lg:col-span-5">
                            <div className="rounded-xl border border-zinc-200 bg-white p-4">
                              <div className="text-sm font-semibold text-zinc-950">Estado</div>
                              <div className="mt-2 text-sm text-zinc-700">
                                {selected.status === "new"
                                  ? "Nueva"
                                  : selected.status === "taken"
                                  ? "En proceso"
                                  : "Cerrada"}
                              </div>

                              <div className="mt-4 grid gap-2">
                                {selected.status === "new" ? (
                                  <button
                                    type="button"
                                    className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:brightness-90"
                                    onClick={async () => {
                                      if (!authHeader) return;
                                      setOrdersError(null);
                                      const res = await fetch("/api/admin/orders", {
                                        method: "PUT",
                                        headers: {
                                          Authorization: authHeader,
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ id: selected.id, status: "taken" }),
                                      });
                                      if (res.status === 401) {
                                        clearStoredAuth();
                                        setAuthHeader(null);
                                        setOrdersError("Credenciales inválidas o no configuradas.");
                                        return;
                                      }
                                      if (!res.ok) {
                                        setOrdersError("No se pudo actualizar el estado de la orden.");
                                        return;
                                      }
                                      await loadOrders(authHeader);
                                      setSelectedOrderId(selected.id);
                                    }}
                                  >
                                    Tomar orden
                                  </button>
                                ) : null}

                                {selected.status !== "closed" ? (
                                  <button
                                    type="button"
                                    className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                                    onClick={async () => {
                                      if (!authHeader) return;
                                      setOrdersError(null);
                                      const res = await fetch("/api/admin/orders", {
                                        method: "PUT",
                                        headers: {
                                          Authorization: authHeader,
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ id: selected.id, status: "closed" }),
                                      });
                                      if (res.status === 401) {
                                        clearStoredAuth();
                                        setAuthHeader(null);
                                        setOrdersError("Credenciales inválidas o no configuradas.");
                                        return;
                                      }
                                      if (!res.ok) {
                                        setOrdersError("No se pudo actualizar el estado de la orden.");
                                        return;
                                      }
                                      await loadOrders(authHeader);
                                      setSelectedOrderId(selected.id);
                                    }}
                                  >
                                    Cerrar orden
                                  </button>
                                ) : null}
                              </div>

                              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Pago</div>
                                <div className="mt-2">
                                  <span className="font-semibold text-zinc-900">Método:</span>{" "}
                                  {selected.payment?.methodName || "—"}
                                </div>
                                {selected.payment?.reference ? (
                                  <div className="mt-1">
                                    <span className="font-semibold text-zinc-900">Referencia:</span> {selected.payment.reference}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {tab === "security" ? (
        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-6">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                Seguridad
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
                Cambiar clave
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
                La clave debe ser alfanumérica, sin espacios, e incluir letras y números.
              </p>
            </div>
          </div>

          <div className="px-6 py-6">
            {securityCanPersist === false ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No hay almacenamiento persistente configurado para guardar la clave.
              </div>
            ) : null}
            {securityError ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {securityError}
              </div>
            ) : null}
            {securitySaved ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {securitySaved}
              </div>
            ) : null}

            <div className="grid max-w-xl gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-900">Clave actual</label>
                <input
                  value={securityCurrentPassword}
                  onChange={(e) => {
                    setSecurityCurrentPassword(e.target.value);
                    setSecurityError(null);
                    setSecuritySaved(null);
                  }}
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-900">Nueva clave</label>
                <input
                  value={securityNextPassword}
                  onChange={(e) => {
                    setSecurityNextPassword(e.target.value);
                    setSecurityError(null);
                    setSecuritySaved(null);
                  }}
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                />
                <div className="text-xs text-zinc-600">
                  Requisitos: mínimo 8 caracteres, solo letras y números, incluye al menos 1 letra y 1 número.
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-900">Confirmar nueva clave</label>
                <input
                  value={securityConfirmPassword}
                  onChange={(e) => {
                    setSecurityConfirmPassword(e.target.value);
                    setSecurityError(null);
                    setSecuritySaved(null);
                  }}
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-[#1b4f7d] focus:ring-4 focus:ring-[#1b4f7d]/15"
                />
              </div>

              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:brightness-90 disabled:opacity-60"
                disabled={securityState === "loading" || securityCanPersist === false}
                onClick={() => void changeAdminPassword()}
              >
                Guardar nueva clave
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPaymentModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPaymentModal(false)}
            aria-hidden="true"
          />
          <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:max-w-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="text-sm font-semibold text-zinc-950">
                {paymentModalMode === "edit" ? "Editar método de pago" : "Agregar método de pago"}
              </div>
              <button
                type="button"
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                onClick={() => setShowPaymentModal(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {paymentDraftError ? (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  {paymentDraftError}
                </div>
              ) : null}
              <div className="grid gap-3">
                {paymentModalMode === "add" ? (
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-zinc-900">Popular</label>
                    <select
                        value={selectedPopularPaymentId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedPopularPaymentId(value);
                          const preset = popularPaymentPresets.find((x) => x.id === value);
                          if (!preset) return;
                          setPaymentDraft((p) => ({ ...p, name: preset.name, id: preset.id }));
                          if (preset.id !== "pago-movil") setPaymentDraftBanks([]);
                          setPaymentDraftError(null);
                        }}
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                      <option value="">Selecciona uno</option>
                      {popularPaymentPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-900">Nombre*</label>
                  <input
                    value={paymentDraft.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPaymentDraft((p) => ({ ...p, name: value }));
                      setPaymentDraftError(null);
                    }}
                    onBlur={() => {
                      if (!paymentDraft.id.trim() && paymentDraft.name.trim()) {
                        const nextId = slugify(paymentDraft.name);
                        if (nextId) setPaymentDraft((p) => ({ ...p, id: nextId }));
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    placeholder="Pago móvil"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-900">Código*</label>
                  <input
                    value={paymentDraft.id}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPaymentDraft((p) => ({ ...p, id: value }));
                      setPaymentDraftError(null);
                    }}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    placeholder="pago-movil"
                  />
                </div>
                {getPaymentIconKey(paymentDraft) === "pago-movil" ? (
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-zinc-900">Bancos*</label>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-300 bg-white p-2">
                      {venezuelaBanks.map((b) => (
                        <label key={b} className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-300 text-primary"
                            checked={paymentDraftBanks.includes(b)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const nextBanks = checked
                                ? [...paymentDraftBanks, b]
                                : paymentDraftBanks.filter((x) => x !== b);
                              setPaymentDraftBanks(nextBanks);
                              setPaymentDraft((p) => ({ ...p, details: setBanksInDetails(p.details ?? "", nextBanks) }));
                              setPaymentDraftError(null);
                            }}
                          />
                          <span className="text-sm text-zinc-700">{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-900">Detalles</label>
                  <textarea
                    value={paymentDraft.details}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPaymentDraft((p) => ({ ...p, details: value }));
                      if (getPaymentIconKey(paymentDraft) === "pago-movil") setPaymentDraftBanks(getBanksFromDetails(value));
                      setPaymentDraftError(null);
                    }}
                    className="min-h-[90px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    placeholder="Datos del método (una línea por dato)"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 text-primary"
                    checked={paymentDraft.enabled}
                    onChange={(e) => {
                      const value = e.target.checked;
                      setPaymentDraft((p) => ({ ...p, enabled: value }));
                      setPaymentDraftError(null);
                    }}
                  />
                  Activo
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={upsertPaymentMethodFromDraft}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90"
              >
                {paymentModalMode === "edit" ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPanel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPanel(false)}
            aria-hidden="true"
          />
          <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:max-w-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="text-sm font-semibold text-zinc-950">
                {isEditingExisting ? "Editar repuesto" : "Crear repuesto"}
              </div>
              <button
                type="button"
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                onClick={() => setShowPanel(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="name">
                        Nombre*
                      </label>
                      <input
                        id="name"
                        value={draft.name}
                        onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                        required
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Pastillas de freno delanteras"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="category">
                        Categoría*
                      </label>
                      <select
                        id="category"
                        value={draft.category}
                        onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                        required
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                      >
                        <option value="">Selecciona una categoría</option>
                        {productCategoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="imageFile">
                        Imagen*
                      </label>
                      <div className="relative h-44 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                        {draft.imageUrl ? (
                          <Image
                            src={draft.imageUrl}
                            alt={draft.name || "Imagen del repuesto"}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(min-width: 1024px) 42rem, 100vw"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-sm font-semibold text-zinc-500">
                            Sin imagen
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3">
                          <label
                            htmlFor="imageFile"
                            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
                          >
                            Seleccionar archivo
                          </label>
                          {draft.imageUrl ? (
                            <button
                              type="button"
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
                              onClick={() => setDraft((p) => ({ ...p, imageUrl: "" }))}
                            >
                              Quitar
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        required={!draft.imageUrl}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setState("loading");
                          setError(null);
                          void fileToOptimizedJpegDataUrl(file)
                            .then((dataUrl) => {
                              setDraft((p) => ({ ...p, imageUrl: dataUrl }));
                              setState("ready");
                            })
                            .catch((err: unknown) => {
                              setState("error");
                              setError(err instanceof Error ? err.message : "No se pudo cargar la imagen.");
                            });
                        }}
                      />
                      <div className="text-xs text-zinc-600">
                        Máximo 2MB · Se optimiza automáticamente (hasta {maxUploadImageDimension}px).
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-zinc-900" htmlFor="priceCents">
                            Precio*
                          </label>
                          <input
                            id="priceCents"
                            value={priceInput}
                            onFocus={() => {
                              if (priceInput === "0" || priceInput === "0.00") setPriceInput("");
                            }}
                            onChange={(e) => {
                              const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
                              const cleaned = raw.replace(/^0+(?=\d)/, "");
                              setPriceInput(cleaned);
                              const num = parseFloat(cleaned);
                              const cents = Number.isFinite(num) ? Math.max(0, Math.round(num * 100)) : 0;
                              setDraft((p) => ({ ...p, priceCents: cents }));
                            }}
                            inputMode="decimal"
                            required
                            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                            placeholder="0"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-zinc-900" htmlFor="currency">
                            Moneda*
                          </label>
                          <select
                            id="currency"
                            value={draft.currency}
                            onChange={(e) => setDraft((p) => ({ ...p, currency: e.target.value }))}
                            required
                            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                          >
                            <option value="USD">Dólares (USD)</option>
                            <option value="VES">Bolívares (Bs)</option>
                          </select>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-600">
                        Vista: {formatMoney(Number(draft.priceCents) || 0, { currency: draft.currency })}
                      </div>
                    </div>

                    <div className={["grid gap-3", shouldTrackInventory ? "sm:grid-cols-2" : ""].join(" ")}>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-zinc-900" htmlFor="stockStatus">
                          Estado*
                        </label>
                        <select
                          id="stockStatus"
                          value={draft.stockStatus}
                          onChange={(e) => {
                            const next = e.target.value as Product["stockStatus"];
                            setDraft((p) => ({
                              ...p,
                              stockStatus: next,
                              inventoryQty:
                                next === "in_stock"
                                  ? typeof p.inventoryQty === "number"
                                    ? p.inventoryQty
                                    : 0
                                  : undefined,
                            }));
                            if (next !== "in_stock") setInventoryInput("");
                          }}
                          required
                          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        >
                          <option value="on_request">Bajo pedido</option>
                          <option value="in_stock">En stock</option>
                        </select>
                      </div>

                      {shouldTrackInventory ? (
                        <div className="grid gap-2">
                          <label
                            className="text-sm font-semibold text-zinc-900"
                            htmlFor="inventoryQty"
                          >
                            Inventario (cantidad)*
                          </label>
                          <input
                            id="inventoryQty"
                            value={inventoryInput}
                            onFocus={() => {
                              if (inventoryInput === "0") setInventoryInput("");
                            }}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              const cleaned = raw.replace(/^0+(?=\d)/, "");
                              setInventoryInput(cleaned);
                              const qty = cleaned ? Math.max(0, Math.trunc(Number(cleaned))) : 0;
                              setDraft((p) => ({ ...p, inventoryQty: qty }));
                            }}
                            inputMode="numeric"
                            required
                            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                            placeholder="0"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-zinc-900" htmlFor="summary">
                        Descripción corta*
                      </label>
                      <textarea
                        id="summary"
                        value={draft.summary}
                        onChange={(e) => setDraft((p) => ({ ...p, summary: e.target.value }))}
                        required
                        className="min-h-[90px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Kit delantero. Verifica compatibilidad..."
                      />
                    </div>

                    <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                      <div className="text-sm font-semibold text-rose-700">Especificaciones</div>
                      <div className="mt-3 grid gap-2">
                        {(draft.specs ?? []).map((s, idx) => (
                          <div key={`${idx}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                            <select
                              value={s.label}
                              onChange={(e) => {
                                const value = e.target.value;
                                setDraft((p) => ({
                                  ...p,
                                  specs: (p.specs ?? []).map((x, i) => (i === idx ? { ...x, label: value } : x)),
                                }));
                              }}
                              className="h-10 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-zinc-900"
                            >
                              {s.label && !specLabelOptions.includes(s.label as (typeof specLabelOptions)[number]) ? (
                                <option value={s.label}>{s.label}</option>
                              ) : null}
                              <option value="">Selecciona</option>
                              {specLabelOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <input
                              value={s.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                setDraft((p) => ({
                                  ...p,
                                  specs: (p.specs ?? []).map((x, i) => (i === idx ? { ...x, value } : x)),
                                }));
                              }}
                              className="h-10 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-zinc-900"
                              placeholder="3"
                            />
                            <button
                              type="button"
                              className="h-10 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                              onClick={() => {
                                setDraft((p) => ({
                                  ...p,
                                  specs: (p.specs ?? []).filter((_, i) => i !== idx),
                                }));
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                          onClick={() => {
                            const used = new Set((draft.specs ?? []).map((x) => x.label));
                            const nextLabel = specLabelOptions.find((x) => !used.has(x)) ?? "";
                            setDraft((p) => ({ ...p, specs: [...(p.specs ?? []), { label: nextLabel, value: "" }] }));
                          }}
                        >
                          Agregar especificación
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label
                        className="text-sm font-semibold text-zinc-900"
                        htmlFor="compatibleWith"
                      >
                        Compatibilidad (separada por comas)
                      </label>
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="grid gap-1.5">
                            <div className="text-xs font-semibold text-zinc-700">Marca</div>
                            <select
                              value={compatBrand}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCompatBrand(value);
                                setCompatModel("");
                              }}
                              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                            >
                              <option value="">Selecciona</option>
                              {popularVehicleBrands.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-1.5">
                            <div className="text-xs font-semibold text-zinc-700">Tipo</div>
                            <select
                              value={compatBodyStyle}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCompatBodyStyle(value);
                                setCompatModel("");
                              }}
                              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                            >
                              <option value="">Selecciona</option>
                              {vehicleBodyStyles.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-1.5">
                            <div className="text-xs font-semibold text-zinc-700">Modelo</div>
                            <select
                              value={compatModel}
                              onChange={(e) => setCompatModel(e.target.value)}
                              disabled={!compatBrand || !compatBodyStyle}
                              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-100"
                            >
                              <option value="">Selecciona</option>
                              {compatModelOptions.length ? (
                                compatModelOptions.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No hay opciones
                                </option>
                              )}
                            </select>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
                            disabled={!compatBrand || !compatBodyStyle || !compatModel}
                            onClick={() => {
                              if (!compatBrand || !compatBodyStyle || !compatModel) return;
                              const token = `${compatBrand} ${compatModel} (${compatBodyStyle})`;
                              const current = parseCompatibleWith(compatibleWithText) ?? [];
                              const exists = current.some((x) => x.trim().toLowerCase() === token.trim().toLowerCase());
                              if (exists) return;
                              setCompatibleWithText([...current, token].join(", "));
                              setCompatBrand("");
                              setCompatBodyStyle("");
                              setCompatModel("");
                            }}
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                      <input
                        id="compatibleWith"
                        value={compatibleWithText}
                        onChange={(e) => setCompatibleWithText(e.target.value)}
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                        placeholder="Sedán, Hatchback, SUV"
                      />
                    </div>
                  </div>
                </div>
            <div className="border-t border-zinc-200 px-5 py-4">
              {error ? (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  {error}
                </div>
              ) : null}
              {showDeleteConfirm ? (
                <div className="mb-3 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <div>¿Estás seguro de que deseas eliminar este repuesto?</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={remove}
                      className="rounded-lg border border-rose-200 bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                      disabled={state === "loading"}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                {isEditingExisting ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
                    disabled={state === "loading"}
                  >
                    Eliminar
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPanel(false)}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-90"
                    disabled={state === "loading"}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {savedNotice ? (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-900 shadow-2xl">
            {savedNotice}
          </div>
        </div>
      ) : null}
      </Container>
    </div>
  );
}
