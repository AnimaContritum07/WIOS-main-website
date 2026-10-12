import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import AboutVitAp from "@/components/landing/AboutVitAp";
import AboutWios from "@/components/landing/AboutWios";
import EventsSection from "@/components/landing/EventsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AboutVitAp />
      <AboutWios />
      <EventsSection />
    </>
  );
}
