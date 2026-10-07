import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { NotFoundContent } from "@/components/store/not-found-content";

// Unmatched URLs render outside the (store) layout, so add the header and footer here.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
