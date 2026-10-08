import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, brand, button, h1, p } from "./layout";

export type ShippedEmailData = {
  orderNumber: string;
  customerName: string;
  courierName: string | null;
  awbCode: string | null;
  trackingUrl: string | null;
  /** our own track page, used when the courier gave no tracking link */
  orderUrl: string;
};

export default function OrderShipped(o: ShippedEmailData) {
  const first = o.customerName.split(" ")[0];
  return (
    <EmailLayout preview={`Your order ${o.orderNumber} is on its way`}>
      <Text style={h1}>Good news, {first}!</Text>
      <Text style={p}>
        Your order <strong>{o.orderNumber}</strong> has been shipped and is on its way to you.
      </Text>

      <Section style={{ backgroundColor: brand.bg, borderRadius: 6, padding: "12px 16px", margin: "16px 0" }}>
        {o.courierName && (
          <Text style={{ ...p, margin: "0 0 4px" }}>
            <span style={{ color: brand.muted }}>Courier: </span>
            <strong>{o.courierName}</strong>
          </Text>
        )}
        {o.awbCode && (
          <Text style={{ ...p, margin: 0 }}>
            <span style={{ color: brand.muted }}>Tracking number: </span>
            <strong>{o.awbCode}</strong>
          </Text>
        )}
      </Section>

      <Section style={{ textAlign: "center", marginTop: 20 }}>
        <Button href={o.trackingUrl || o.orderUrl} style={button}>
          Track your parcel
        </Button>
      </Section>
    </EmailLayout>
  );
}

OrderShipped.PreviewProps = {
  orderNumber: "AC1001",
  customerName: "Priya Sharma",
  courierName: "Delhivery",
  awbCode: "1234567890123",
  trackingUrl: "https://www.delhivery.com/track/package/1234567890123",
  orderUrl: "http://localhost:3000/track",
} satisfies ShippedEmailData;
