import Hero from "./components/hero/hero";
import Stats from "./components/sections/stats";
import Marquee from "./components/sections/marquee";
import Footer from "./components/footer";
import dynamic from "next/dynamic";

import FloatingSocials from "./components/floating-socials";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import ScrollSection from "./components/scroll-section";

const Projects = dynamic(() => import("./components/sections/projects"));
const Skills = dynamic(() => import("./components/sections/skills"));
const Achievements = dynamic(() => import("./components/sections/achievements"));
const Testimonials = dynamic(() => import("./components/sections/testimonials"));
const Contact = dynamic(() => import("./components/sections/contact"));

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden bg-black"
      style={{ scrollbarGutter: "stable" }}
    >
      <ScrollProgress />
      <FloatingSocials />
      
      <ScrollSection>
        <Hero />
      </ScrollSection>
      <ScrollSection>
        <Marquee />
      </ScrollSection>
      <ScrollSection>
        <Stats />
      </ScrollSection>
      
      {/* <ScrollSection><Experience /></ScrollSection> */}
      <ScrollSection>
        <Projects />
      </ScrollSection>
      <ScrollSection>
        <Skills />
      </ScrollSection>
      <ScrollSection>
        <Achievements />
      </ScrollSection>
      <ScrollSection>
        <Testimonials />
      </ScrollSection>
    
      <ScrollSection>
        <Contact />
      </ScrollSection>
      
      <Footer />
    </main>
  );
}
