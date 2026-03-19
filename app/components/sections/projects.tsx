 "use client";

import { ExternalLink, Github } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { projects, type Project } from "@/app/data/projects";
import { motion } from "framer-motion";

export default function Projects() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [previewTop, setPreviewTop] = useState<number>(0);
    const [lastProject, setLastProject] = useState<Project | null>(null);
    const [mobileVisible, setMobileVisible] = useState<number>(3);
    const [desktopVisible, setDesktopVisible] = useState<number>(6);
    const [isNavigatingToProject, setIsNavigatingToProject] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);

    const layoutRef = useRef<HTMLDivElement | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const navTimeoutRef = useRef<number | null>(null);

    const activeProject = useMemo<Project | null>(() => {
        if (activeIndex === null) return null;
        return projects[Math.min(Math.max(activeIndex, 0), projects.length - 1)] ?? null;
    }, [activeIndex]);

    const renderProject = activeProject ?? lastProject;
    const isPreviewVisible = renderProject !== null && activeProject !== null;

    const updatePreviewPosition = useCallback((anchorEl: HTMLElement) => {
        const layoutEl = layoutRef.current;
        const previewEl = previewRef.current;
        if (!layoutEl || !previewEl) return;

        const layoutRect = layoutEl.getBoundingClientRect();
        const anchorRect = anchorEl.getBoundingClientRect();
        const previewRect = previewEl.getBoundingClientRect();

        // Desired: align preview center with the hovered row center.
        const desiredCenterY = (anchorRect.top - layoutRect.top) + (anchorRect.height / 2);

        // Clamp so the preview never cuts out (top/bottom).
        const padding = 12;
        const halfPreview = previewRect.height / 2;
        const minCenter = halfPreview + padding;
        const maxCenter = layoutRect.height - halfPreview - padding;
        const clampedCenterY = Math.min(Math.max(desiredCenterY, minCenter), maxCenter);

        setPreviewTop(clampedCenterY);
    }, []);

    const mobileProjects = useMemo<readonly Project[]>(() => {
        return projects.slice(0, mobileVisible);
    }, [mobileVisible]);

    const desktopProjects = useMemo<readonly Project[]>(() => {
        return projects.slice(0, desktopVisible);
    }, [desktopVisible]);

    const navigateToProject = useCallback((slug: string) => {
        if (isNavigatingToProject) return;
        setIsNavigatingToProject(true);
        setTransitionKey((value) => value + 1);
        navTimeoutRef.current = window.setTimeout(() => {
            window.sessionStorage.setItem("route-transition-lock", "1");
            window.sessionStorage.setItem("project-transition-reveal", "1");
            router.push(`/projects/${slug}`);
        }, 620);
    }, [isNavigatingToProject, router]);

    React.useEffect(() => {
        projects.forEach((project) => {
            router.prefetch(`/projects/${project.slug}`);
        });
    }, [router]);

    React.useEffect(() => {
        return () => {
            if (navTimeoutRef.current !== null) {
                window.clearTimeout(navTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!isNavigatingToProject) return;

        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;
        document.documentElement.classList.add("route-transition-lock");
        document.body.classList.add("route-transition-lock");
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            const keepLockForNextRoute = window.sessionStorage.getItem("route-transition-lock") === "1";
            if (keepLockForNextRoute) {
                return;
            }
            document.documentElement.classList.remove("route-transition-lock");
            document.body.classList.remove("route-transition-lock");
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousBodyOverflow;
        };
    }, [isNavigatingToProject]);

    return (
        <section id="projects" className="projects-section relative bg-black overflow-hidden scroll-mt-24">
            {isNavigatingToProject && (
                <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">
                    <motion.div
                        key={transitionKey}
                        className="absolute inset-0"
                        initial={{ y: "100%" }}
                        animate={{
                            y: ["100%", "0%", "0%"],
                            backgroundColor: ["#0a0a0a", "#0a0a0a", "#0a0a0a"],
                        }}
                        transition={{
                            duration: 1.25,
                            times: [0, 0.24, 1],
                            ease: "easeInOut",
                        }}
                    />
                </div>
            )}
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
                <div className="projects-header pt-12 lg:pt-20 pb-8 lg:pb-12">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 mb-2 lg:mb-4 block">Selected Projects</span>
                    <h2 className="text-2xl md:text-5xl lg:text-7xl font-black text-white uppercase leading-[0.9] tracking-tighter italic mb-4">
                        Featured<br className="lg:hidden" /> <span className="lg:block">Work</span>
                    </h2>
                    <p className="text-white/40 text-sm md:text-lg italic leading-relaxed max-w-2xl lg:max-w-xl">
                        A collection of projects showcasing full-stack development and modern design.
                    </p>
                </div>

                <div className="projects-content-wrapper relative z-10 pb-10 md:pb-14 lg:pb-20">
                    {/* Mobile & Tablet: stacked cards (touch-friendly) */}
                    <div className="lg:hidden">
                        <div className="grid grid-cols-1 gap-8 md:gap-10">
                            {mobileProjects.map((project) => (
                                <article
                                    key={project.slug}
                                    className="rounded-sm border border-white/10 bg-white/5 overflow-hidden cursor-pointer"
                                    onClick={() => navigateToProject(project.slug)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            navigateToProject(project.slug);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="relative w-full aspect-16/10 bg-black/20">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover opacity-95"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 text-white/30 font-mono text-[10px] uppercase tracking-widest mb-2">
                                                    <span>{project.year}</span>
                                                    {project.featured && (
                                                        <span className="text-white/40">Featured</span>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-black uppercase tracking-tight text-xl leading-tight">
                                                    {project.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`View ${project.title} source code on GitHub`}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 active:text-white active:border-white/35 transition-colors"
                                                >
                                                    <Github className="w-5 h-5" />
                                                </a>
                                                <a
                                                    href={project.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`View ${project.title} live demo`}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 active:text-white active:border-white/35 transition-colors"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-white/55 text-sm italic leading-relaxed line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {project.tech.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="text-[10px] px-2.5 py-1 bg-white/4 text-white/60 rounded-full border border-white/10 font-mono uppercase tracking-widest"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {projects.length > 3 && mobileVisible < projects.length && (
                            <div className="pt-10 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setMobileVisible((v) => Math.min(projects.length, v + 3))}
                                    className="px-5 py-3 text-[11px] font-mono uppercase tracking-[0.35em] text-white/70 hover:text-white border border-white/15 hover:border-white/35 transition-colors bg-white/5"
                                >
                                    Show more projects
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Desktop: title list + floating hover preview */}
                    <div
                        className="hidden lg:grid relative grid-cols-12 gap-12 items-start"
                        onMouseLeave={() => setActiveIndex(null)}
                        ref={layoutRef}
                    >
                        {/* Left: list */}
                        <div className="col-span-12">
                            <div className="border-t border-white/10">
                                {desktopProjects.map((project, index) => {
                                    const isActive = activeIndex !== null && index === activeIndex;
                                    return (
                                        <button
                                            key={project.slug}
                                            type="button"
                                            onMouseEnter={(e) => {
                                                setActiveIndex(index);
                                                setLastProject(projects[index] ?? null);
                                                updatePreviewPosition(e.currentTarget);
                                                router.prefetch(`/projects/${project.slug}`);
                                            }}
                                            onFocus={(e) => {
                                                setActiveIndex(index);
                                                setLastProject(projects[index] ?? null);
                                                updatePreviewPosition(e.currentTarget);
                                                router.prefetch(`/projects/${project.slug}`);
                                            }}
                                            onClick={() => navigateToProject(project.slug)}
                                            className="group w-full text-left border-b border-white/10 py-4 md:py-5 lg:py-6"
                                        >
                                            <div className="flex items-start gap-5 md:gap-7">
                                                <div className="pt-1 w-10 shrink-0">
                                                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/30">
                                                        {String(index + 1).padStart(2, "0")}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-4">
                                                        <h3
                                                            className={[
                                                                "text-xl md:text-2xl lg:text-3xl font-black uppercase leading-tight tracking-tight italic transition-colors",
                                                                isActive ? "text-white" : "text-white/45 group-hover:text-white/80"
                                                            ].join(" ")}
                                                        >
                                                            {project.title}
                                                        </h3>
                                                        <span
                                                            className={[
                                                                "opacity-0 group-hover:opacity-100 transition-opacity text-white/40",
                                                                isActive ? "opacity-100" : ""
                                                            ].join(" ")}
                                                            aria-hidden="true"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-white/30 font-mono text-[10px] uppercase tracking-widest">
                                                        <span>{project.year}</span>
                                                        <span className="text-white/20">/</span>
                                                        <span className="truncate">{project.tech.join(" · ")}</span>
                                                        {project.featured && (
                                                            <>
                                                                <span className="text-white/20">/</span>
                                                                <span className="text-white/40">Featured</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {projects.length > 6 && desktopVisible < projects.length && (
                                <div className="pt-10 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDesktopVisible((v) => Math.min(projects.length, v + 6))}
                                        className="px-6 py-3 text-[11px] font-mono uppercase tracking-[0.35em] text-white/70 hover:text-white border border-white/15 hover:border-white/35 transition-colors bg-white/5"
                                    >
                                        Show more projects
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Floating preview (desktop hover) */}
                        <div
                            className={[
                                "absolute right-0 -translate-y-1/2",
                                "w-[380px] xl:w-[420px] pointer-events-none",
                                "transition-[opacity,transform] duration-200 ease-out",
                                isPreviewVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-3 scale-[0.98]"
                            ].join(" ")}
                            style={{ top: previewTop }}
                            aria-hidden={isPreviewVisible ? undefined : true}
                        >
                            {renderProject && (
                                <div
                                    ref={previewRef}
                                    className="pointer-events-auto rounded-sm border border-white/10 bg-black/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/50"
                                    onTransitionEnd={() => {
                                        if (activeProject === null) setLastProject(null);
                                    }}
                                >
                                    <div className="relative w-full aspect-16/10 bg-black/20">
                                        <img
                                            key={renderProject.image}
                                            src={renderProject.image}
                                            alt={renderProject.title}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover opacity-95"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                                    </div>

                                    <div className="p-4 md:p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 text-white/30 font-mono text-[10px] uppercase tracking-widest mb-2">
                                                    <span>{renderProject.year}</span>
                                                    {renderProject.featured && (
                                                        <span className="text-white/40">Featured</span>
                                                    )}
                                                </div>
                                                <h4 className="text-white font-black uppercase tracking-tight text-base md:text-lg leading-tight truncate">
                                                    {renderProject.title}
                                                </h4>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <a
                                                    href={renderProject.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`View ${renderProject.title} source code on GitHub`}
                                                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/35 transition-colors"
                                                >
                                                    <Github className="w-4 h-4" />
                                                </a>
                                                <a
                                                    href={renderProject.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`View ${renderProject.title} live demo`}
                                                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/35 transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-white/55 text-xs md:text-sm italic leading-relaxed line-clamp-3">
                                            {renderProject.description}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {renderProject.tech.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="text-[10px] px-2.5 py-1 bg-white/4 text-white/60 rounded-full border border-white/10 font-mono uppercase tracking-widest"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
