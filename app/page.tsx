import Hero from "./components/hero/hero";
import Stats from "./components/sections/stats";
import Marquee from "./components/sections/marquee";
import Experience from "./components/sections/experience";
import Projects from "./components/sections/projects";
import Skills from "./components/sections/skills";
import Achievements from "./components/sections/achievements";
import Testimonials from "./components/sections/testimonials";
import Blog from "./components/sections/blog";
import Contact from "./components/sections/contact";
import Footer from "./components/footer";

import FloatingSocials from "./components/floating-socials";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import ScrollSection from "./components/scroll-section";

export default function Home() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden relative bg-black" style={{ scrollbarGutter: 'stable' }}>
      <ScrollProgress />
      <FloatingSocials />
      
      <ScrollSection><Hero /></ScrollSection>
      <ScrollSection><Stats /></ScrollSection>
      <ScrollSection><Marquee /></ScrollSection>
      <ScrollSection><Experience /></ScrollSection>
      <ScrollSection><Projects /></ScrollSection>
      <ScrollSection><Skills /></ScrollSection>
      <ScrollSection><Achievements /></ScrollSection>
      <ScrollSection><Testimonials /></ScrollSection>
    
      <ScrollSection><Contact /></ScrollSection>
      
      <Footer />
    </main>
  );
}
