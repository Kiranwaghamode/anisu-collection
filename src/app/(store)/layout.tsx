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
    </>
  );
}
