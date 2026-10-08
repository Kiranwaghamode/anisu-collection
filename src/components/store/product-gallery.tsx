"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Index of the slide currently snapped into view. */
function slideIndex(el: HTMLElement) {
  return Math.round(el.scrollLeft / el.clientWidth);
}

function scrollToSlide(el: HTMLElement | null, i: number, smooth = true) {
  el?.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "instant" });
}

function Dots({ count, active }: { count: number; active: number }) {
  if (count < 2) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full bg-white shadow-sm shadow-black/30 transition-all duration-300",
            i === active ? "w-5" : "w-1.5 opacity-60",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Phones: edge-to-edge swipe gallery with dots. Desktop: thumbnails on the left.
 * Tapping an image opens a fullscreen viewer (tap to zoom, pinch works natively).
 */
export function ProductGallery({
  images,
  name,
  alt = name,
}: {
  images: string[];
  name: string;
  /** Describes the main photo (name, colour, fabric). */
  alt?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoomAt, setZoomAt] = useState<number | null>(null);

  return (
    <div className="md:grid md:grid-cols-[4.5rem_1fr] md:gap-4 lg:grid-cols-[5.5rem_1fr]">
      {images.length > 1 && (
        <ul className="hidden flex-col gap-3 md:flex" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => scrollToSlide(trackRef.current, i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block aspect-4/5 w-full overflow-hidden rounded-sm border-2 transition-colors",
                  i === active ? "border-accent" : "border-transparent hover:border-border",
                )}
              >
                <Image src={src} alt="" fill sizes="88px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={cn("relative", images.length < 2 && "md:col-span-2")}>
        <div
          ref={trackRef}
          onScroll={(e) => setActive(slideIndex(e.currentTarget))}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-muted md:rounded-md"
          aria-roledescription="carousel"
          aria-label={`${name} images`}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setZoomAt(i)}
              aria-label={`Zoom image ${i + 1} of ${images.length}`}
              className="relative aspect-4/5 w-full shrink-0 snap-center cursor-zoom-in"
            >
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt}, view ${i + 1}`}
                fill
                // Rendered inside a Suspense boundary, so a <head> preload would arrive too late.
                loading={i === 0 ? "eager" : undefined}
                fetchPriority={i === 0 ? "high" : undefined}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <div className="md:hidden">
          <Dots count={images.length} active={active} />
        </div>
      </div>

      <ZoomViewer
        images={images}
        name={name}
        startAt={zoomAt}
        onClose={(lastIndex) => {
          setZoomAt(null);
          // Keep the page gallery on whatever image was last viewed fullscreen.
          scrollToSlide(trackRef.current, lastIndex, false);
        }}
      />
    </div>
  );
}

function ZoomViewer({
  images,
  name,
  startAt,
  onClose,
}: {
  images: string[];
  name: string;
  startAt: number | null;
  onClose: (lastIndex: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  // Jump to the tapped image when the viewer opens (stable per startAt, so swiping isn't reset).
  const attachTrack = useCallback(
    (el: HTMLDivElement | null) => {
      trackRef.current = el;
      if (el && startAt !== null) {
        scrollToSlide(el, startAt, false);
        setActive(startAt);
      }
    },
    [startAt],
  );

  return (
    <Dialog
      open={startAt !== null}
      onOpenChange={(open) => {
        if (!open) onClose(trackRef.current ? slideIndex(trackRef.current) : 0);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 block h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none bg-surface p-0 ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">Tap an image to zoom in. Swipe to see more.</DialogDescription>
        <div
          ref={attachTrack}
          onScroll={(e) => setActive(slideIndex(e.currentTarget))}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, i) => (
            <ZoomSlide key={src} src={src} alt={`${name}, image ${i + 1}`} />
          ))}
        </div>
        <Dots count={images.length} active={active} />
        <DialogClose
          className="absolute top-[calc(0.75rem+env(safe-area-inset-top,0px))] right-3 flex size-11 items-center justify-center rounded-full bg-surface/90 shadow-md"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

/** Tap toggles 2.5× zoom centred on the tap point; drag/scroll to pan. */
function ZoomSlide({ src, alt }: { src: string; alt: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const SCALE = 2.5;

  function toggle(e: React.MouseEvent<HTMLDivElement>) {
    const box = boxRef.current;
    if (!box) return;
    if (zoomed) {
      setZoomed(false);
      return;
    }
    const rect = box.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    setZoomed(true);
    // After the zoomed layout applies, centre the tapped point.
    requestAnimationFrame(() => {
      box.scrollTo({
        left: fx * box.scrollWidth - rect.width / 2,
        top: fy * box.scrollHeight - rect.height / 2,
      });
    });
  }

  return (
    <div
      ref={boxRef}
      onClick={toggle}
      className={cn(
        "no-scrollbar relative h-full w-full shrink-0 snap-center",
        zoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in overflow-hidden",
      )}
    >
      <div
        className="relative"
        style={{ width: zoomed ? `${SCALE * 100}%` : "100%", height: zoomed ? `${SCALE * 100}%` : "100%" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={zoomed ? "250vw" : "100vw"}
          className="object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}
