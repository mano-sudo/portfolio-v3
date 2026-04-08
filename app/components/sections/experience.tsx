"use client";

import { useEffect, useRef } from "react";
import { Briefcase, MapPin } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const experiences = [
    {
        title: "Junior Developer",
        company: "SOCIA ph",
        location: "Philippines",
        period: "2025 - Present",
        description: "Contributing to the development of enterprise-grade solutions using modern full-stack architectures. Collaborating with cross-functional teams to deliver high-quality code, optimized database schemas, and scalable microservices.",
        achievements: [
            "Actively contributing to production-level codebases as a Junior Developer",
            "Working on scalable solutions within the SOCIA ecosystem using Laravel and Next.js",
            "Collaborating with senior engineers to implement containerized workflows with Docker"
        ],
        tech: ["React", "TypeScript", "Laravel", "Node", "Next", "Postgres", "Docker", "MySQL"]
    },
    {
        title: "Lead Developer (Innovation Award Winner)",
        company: "Synergy 2025 Conference",
        location: "University Tech Showcase",
        period: "2024 - 2025",
        description: "Developed an advanced Water Quality Monitoring System using IoT technology. The project features real-time analysis, mobile app integration, and environmental monitoring with 95% data accuracy.",
        achievements: [
            "Won 'Best Research Paper' at Synergy 2025 Conference",
            "Developed a cross-platform Flutter app for real-time visualization",
            "Implemented REST APIs and alert systems using Firebase",
            "Developed ML algorithms for water quality prediction"
        ],
        tech: ["Flutter", "ESP32", "Firebase", "IoT", "Machine Learning", "REST API"]
    }
];

export default function Experience() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const root = sectionRef.current;
            if (!root) return;

            const leftPanel = root.querySelector<HTMLElement>(".experience-panel-left");
            const rightPanel = root.querySelector<HTMLElement>(".experience-panel-right");

            const animItems = gsap.utils.toArray<HTMLElement>(".experience-anim", root);
            const techBadges = gsap.utils.toArray<HTMLElement>(".experience-tech-anim", root);

            const panels: HTMLElement[] = [leftPanel, rightPanel].filter((el): el is HTMLElement => !!el);
            const allItems: HTMLElement[] = [...animItems, ...techBadges];

            gsap.set(panels, { autoAlpha: 0, y: 40, willChange: "transform,opacity" });
            gsap.set(allItems, { autoAlpha: 0, y: 26, willChange: "transform,opacity" });

            const tlPanelsIn = gsap.timeline({ paused: true }).to(panels, {
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
                onEnter: () => tlPanelsIn.play(0),
                onEnterBack: () => tlPanelsIn.play(0),
                onRefresh: (self) => {
                    if (self.progress > 0) tlPanelsIn.progress(1);
                    else tlPanelsIn.pause(0).progress(0);
                },
            });

            const scrubReveal = (el: HTMLElement, yFrom: number) => {
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
                            scrub: 0.85,
                            invalidateOnRefresh: true,
                        },
                    },
                );
            };

            animItems.forEach((el) => scrubReveal(el, 22));
            techBadges.forEach((el) => scrubReveal(el, 18));
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative bg-background py-16 sm:py-20 lg:py-28 overflow-hidden">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-44 max-w-[1920px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-10 md:gap-14 lg:gap-16 items-start">
                    {/* Left — Title */}
                    <div className="experience-panel-left lg:w-5/12 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="experience-anim text-[10px] sm:text-xs uppercase tracking-[0.35em] text-black/45 font-mono">
                                Experience
                            </span>
                            <div className="h-px flex-1 bg-black/10" />
                        </div>

                        <h2 className="experience-anim text-[clamp(2rem,5vw,5rem)] font-black uppercase leading-[0.95] text-black tracking-tight">
                            Work History
                        </h2>

                        <p className="experience-anim text-base sm:text-lg text-black/65 leading-relaxed max-w-lg">
                            Roles and innovation work across enterprise and academic projects.
                        </p>
                    </div>

                    {/* Right — List */}
                    <div className="experience-panel-right lg:w-7/12 lg:self-center">
                        <div className="grid gap-10 md:gap-12">
                            {experiences.map((exp) => (
                                <article key={`${exp.company}-${exp.period}-${exp.title}`} className="experience-anim border border-black/10 bg-black/2 p-6 md:p-8 lg:p-10">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-black/60 text-xs md:text-sm font-medium mb-4">
                                        <span className="flex items-center gap-2 text-black/85">
                                            <Briefcase className="w-4 h-4 opacity-50 text-black" />
                                            {exp.company}
                                        </span>
                                        <span className="flex items-center gap-2 text-black/55">
                                            <MapPin className="w-4 h-4 opacity-40" />
                                            {exp.location}
                                        </span>
                                        <span className="text-black/45 font-mono uppercase tracking-widest text-[10px] md:text-xs">
                                            {exp.period}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-none mb-4">
                                        {exp.title}
                                    </h3>

                                    <p className="text-black/65 text-sm md:text-base leading-relaxed max-w-3xl mb-6">
                                        {exp.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                        {exp.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="experience-tech-anim text-[10px] md:text-xs px-3 py-1.5 md:px-4 md:py-2 bg-black/3 text-black/60 border border-black/10 font-mono uppercase tracking-widest"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
