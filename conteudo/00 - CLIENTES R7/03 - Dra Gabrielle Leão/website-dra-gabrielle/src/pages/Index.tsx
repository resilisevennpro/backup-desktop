import { useReveal } from "@/hooks/useReveal";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Services } from "@/components/site/Services";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { Clareamento } from "@/components/site/Clareamento";
import { RecontornoEstetico } from "@/components/site/RecontornoEstetico";
import { HowItWorks } from "@/components/site/HowItWorks";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { InstagramFeed } from "@/components/site/InstagramFeed";
import { BookingCTA } from "@/components/site/BookingCTA";
import { Footer } from "@/components/site/Footer";
import { useEffect } from "react";

const Index = () => {
  useReveal();

  useEffect(() => {
    document.title = "Dra. Gabrielle Leão | Lentes em Resina e Estética Dental em Brasília";
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    (meta as HTMLMetaElement).content = "Especialista em lentes em resina, facetas e clareamento em Brasília-DF. Transforme seu sorriso com a Dra. Gabrielle Leão. +500 sorrisos transformados.";
  }, []);

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <BeforeAfter />
      <Clareamento />
      <RecontornoEstetico />
      <HowItWorks />
      <About />
      <Testimonials />
      <InstagramFeed />
      <BookingCTA />
      <Footer />
    </main>
  );
};

export default Index;
