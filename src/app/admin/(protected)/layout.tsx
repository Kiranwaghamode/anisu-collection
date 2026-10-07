import { Suspense } from "react";
import { AdminNav, AdminNavView } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Suspense fallback={<AdminNavView pathname="" />}>
        <AdminNav />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 pt-5 pb-28 md:px-8 md:pt-8">{children}</main>
    </div>
  );
}
