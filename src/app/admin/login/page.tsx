import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { STORE_NAME } from "@/config/store";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface p-6 md:p-8">
        <p className="font-heading text-3xl font-semibold">{STORE_NAME}</p>
        <h1 className="mt-1 font-sans text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">Admin</h1>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
