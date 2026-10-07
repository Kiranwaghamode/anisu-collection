import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_DAYS, isValidSession, signSession } from "./session";

/** Constant-time password check (hashing first makes both sides the same length). */
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set");
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function startSession() {
  (await cookies()).set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return isValidSession((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Call at the top of every admin page and admin server action.
 * proxy.ts already redirects logged-out visitors, but actions can be called directly.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

// ── Login rate limit ────────────────────────────────────────────
// 5 failed attempts per 15 minutes per IP. Kept in memory: simple, and enough to
// stop password guessing on one server instance (each serverless instance has its own count).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const failures = new Map<string, { count: number; first: number }>();

export function loginBlockedFor(ip: string): number {
  const f = failures.get(ip);
  if (!f) return 0;
  const left = f.first + WINDOW_MS - Date.now();
  if (left <= 0) {
    failures.delete(ip);
    return 0;
  }
  return f.count >= MAX_ATTEMPTS ? left : 0;
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const f = failures.get(ip);
  if (!f || f.first + WINDOW_MS < now) failures.set(ip, { count: 1, first: now });
  else f.count++;
}

export function clearLoginFailures(ip: string) {
  failures.delete(ip);
}
