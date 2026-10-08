/**
 * Dev helper: renders the order emails for an existing order,
 * without sending anything. Run with:
 *   npx tsx scripts/preview-notifications.tsx AC1001 [out-dir]
 * Writes order-placed.html and order-shipped.html to out-dir (default: ./.previews).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { render } from "@react-email/render";
import OrderPlaced from "../src/emails/OrderPlaced";
import OrderShipped from "../src/emails/OrderShipped";
import { PrismaClient } from "../src/generated/prisma/client";
import { orderEmailData } from "../src/lib/notify-format";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const [orderNumber, outDir = ".previews"] = process.argv.slice(2);
  if (!orderNumber) throw new Error("Usage: preview-notifications.tsx <orderNumber> [out-dir]");
  const o = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!o) throw new Error(`Order ${orderNumber} not found`);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "order-placed.html"), await render(OrderPlaced(orderEmailData(o))));
  fs.writeFileSync(
    path.join(outDir, "order-shipped.html"),
    await render(
      OrderShipped({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        courierName: o.courierName ?? "Delhivery",
        awbCode: o.awbCode ?? "1234567890123",
        trackingUrl: o.trackingUrl,
        orderUrl: orderEmailData(o).orderUrl,
      }),
    ),
  );
  console.log(`Wrote previews for ${orderNumber} to ${outDir}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
