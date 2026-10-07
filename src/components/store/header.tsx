"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { MenuIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STORE_NAME } from "@/config/store";
import { mainNav } from "@/config/nav";
import { selectCartCount, useCart } from "@/stores/cart";
import { MobileMenu } from "./mobile-menu";
import { SearchSheet } from "./search-sheet";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 4,
    () => false,
  );
}

// `useCart.persist` only exists in the browser (no localStorage during prerender).
const subscribeHydration = (cb: () => void) => useCart.persist?.onFinishHydration(cb) ?? (() => {});

function useCartCount() {
  const count = useCart(selectCartCount);
  // The cart lives in localStorage, so show nothing until it has loaded on the client.
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useCart.persist?.hasHydrated() ?? false,
    () => false,
  );
  return hydrated ? count : 0;
}

export function Header() {
  const scrolled = useScrolled();
  const count = useCartCount();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] transition-colors duration-300",
        scrolled ? "border-border bg-surface" : "border-transparent bg-background",
      )}
    >
      <div className="container-page grid h-(--header-h) grid-cols-[1fr_auto_1fr] items-center md:h-16 md:grid-cols-[auto_1fr_auto]">
        {/* Mobile: menu + search on the left */}
        <div className="-ml-3 flex items-center md:hidden">
          <MobileMenu>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <MenuIcon />
            </Button>
          </MobileMenu>
          <SearchSheet>
            <Button variant="ghost" size="icon" aria-label="Search">
              <SearchIcon />
            </Button>
          </SearchSheet>
        </div>

        <Link
          href="/"
          className="flex min-h-11 items-center justify-self-center font-heading text-[1.6rem] leading-none font-semibold tracking-tight whitespace-nowrap md:justify-self-start md:text-3xl"
        >
          {STORE_NAME}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 pl-14 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm font-medium tracking-wide text-foreground/80 uppercase transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="-mr-3 flex items-center justify-end">
          <SearchSheet>
            <Button variant="ghost" size="icon" aria-label="Search" className="hidden md:inline-flex">
              <SearchIcon />
            </Button>
          </SearchSheet>
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart" aria-label={count ? `Cart, ${count} items` : "Cart"}>
              <ShoppingBagIcon />
              {count > 0 && (
                <span className="absolute top-1.5 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] leading-4.5 font-semibold text-accent-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
