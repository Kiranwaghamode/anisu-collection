import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import { STORE_EMAIL, STORE_NAME, STORE_PHONE, STORE_WHATSAPP } from "@/config/store";

// Email clients ignore web fonts and CSS variables, so the brand is spelled out here.
export const brand = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  text: "#1F1F1F",
  muted: "#6B6B6B",
  border: "#E8E2D9",
  accent: "#7A1E2C",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: brand.sans, color: brand.text, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>
          <Text style={{ fontFamily: brand.serif, fontSize: 28, fontWeight: 600, textAlign: "center", margin: "8px 0 20px" }}>
            {STORE_NAME}
          </Text>
          <Section
            style={{ backgroundColor: brand.surface, border: `1px solid ${brand.border}`, borderRadius: 8, padding: "28px 24px" }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: brand.border, margin: "24px 0 12px" }} />
          <Text style={{ fontSize: 13, color: brand.muted, textAlign: "center", lineHeight: "20px", margin: 0 }}>
            Questions? Reply to this email, WhatsApp us at{" "}
            <Link href={`https://wa.me/${STORE_WHATSAPP}`} style={{ color: brand.accent }}>
              {STORE_PHONE}
            </Link>{" "}
            or write to{" "}
            <Link href={`mailto:${STORE_EMAIL}`} style={{ color: brand.accent }}>
              {STORE_EMAIL}
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const h1 = { fontFamily: brand.serif, fontSize: 26, fontWeight: 500, lineHeight: "32px", margin: "0 0 8px" };
export const h2 = { fontFamily: brand.serif, fontSize: 20, fontWeight: 500, margin: "24px 0 8px" };
export const p = { fontSize: 15, lineHeight: "24px", margin: "0 0 12px" };
export const button = {
  backgroundColor: brand.accent,
  color: "#FFFFFF",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  padding: "14px 24px",
  textDecoration: "none",
  display: "inline-block",
};
