"use client";

import Lenis from "@studio-freight/lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { logProjectsScroll } from "@/app/utils/projects-scroll-debug";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type LenisInstance = InstanceType<typeof Lenis>;

type WindowWithLenis = Window & { lenis?: LenisInstance };

function getWindowWithLenis(): WindowWithLenis {
  return window as WindowWithLenis;
}

/**
 * Lenis + touch after client-side navigations breaks scrolling on many mobile browsers.
 * Disable Lenis for coarse pointers and for touch-capable narrow viewports (iOS often reports "fine" pointer).
 */
function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
    return false;
  }
  if (
    navigator.maxTouchPoints > 0 &&
    window.matchMedia("(max-width: 1024px)").matches
  ) {
    return false;
  }
  return true;
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.setProperty("scrollbar-width", "none");
    document.documentElement.style.setProperty("-ms-overflow-style", "none");
    document.body.style.overflowY = "auto";
    document.body.style.setProperty("scrollbar-width", "none");
    document.body.style.setProperty("-ms-overflow-style", "none");

    const useLenis = shouldUseLenis() && pathname !== "/projects";

    if (!useLenis) {
      return () => {
        document.documentElement.style.overflowY = "";
        document.body.style.overflowY = "";
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    getWindowWithLenis().lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let rafId: number | null = null;

    const raf = (time: number): void => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    const handleResize = (): void => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    const refreshId = window.setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      window.clearTimeout(refreshId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
      delete getWindowWithLenis().lenis;
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
      ScrollTrigger.refresh();
    };
  }, [pathname]);

  useEffect(() => {
    const win = getWindowWithLenis();
    const lenis = win.lenis;
    logProjectsScroll("SmoothScroll pathname change", {
      pathname,
      lenisInstance: Boolean(lenis),
      shouldUseLenis: shouldUseLenis(),
      nativeScrollOnProjectsList: pathname === "/projects",
    });
    if (!lenis) return;

    const id = window.requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return children;
}


