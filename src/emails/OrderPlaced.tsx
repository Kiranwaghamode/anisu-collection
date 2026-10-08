import { Button, Column, Img, Row, Section, Text } from "@react-email/components";
import { SAREE_SIZE } from "@/config/store";
import { formatINR } from "@/lib/money";
import { EmailLayout, brand, button, h1, h2, p } from "./layout";

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  paymentMethod: "COD" | "PREPAID";
  subtotal: number;
  shippingFee: number;
  codFee: number;
  total: number;
  address: string[];
  items: { productName: string; size: string; image: string; unitPrice: number; quantity: number }[];
  /** link to the order/track page */
  orderUrl: string;
};

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Row>
      <Column style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 400, color: bold ? brand.text : brand.muted, padding: "3px 0" }}>
        {label}
      </Column>
      <Column align="right" style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 400, padding: "3px 0" }}>
        {value}
      </Column>
    </Row>
  );
}

export default function OrderPlaced(o: OrderEmailData) {
  const first = o.customerName.split(" ")[0];
  return (
    <EmailLayout preview={`Your order ${o.orderNumber} is placed`}>
      <Text style={h1}>Thank you, {first}!</Text>
      <Text style={p}>
        Your order <strong>{o.orderNumber}</strong> is placed.{" "}
        {o.paymentMethod === "COD"
          ? "We'll call you shortly to confirm it, then pack it with care."
          : "We've received your payment and will pack it with care."}
      </Text>

      <Text style={h2}>Items</Text>
      {o.items.map((item, i) => (
        <Row key={i} style={{ borderBottom: `1px solid ${brand.border}`, padding: "10px 0" }}>
          <Column style={{ width: 64, verticalAlign: "top" }}>
            {item.image && (
              <Img src={item.image} alt="" width="56" height="70" style={{ borderRadius: 4, objectFit: "cover" }} />
            )}
          </Column>
          <Column style={{ verticalAlign: "top", fontSize: 14, lineHeight: "20px" }}>
            {item.productName}
            <br />
            <span style={{ color: brand.muted }}>
              {item.size !== SAREE_SIZE && `Size ${item.size} · `}Qty {item.quantity}
            </span>
          </Column>
          <Column align="right" style={{ verticalAlign: "top", fontSize: 14, whiteSpace: "nowrap" }}>
            {formatINR(item.unitPrice * item.quantity)}
          </Column>
        </Row>
      ))}

      <Section style={{ marginTop: 12 }}>
        <Line label="Subtotal" value={formatINR(o.subtotal)} />
        <Line label="Shipping" value={o.shippingFee === 0 ? "Free" : formatINR(o.shippingFee)} />
        {o.codFee > 0 && <Line label="Cash on Delivery fee" value={formatINR(o.codFee)} />}
        <Line label="Total" value={formatINR(o.total)} bold />
      </Section>

      <Text style={h2}>Payment</Text>
      <Text style={p}>
        {o.paymentMethod === "COD"
          ? `Cash on Delivery. Please keep ${formatINR(o.total)} ready when your parcel arrives.`
          : "Paid online."}
      </Text>

      <Text style={h2}>Delivery address</Text>
      <Text style={p}>
        {o.address.map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </Text>

      <Section style={{ textAlign: "center", marginTop: 20 }}>
        <Button href={o.orderUrl} style={button}>
          Track your order
        </Button>
      </Section>
    </EmailLayout>
  );
}

OrderPlaced.PreviewProps = {
  orderNumber: "AC1001",
  customerName: "Priya Sharma",
  paymentMethod: "COD",
  subtotal: 349800,
  shippingFee: 0,
  codFee: 4900,
  total: 354700,
  address: ["Priya Sharma", "Flat 4B, Lotus Apartments, FC Road", "Pune, Maharashtra 411004", "9876543210"],
  items: [
    { productName: "Banarasi Silk Saree – Royal Purple", size: "Free Size", image: "", unitPrice: 349800, quantity: 1 },
  ],
  orderUrl: "http://localhost:3000/track",
} satisfies OrderEmailData;
