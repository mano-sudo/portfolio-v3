"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@/app/hooks/useGSAP";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScrollSectionProps {
    children: React.ReactNode;
}

export default function ScrollSection({ children }: ScrollSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current || !contentRef.current) return;

        // One-shot reveal (no scrub): two fewer ScrollTriggers per section vs enter+exit scrub.
        gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 28 },
            {
                opacity: 1,
                y: 0,
                duration: 0.75,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 86%",
                    toggleActions: "play none none none",
                    once: true,
                    fastScrollEnd: true,
                    invalidateOnRefresh: true,
                },
            },
        );
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div ref={contentRef} className="w-full min-h-0">
                {children}
            </div>
        </div>
    );
}
