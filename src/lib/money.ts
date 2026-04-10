export function formatMoney(
  amountCents: number,
  options?: { currency?: string; locale?: string },
) {
  const currency = options?.currency ?? "USD";
  const locale = options?.locale ?? "es-ES";
  const value = amountCents / 100;
  const absCents = Math.abs(Math.round(amountCents));
  const hasDecimals = absCents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}
