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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <ScrollProgress />
      <FloatingSocials />
      
      <ScrollSection>
        <Hero />
      </ScrollSection>
      <div className="-mt-8 sm:-mt-10 md:-mt-14 lg:mt-0">
        <ScrollSection>
          <Marquee />
        </ScrollSection>
      </div>
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
