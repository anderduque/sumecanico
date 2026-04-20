export type Product = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  shockPosition?: "delantero" | "trasero";
  sku?: string;
  shockBrand?:
    | "GREBIS"
    | "GREKIS"
    | "BELUCI"
    | "NOR"
    | "OKAMI"
    | "TOKICO"
    | "GABRIEL"
    | "MONROE"
    | "OLDMAN EMU"
    | "MASTER KING"
    | "CIC"
    | "TOYOTA ORIGINAL";
  imageUrl?: string;
  imageUrls?: string[];
  pricingMode?: "fixed" | "check_availability";
  priceCents: number;
  currency: string;
  stockStatus: "in_stock" | "on_request";
  inventoryQty?: number;
  compatibleWith?: string[];
  specs?: { label: string; value: string }[];
};

export function getProductImageUrls(product: Pick<Product, "imageUrl" | "imageUrls">) {
  const list = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const cleaned = list.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length > 0) return cleaned;
  return product.imageUrl?.trim() ? [product.imageUrl.trim()] : [];
}

export function getProductCoverImage(product: Pick<Product, "imageUrl" | "imageUrls">) {
  return getProductImageUrls(product)[0];
}
