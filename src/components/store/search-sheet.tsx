"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchBox } from "./search-box";

export function SearchSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="top" className="gap-0 px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-5 md:px-8">
        <SheetTitle className="mb-3 pr-12 text-2xl font-semibold">Search</SheetTitle>
        <SheetDescription className="sr-only">Search by name, fabric, colour or category</SheetDescription>
        <div className="mx-auto w-full max-w-2xl">
          <SearchBox autoFocus onSubmit={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
