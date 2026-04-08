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

        // Lightweight entrance animation (transform + opacity only).
        gsap.fromTo(contentRef.current, 
            { 
                opacity: 0,
                y: 36,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "top center",
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                }
            }
        );

        // Lightweight exit animation to keep transitions smooth.
        gsap.to(contentRef.current, {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "bottom bottom",
                end: "bottom top",
                scrub: 0.6,
                invalidateOnRefresh: true,
            },
            opacity: 0.2,
            y: -20,
            ease: "none"
        });
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div ref={contentRef} className="w-full h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
