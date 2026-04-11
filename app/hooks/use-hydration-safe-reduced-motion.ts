"use client";

import * as React from "react";

/**
 * Same contract as before: returns true during SSR/first client paint so trees match,
 * then follows prefers-reduced-motion. Uses matchMedia instead of Framer Motion's
 * useReducedMotion to avoid Motion's console warning when reduced motion is enabled.
 */
export function useHydrationSafeReducedMotion(): boolean {
    const [mounted, setMounted] = React.useState(false);
    const [prefersReduced, setPrefersReduced] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = (): void => setPrefersReduced(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    if (!mounted) {
        return true;
    }

    return prefersReduced;
}
