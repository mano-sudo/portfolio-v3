"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Framer Motion's useReducedMotion reads matchMedia, which is unavailable during
 * SSR and can disagree with the first client render. Until mount, this returns
 * true so server HTML matches the initial client tree; after mount it follows
 * the system preference.
 */
export function useHydrationSafeReducedMotion(): boolean {
    const prefersReduced = useReducedMotion();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return true;
    }

    return Boolean(prefersReduced);
}
