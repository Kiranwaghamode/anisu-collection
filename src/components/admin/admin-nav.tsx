"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLinkIcon, LogOutIcon, PackageIcon, ShoppingBagIcon, TagsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_NAME } from "@/config/store";
import { logout } from "@/lib/actions/auth";

const LINKS = [
  { href: "/admin", label: "Orders", icon: ShoppingBagIcon, match: (p: string) => p === "/admin" || p.startsWith("/admin/orders") },
  { href: "/admin/products", label: "Products", icon: PackageIcon, match: (p: string) => p.startsWith("/admin/products") },
  { href: "/admin/categories", label: "Categories", icon: TagsIcon, match: (p: string) => p.startsWith("/admin/categories") },
];

/** Highlights the current section. Reads the URL, so render it inside <Suspense>. */
export function AdminNav() {
  return <AdminNavView pathname={usePathname()} />;
}

/** Phones: top bar with tabs. Desktop: sidebar. Without a pathname nothing is highlighted (Suspense fallback). */
export function AdminNavView({ pathname }: { pathname: string }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface pt-[env(safe-area-inset-top)] md:hidden">
        <div className="flex h-12 items-center justify-between px-4">
          <Link href="/admin" className="font-heading text-xl font-semibold">
            {STORE_NAME} <span className="font-sans text-xs font-medium text-muted-foreground uppercase">Admin</span>
          </Link>
          <form action={logout}>
            <button type="submit" className="-mr-2 flex size-11 items-center justify-center" aria-label="Log out">
              <LogOutIcon className="size-5" />
            </button>
          </form>
        </div>
        <nav aria-label="Admin" className="flex px-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center border-b-2 text-sm font-medium",
                l.match(pathname) ? "border-accent text-accent" : "border-transparent text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="sticky top-0 flex h-dvh flex-col p-4">
          <Link href="/admin" className="px-3 py-2 font-heading text-2xl font-semibold">
            {STORE_NAME}
          </Link>
          <p className="px-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Admin</p>
          <nav aria-label="Admin" className="mt-6 grid gap-1">
            {LINKS.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
                  match(pathname) ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4.5" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-1">
            <Link
              href="/"
              target="_blank"
              className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted"
            >
              <ExternalLinkIcon className="size-4.5" aria-hidden />
              View store
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted"
              >
                <LogOutIcon className="size-4.5" aria-hidden />
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
