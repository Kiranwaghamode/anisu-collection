import Form from "next/form";
import { SearchIcon } from "lucide-react";

export function SearchBox({
  defaultValue,
  autoFocus,
  onSubmit,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
}) {
  return (
    <Form action="/search" role="search" className="relative" onSubmit={onSubmit}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search sarees, kurtis, silk, red…"
        aria-label="Search products"
        enterKeyHint="search"
        autoComplete="off"
        className="h-12 w-full rounded-md border border-border bg-surface pr-4 pl-12 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      />
    </Form>
  );
}
