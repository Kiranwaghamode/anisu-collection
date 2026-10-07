import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/store/cart-drawer";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { WhatsAppButton } from "@/components/store/whatsapp-button";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
      {/* Top on phones so toasts never cover the sticky bottom bars */}
      <Toaster position="top-center" theme="light" offset={{ top: 72 }} mobileOffset={{ top: 64 }} />
    </>
  );
}
