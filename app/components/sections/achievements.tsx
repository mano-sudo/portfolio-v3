"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, Star, Code, Zap, Target, TrendingUp } from "lucide-react";
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
        icon: Star,
        title: "3 Projects in 6 Months",
        description: "Successfully delivered 3 production projects at SOCIA ph within first 6 months",
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
    },
    {
        icon: Target,
        title: "Joined SOCIA ph",
        description: "Started as Junior Developer, contributing to production-level codebases",
        year: "2025",
        category: "Milestone"
    },
    {
        icon: TrendingUp,
        title: "IoT Project Launch",
        description: "Developed and deployed Water Quality Monitoring System with ML capabilities",
        year: "2024",
        category: "Milestone"
    }
];

export default function Achievements() {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

        // Desktop: Horizontal scroll with cards
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
        <section ref={sectionRef} className="achievements-section relative bg-black overflow-hidden py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
                {/* Header */}
                <div className="achievements-header text-center mb-16 lg:mb-24">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 mb-4 block">Achievements</span>
                    <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter italic mb-6">
                        Recognition &<br />Milestones
                    </h2>
                    <p className="text-white/40 text-lg md:text-xl italic max-w-2xl mx-auto">
                        Key achievements and milestones that define my journey in tech.
                    </p>
                </div>

                {/* Achievements Grid */}
                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                            <article 
                                key={index} 
                                className={`achievement-card achievement-card-${index} group relative p-6 lg:p-8 rounded-2xl border border-white/5 bg-white/0 hover:bg-white/5 hover:border-white/20 transition-all duration-500`}
                            >
                                {/* Year and Category */}
                                <div className="flex items-center justify-between gap-4 text-white/30 font-mono text-[10px] lg:text-sm uppercase tracking-widest mb-6">
                                    <span>{achievement.year}</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-white/40">{achievement.category}</span>
                                </div>

                                {/* Icon */}
                                <div className="mb-6 flex justify-center">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                                        <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight mb-4 group-hover:text-white/90 transition-colors">
                                    {achievement.title}
                                </h3>

                                {/* Description */}
                                <p className="text-white/60 text-sm md:text-base leading-relaxed italic">
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
