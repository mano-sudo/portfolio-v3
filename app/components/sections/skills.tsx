"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame
} from 'motion/react';
import '@/components/ScrollVelocity.css';

// All tech stack logos/names - combine into continuous string
const techStackString = "React • Next.js • TypeScript • JavaScript • Node.js • Express.js • Python • PostgreSQL • MongoDB • Tailwind CSS • GSAP • Three.js • Git • Docker • AWS • GraphQL • Redis • HTML5 • CSS3 • Laravel • PHP • MySQL • ";

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (): void => {
      setWidth(el.offsetWidth);
    };
    apply();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => apply());
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", apply, { passive: true });
    return () => window.removeEventListener("resize", apply);
  }, [ref]);

  return width;
}

function VelocityText({
  children,
  baseVelocity = 50,
  isMobile = false,
  paused = false,
}: {
  children: React.ReactNode;
  baseVelocity?: number;
  isMobile?: boolean;
  paused?: boolean;
}) {
  const baseX = useMotionValue(0);
  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  function wrap(min: number, max: number, v: number): number {
    if (max === min) return 0;
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  useAnimationFrame((t, delta) => {
    if (paused || copyWidth === 0) return;
    const moveBy = baseVelocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  const spans = [];
  // Use fewer copies on mobile for better performance
  const numCopies = isMobile ? 4 : 6;
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <span key={i} ref={i === 0 ? copyRef : null} className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-black/20 hover:text-black/40 transition-colors duration-300 uppercase tracking-tighter italic whitespace-nowrap shrink-0">
        {children}
      </span>
    );
  }

  return (
    <div className="parallax overflow-hidden w-full">
      <motion.div 
        className="scroller" 
        style={{ 
          x, 
          display: "flex", 
          gap: "clamp(1rem, 3vw, 3rem)", 
          paddingLeft: "clamp(0.75rem, 2vw, 1.5rem)", 
          paddingRight: "clamp(0.75rem, 2vw, 1.5rem)", 
          willChange: "transform",
          width: "max-content"
        }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

export default function Skills() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isMobile, setIsMobile] = React.useState(false);
    const [marqueeActive, setMarqueeActive] = React.useState(true);

    React.useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = (): void => setIsMobile(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    React.useEffect(() => {
        const el = sectionRef.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            setMarqueeActive(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                setMarqueeActive(entry.isIntersecting);
            },
            { root: null, rootMargin: "100px 0px", threshold: 0 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="skills-section relative bg-background overflow-hidden py-8 sm:py-12 md:py-16 lg:py-24">
            {/* Gradient overlays for fade effect - smaller on mobile */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-16 md:w-24 lg:w-32 bg-linear-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 sm:w-16 md:w-24 lg:w-32 bg-linear-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

            <div className="relative z-10 overflow-hidden space-y-4 sm:space-y-6 md:space-y-8">
                {/* First row - scrolling left */}
                <VelocityText
                    baseVelocity={isMobile ? 60 : 80}
                    isMobile={isMobile}
                    paused={!marqueeActive}
                >
                    {techStackString}
                </VelocityText>

                {/* Second row - scrolling right (opposite direction) */}
                <VelocityText
                    baseVelocity={isMobile ? -60 : -80}
                    isMobile={isMobile}
                    paused={!marqueeActive}
                >
                    {techStackString}
                </VelocityText>
            </div>
        </section>
    );
}

    