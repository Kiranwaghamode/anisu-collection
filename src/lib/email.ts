import "server-only";
import { render, toPlainText } from "@react-email/render";
import { Resend } from "resend";
import { STORE_EMAIL } from "@/config/store";

/**
 * Send an email with Resend. Returns false (and logs) instead of throwing, so an
 * email outage can never break checkout or an admin action.
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[email] RESEND_API_KEY / EMAIL_FROM not set; "${subject}" to ${to} skipped`);
    return false;
  }
  try {
    const html = await render(react);
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject,
      html,
      text: toPlainText(html),
      replyTo: STORE_EMAIL,
    });
    if (error) {
      console.error("[email] send failed", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}
