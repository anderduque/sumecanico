export type CartProductSnapshot = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  imageUrl?: string;
  priceCents: number;
  currency: string;
  stockStatus: "in_stock" | "on_request";
  inventoryQty?: number;
  compatibleWith?: string[];
  specs?: { label: string; value: string }[];
};

export type CartLine = {
  productSlug: string;
  quantity: number;
  product?: CartProductSnapshot;
};
