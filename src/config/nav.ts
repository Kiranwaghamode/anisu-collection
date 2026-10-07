export const mainNav = [
  { label: "Sarees", href: "/sarees" },
  { label: "Kurtis", href: "/kurtis" },
  { label: "New Arrivals", href: "/search?sort=new" },
] as const;

export const policyNav = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Refund & Exchange", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
] as const;

export const helpNav = [
  { label: "Track Order", href: "/track" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;
