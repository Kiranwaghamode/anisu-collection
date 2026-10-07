import { STORE_WHATSAPP } from "@/config/store";
import { WhatsAppIcon } from "./brand-icons";

/**
 * Floating WhatsApp button. Pages with a sticky bottom bar set
 * `--sticky-bar-h` on a wrapper (or :root) so the button floats above it.
 */
export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${STORE_WHATSAPP}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 z-30 flex size-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-transform active:scale-95 md:right-6 md:size-14"
      style={{
        bottom: "calc(1rem + var(--sticky-bar-h, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
