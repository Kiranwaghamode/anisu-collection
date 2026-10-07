import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center md:py-32">
      <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-accent uppercase">Error 404</p>
      <h1 className="mt-3 text-[2.25rem] md:text-6xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        This page may have moved, or the product is no longer available.
      </p>
      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
        <Button asChild>
          <Link href="/sarees">Shop Sarees</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kurtis">Shop Kurtis</Link>
        </Button>
      </div>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
