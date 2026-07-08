import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MenuSection from "./components/MenuSection";
import SpecialsSection from "./components/SpecialsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import OrderFormModal from "./components/OrderFormModal";

export default function Home() {
  return (
    <main id="home">
      <Navbar />
      <HeroSection />
      <MenuSection />
      <SpecialsSection />
      <CTASection />
      <Footer />
      <OrderFormModal />
    </main>
  );
}