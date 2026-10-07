// All money in this app is an integer number of paise (₹1 = 100 paise).

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrWithPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 349900 → "₹3,499". Shows paise only when the amount isn't whole rupees. */
export function formatINR(paise: number): string {
  return paise % 100 === 0 ? inr.format(paise / 100) : inrWithPaise.format(paise / 100);
}

/** Rupee amount typed by a person (e.g. "3499" or "3499.50") → paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Whole-number discount percentage, or 0 when there's no real discount. */
export function discountPercent(price: number, mrp: number | null | undefined): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
