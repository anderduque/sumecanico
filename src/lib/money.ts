export function formatMoney(
  amountCents: number,
  options?: { currency?: string; locale?: string },
) {
  const currency = options?.currency ?? "USD";
  const locale = options?.locale ?? "es-ES";
  const value = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

