import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/money";

// Temporary Phase 1 page for reviewing fonts, colours and controls.
// Replaced by the real home page in Phase 2.
export default function Home() {
  return (
    <div className="container-page py-10 md:py-16">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Phase 1 · Design preview</p>
      <h1 className="mt-3 text-[2.1rem] md:text-6xl">Draped in timeless elegance</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        Handpicked silk and cotton sarees and kurtis. This page only exists to review the design system; the real home
        page arrives in Phase 2.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
        <Button>Shop Sarees</Button>
        <Button variant="outline">Shop Kurtis</Button>
      </div>

      <h2 className="mt-12 text-2xl md:text-4xl">Colours</h2>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
        {[
          ["background", "bg-background", "#FAF7F2"],
          ["surface", "bg-surface", "#FFFFFF"],
          ["foreground", "bg-foreground", "#1F1F1F"],
          ["muted", "bg-muted-foreground", "#6B6B6B"],
          ["border", "bg-border", "#E8E2D9"],
          ["accent", "bg-accent", "#7A1E2C"],
        ].map(([name, cls, hex]) => (
          <div key={name}>
            <div className={`aspect-square rounded-md border border-border ${cls}`} />
            <p className="mt-1.5 text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{hex}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl md:text-4xl">Typography &amp; prices</h2>
      <p className="mt-3 font-heading text-3xl">Cormorant Garamond — headings</p>
      <p className="mt-1">Inter — body, prices and UI. 16px minimum.</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-lg font-semibold">{formatINR(349900)}</span>
        <span className="text-muted-foreground line-through">{formatINR(449900)}</span>
        <span className="text-sm font-semibold text-accent">22% off</span>
      </p>

      <h2 className="mt-12 text-2xl md:text-4xl">Form controls</h2>
      <div className="mt-4 grid max-w-md gap-2">
        <Label htmlFor="demo-phone">Mobile number</Label>
        <Input id="demo-phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" />
      </div>
    </div>
  );
}
