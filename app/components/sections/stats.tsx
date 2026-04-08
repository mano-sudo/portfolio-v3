"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const techStacks = [
    {
        label: "Frontend",
        items: ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"],
        iconDir: "/images/frontend",
    },
    {
        label: "Backend",
        items: ["Node.js", "Laravel", "PHP"],
        iconDir: "/images/backend",
    },
    {
        label: "Database",
        items: ["MySQL", "PostgresSQL", "MongoDB"],
        iconDir: "/images/database",
    },
    {
        label: "Tools",
        items: ["Git", "Docker"],
        iconDir: "/images/tools",
    },
];

export default function Stats() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const root = sectionRef.current;
            if (!root) return;

            const leftPanel = root.querySelector<HTMLElement>(".stats-panel-left");
            const rightPanel = root.querySelector<HTMLElement>(".stats-panel-right");

            const statsItems = gsap.utils.toArray<HTMLElement>(".stats-anim", root);
            const techItems = gsap.utils.toArray<HTMLElement>(".tech-anim", root);

            const panels: HTMLElement[] = [leftPanel, rightPanel].filter((el): el is HTMLElement => !!el);
            const allItems: HTMLElement[] = [...statsItems, ...techItems];

            // Initial state: hidden + shifted down (prevents "static hidden" caused by competing triggers).
            gsap.set(panels, { autoAlpha: 0, y: 40, willChange: "transform,opacity" });
            gsap.set(allItems, { autoAlpha: 0, y: 26, willChange: "transform,opacity" });

            // Panels reveal once; the content inside reveals one-by-one as you scroll.
            const tlPanelsIn = gsap.timeline({ paused: true });
            tlPanelsIn.to(panels, {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out",
                stagger: 0.1,
            });

            ScrollTrigger.create({
                trigger: root,
                start: "top 78%",
                end: "bottom 22%",
                onEnter: () => {
                    tlPanelsIn.play(0);
                },
                onEnterBack: () => {
                    tlPanelsIn.play(0);
                },
                onRefresh: (self) => {
                    // If the page loads while already inside/past the section,
                    // ensure content isn't stuck in the initial hidden state.
                    if (self.progress > 0) {
                        tlPanelsIn.progress(1);
                    } else {
                        tlPanelsIn.pause(0).progress(0);
                    }
                },
            });

            const revealOneByOne = (el: HTMLElement, yFrom: number) => {
                // Scrubbed animation = smooth show/hide while scrolling (no "static jump").
                gsap.fromTo(
                    el,
                    { autoAlpha: 0, y: yFrom },
                    {
                        autoAlpha: 1,
                        y: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 88%",
                            end: "top 70%",
                            scrub: 0.8,
                            invalidateOnRefresh: true,
                        },
                    },
                );
            };

            // About-side copy reveals line-by-line.
            statsItems.forEach((el) => revealOneByOne(el, 22));

            // Tech icons reveal one-by-one; fall out when scrolling up past them.
            techItems.forEach((el) => revealOneByOne(el, 26));
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative bg-[#f4f3ee] py-16 sm:py-20 lg:py-28 overflow-hidden border-t border-black/10">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-44 max-w-[1920px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-10 md:gap-14 lg:gap-16 items-start">
                    {/* Left — About */}
                    <div className="stats-panel-left w-full lg:w-5/12 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="stats-anim text-[10px] sm:text-xs uppercase tracking-[0.35em] text-black/55 font-mono">
                                About
                            </span>
                            <div className="h-px flex-1 bg-black/10" />
                        </div>

                        <h2 className="stats-anim text-[clamp(2rem,5vw,5rem)] font-black uppercase leading-[0.95] text-black tracking-tight">
                            About
                        </h2>
                        <p className="stats-anim text-base sm:text-lg text-black/70 leading-relaxed max-w-lg">
                            Full-Stack Developer with a BS in Information Technology, experienced in building scalable web
                            applications using React, TypeScript, Next.js, Laravel, and Node.js. Skilled in RESTful APIs,
                            MySQL, and responsive user interfaces.
                        </p>
                        <p className="stats-anim text-sm sm:text-base text-black/55 leading-relaxed max-w-lg">
                            Led mobile development for an award-winning real-time flood monitoring system (Best Research
                            Paper 2025). Experienced in full-stack development for enterprise and healthcare applications,
                            building dashboards, analytics, and role-based systems.
                        </p>
                        <p className="stats-anim text-sm sm:text-base text-black/55 leading-relaxed max-w-lg">
                            Passionate about clean code, problem-solving, and collaboration, with a focus on delivering
                            high-performance, user-centered applications.
                        </p>
                    </div>

                    {/* Right — Tech Stacks */}
                    <div className="stats-panel-right w-full lg:w-7/12 lg:self-center">
                        <div className="grid gap-8 sm:gap-10 md:gap-12">
                            {techStacks.map((group) => (
                                <div key={group.label} className="grid grid-cols-12 items-start sm:items-center gap-5 sm:gap-6 md:gap-8">
                                    <div className="col-span-12 sm:col-span-4">
                                        <div className="stats-anim text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-black/45 leading-none">
                                            {group.label}
                                        </div>
                                    </div>

                                    <div className="col-span-12 sm:col-span-8">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                                            {group.items.map((item) => (
                                                <div
                                                    key={item}
                                                    className="tech-anim flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3 min-w-0"
                                                    title={item}
                                                >
                                                    <Image
                                                        src={`${group.iconDir}/${item}.svg`}
                                                        alt={item}
                                                        width={40}
                                                        height={40}
                                                        sizes="(max-width: 640px) 28px, (max-width: 1024px) 32px, 40px"
                                                        className="opacity-100 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 shrink-0"
                                                    />
                                                    <span className="text-[11px] sm:text-xs md:text-sm font-mono uppercase tracking-wider text-black/60 whitespace-nowrap">
                                                        {item}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
