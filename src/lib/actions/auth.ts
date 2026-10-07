"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearLoginFailures,
  endSession,
  loginBlockedFor,
  passwordMatches,
  recordLoginFailure,
  startSession,
} from "@/lib/auth";

export type LoginState = { error?: string };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp();
  const blocked = loginBlockedFor(ip);
  if (blocked > 0) {
    return { error: `Too many attempts. Try again in ${Math.ceil(blocked / 60000)} minutes.` };
  }

  const password = String(formData.get("password") ?? "");
  if (!password || !passwordMatches(password)) {
    recordLoginFailure(ip);
    return { error: "Wrong password." };
  }

  clearLoginFailures(ip);
  await startSession();
  const next = String(formData.get("next") ?? "");
  // Only ever send people back into the admin, never to another site.
  redirect(next.startsWith("/admin/") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
