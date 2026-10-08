/** Shown as "Last updated" on the policy pages. Change it whenever you edit a policy. */
export const POLICIES_UPDATED = "8 October 2026";

/** Information pages (About, Contact, policies), for the sitemap and page metadata. */
export const INFO_PAGES = [
  { path: "/about", title: "About us" },
  { path: "/contact", title: "Contact us" },
  { path: "/shipping-policy", title: "Shipping Policy" },
  { path: "/refund-policy", title: "Refund & Exchange Policy" },
  { path: "/privacy-policy", title: "Privacy Policy" },
  { path: "/terms", title: "Terms & Conditions" },
] as const;
