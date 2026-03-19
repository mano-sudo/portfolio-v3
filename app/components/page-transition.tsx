"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [playReveal, setPlayReveal] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);

  useLayoutEffect(() => {
    const persistedLock = window.sessionStorage.getItem("route-transition-lock") === "1";
    if (persistedLock) {
      setLockScroll(true);
      window.sessionStorage.removeItem("route-transition-lock");
    }

    const shouldReveal = window.sessionStorage.getItem("project-transition-reveal") === "1";
    if (!shouldReveal) {
      setPlayReveal(false);
      return;
    }

    window.sessionStorage.removeItem("project-transition-reveal");
    const shouldPlay = pathname.startsWith("/projects/");
    setPlayReveal(shouldPlay);
    if (shouldPlay) {
      setLockScroll(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!lockScroll) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.classList.add("route-transition-lock");
    document.body.classList.add("route-transition-lock");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.classList.remove("route-transition-lock");
      document.body.classList.remove("route-transition-lock");
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [lockScroll]);

  return (
    <>
      {playReveal && (
        <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ y: "0%", backgroundColor: "#0a0a0a" }}
            animate={{
              y: ["0%", "0%", "100%"],
              backgroundColor: ["#0a0a0a", "#070707", "#030303", "#000000", "#000000"],
            }}
            transition={{
              y: {
                duration: 0.95,
                times: [0, 0.32, 1],
                ease: [0.22, 1, 0.36, 1],
              },
              backgroundColor: {
                duration: 0.95,
                times: [0, 0.26, 0.54, 0.8, 1],
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            onAnimationComplete={() => {
              setPlayReveal(false);
              setLockScroll(false);
            }}
          />
        </div>
      )}
      {children}
    </>
  );
}
