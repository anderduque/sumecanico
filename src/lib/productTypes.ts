export type Product = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
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
