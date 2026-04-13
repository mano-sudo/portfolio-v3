"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code, Trophy, Zap } from "lucide-react";
import { useRef } from "react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const achievements = [
    {
        icon: Trophy,
        title: "Best Research Paper Award",
        description: "Won 'Best Research Paper' at Synergy 2025 Conference for Water Quality Monitoring System",
        year: "2025",
        category: "Recognition"
    },
    {
        icon: Code,
        title: "Production Deliveries",
        description: "Delivered multiple production projects within 6 months, contributing to real-world systems and dashboards",
        year: "2025",
        category: "Milestone"
    },
    {
        icon: Code,
        title: "Production Code Contributions",
        description: "Actively contributing to enterprise-grade solutions using Laravel, Next.js, and modern full-stack architectures",
        year: "2025",
        category: "Technical"
    },
    {
        icon: Zap,
        title: "IoT & ML Innovation",
        description: "Developed advanced Water Quality Monitoring System with 95% data accuracy using IoT and Machine Learning",
        year: "2024",
        category: "Innovation"
    }
];

export default function Achievements() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        const isDesktop = window.innerWidth >= 1024;

        // Header entrance
        if (isDesktop) {
            gsap.from(".achievements-header", {
                y: 50,
                opacity: 0,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "top 50%",
                    scrub: 1,
                }
            });
        }

        // Desktop: subtle reveal per card
        if (isDesktop) {
            // Animate each card on scroll
            achievements.forEach((_, i) => {
                gsap.from(`.achievement-card-${i}`, {
                    scrollTrigger: {
                        trigger: `.achievement-card-${i}`,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1,
                    },
                    x: 100,
                    opacity: 0,
                    scale: 0.9,
                    duration: 1,
                    ease: "power2.out"
                });
            });
        }

        // Mobile: Simple fade animations
        if (!isDesktop) {
            gsap.from(".achievement-card", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                },
                opacity: 0,
                y: 30,
                duration: 0.6,
                stagger: 0.15,
                ease: "power2.out"
            });
        }
    }, []);

    return (
        <section ref={sectionRef} className="achievements-section relative bg-background overflow-hidden py-16 sm:py-20 lg:py-28">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
                {/* Header */}
                <div className="achievements-header mb-10 md:mb-14 lg:mb-16">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-foreground/45 mb-3 block">Achievements</span>
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-foreground uppercase leading-[0.9] tracking-tighter italic mb-4">
                        Recognition & Milestones
                    </h2>
                    <p className="text-foreground/55 text-sm md:text-lg italic leading-relaxed max-w-2xl">
                        A focused set of highlights that represent impact, delivery, and innovation.
                    </p>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
                    {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                            <article 
                                key={index} 
                                className={`achievement-card achievement-card-${index} group relative p-5 md:p-6 lg:p-7 rounded-sm border border-border bg-muted/30 hover:bg-muted hover:border-foreground/25 transition-colors duration-300`}
                            >
                                {/* Year and Category */}
                                <div className="flex items-center justify-between gap-4 text-foreground/50 font-mono text-[10px] uppercase tracking-widest mb-5">
                                    <span>{achievement.year}</span>
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-foreground/55">{achievement.category}</span>
                                </div>

                                {/* Icon */}
                                <div className="mb-5">
                                    <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center border border-border group-hover:border-foreground/25 transition-colors">
                                        <Icon className="w-6 h-6 text-foreground" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg md:text-xl lg:text-2xl font-black text-foreground uppercase tracking-tight leading-tight mb-3 group-hover:text-foreground/90 transition-colors">
                                    {achievement.title}
                                </h3>

                                {/* Description */}
                                <p className="text-foreground/65 text-sm md:text-base leading-relaxed italic">
                                    {achievement.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
