import { Navbar } from "@/components/Navbar";
import { FeaturesSection } from "@/components/feature-section";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";


export default function Home() {
  return (
    <main className="flex flex-col ">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </main>
  )
}