import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { InsideCard } from "@/components/InsideCard";
import { Built } from "@/components/Built";
import { HowItWorks } from "@/components/HowItWorks";
import { Install } from "@/components/Install";
import { Personas } from "@/components/Personas";
import { Accuracy } from "@/components/Accuracy";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <InsideCard />
        <Built />
        <HowItWorks />
        <Install />
        <Personas />
        <Accuracy />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
