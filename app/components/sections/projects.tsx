 "use client";

import { ExternalLink, Github } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { projects, type Project } from "@/app/data/projects";
import { releaseDocumentScroll } from "@/app/utils/release-document-scroll";
import {
    prefersHardNavigationToProjectDetail,
    projectDetailPath,
} from "@/app/utils/project-detail-navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function Projects() {
    const router = useRouter();
    const [isDesktop, setIsDesktop] = useState<boolean>(false);
    const [hoveredDesktopSlug, setHoveredDesktopSlug] = useState<string | null>(null);
    const [previewAnchorY, setPreviewAnchorY] = useState<number>(180);
    const [isPreviewImageLoaded, setIsPreviewImageLoaded] = useState<boolean>(false);
    const [mobileVisible, setMobileVisible] = useState<number>(3);
    const [desktopVisible, setDesktopVisible] = useState<number>(6);
    const [isNavigatingToProject, setIsNavigatingToProject] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);

    const navTimeoutRef = useRef<number | null>(null);
    const hoverResumeTimeoutRef = useRef<number | null>(null);
    const isScrollHoverLockedRef = useRef<boolean>(false);
    const prefetchedProjectSlugsRef = useRef<Set<string>>(new Set());

    const prefetchProject = useCallback((slug: string) => {
        if (prefetchedProjectSlugsRef.current.has(slug)) return;
        prefetchedProjectSlugsRef.current.add(slug);
        router.prefetch(projectDetailPath(slug));
    }, [router]);

    const updatePreviewAnchorFromElement = useCallback((element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + (rect.height / 2);
        const estimatedHalfCard = 210;
        const minY = 120 + estimatedHalfCard;
        const maxY = window.innerHeight - 24 - estimatedHalfCard;
        const clampedY = Math.min(Math.max(centerY, minY), maxY);
        setPreviewAnchorY(clampedY);
    }, []);

    const mobileProjects = useMemo<readonly Project[]>(() => {
        return projects.slice(0, mobileVisible);
    }, [mobileVisible]);

    const desktopProjects = useMemo<readonly Project[]>(() => {
        return projects.slice(0, desktopVisible);
    }, [desktopVisible]);

    const hoveredDesktopProject = useMemo<Project | null>(() => {
        if (!hoveredDesktopSlug) return null;
        return desktopProjects.find((project) => project.slug === hoveredDesktopSlug) ?? null;
    }, [desktopProjects, hoveredDesktopSlug]);

    React.useEffect(() => {
        setIsPreviewImageLoaded(false);
    }, [hoveredDesktopProject?.image]);

    const navigateToProject = useCallback((slug: string) => {
        if (isNavigatingToProject) return;
        prefetchProject(slug);

        if (prefersHardNavigationToProjectDetail()) {
            window.location.assign(projectDetailPath(slug));
            return;
        }

        setIsNavigatingToProject(true);
        setTransitionKey((value) => value + 1);
        navTimeoutRef.current = window.setTimeout(() => {
            window.sessionStorage.setItem("route-transition-lock", "1");
            window.sessionStorage.setItem("project-transition-reveal", "1");
            router.push(projectDetailPath(slug));
        }, 620);
    }, [isNavigatingToProject, prefetchProject, router]);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleViewportChange = (event: MediaQueryListEvent) => {
            setIsDesktop(event.matches);
        };

        setIsDesktop(mediaQuery.matches);
        mediaQuery.addEventListener("change", handleViewportChange);

        return () => {
            mediaQuery.removeEventListener("change", handleViewportChange);
        };
    }, []);

    React.useEffect(() => {
        return () => {
            if (navTimeoutRef.current !== null) {
                window.clearTimeout(navTimeoutRef.current);
            }
            if (hoverResumeTimeoutRef.current !== null) {
                window.clearTimeout(hoverResumeTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!isDesktop) return;

        const lockHoverDuringScroll = () => {
            // Prevent row-hover churn while scrolling passes items under a fixed cursor.
            if (!isScrollHoverLockedRef.current) {
                isScrollHoverLockedRef.current = true;
                setHoveredDesktopSlug(null);
            }
            if (hoverResumeTimeoutRef.current !== null) {
                window.clearTimeout(hoverResumeTimeoutRef.current);
            }
            hoverResumeTimeoutRef.current = window.setTimeout(() => {
                isScrollHoverLockedRef.current = false;
                hoverResumeTimeoutRef.current = null;
            }, 140);
        };

        window.addEventListener("scroll", lockHoverDuringScroll, { passive: true });
        window.addEventListener("wheel", lockHoverDuringScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", lockHoverDuringScroll);
            window.removeEventListener("wheel", lockHoverDuringScroll);
        };
    }, [isDesktop]);

    React.useEffect(() => {
        if (!isNavigatingToProject) return;

        document.documentElement.classList.add("route-transition-lock");
        document.body.classList.add("route-transition-lock");
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            releaseDocumentScroll();
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
                    {!isDesktop && (
                        <>
                        <div className="grid grid-cols-1 gap-8 md:gap-10">
                            {mobileProjects.map((project) => (
                                <article
                                    key={project.slug}
                                    className="rounded-sm border border-white/10 bg-white/5 overflow-hidden cursor-pointer"
                                    style={{ contentVisibility: "auto", containIntrinsicSize: "640px" }}
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
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            loading="lazy"
                                            quality={65}
                                            className="absolute inset-0 h-full w-full object-cover opacity-95"
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
                        </>
                    )}

                    {/* Desktop: title list + lightweight preview */}
                    {isDesktop && (
                        <div
                            className="relative grid grid-cols-12 items-start gap-12"
                            onMouseLeave={() => setHoveredDesktopSlug(null)}
                        >
                        {/* Left: list */}
                        <div className="col-span-12 xl:col-span-7">
                            <div className="border-t border-white/10">
                                {desktopProjects.map((project, index) => {
                                    const isHovered = hoveredDesktopSlug === project.slug;
                                    return (
                                        <button
                                            key={project.slug}
                                            type="button"
                                            onMouseEnter={() => {
                                                if (isScrollHoverLockedRef.current) return;
                                                setHoveredDesktopSlug(project.slug);
                                                prefetchProject(project.slug);
                                            }}
                                            onMouseMove={(event) => {
                                                if (isScrollHoverLockedRef.current) return;
                                                updatePreviewAnchorFromElement(event.currentTarget);
                                            }}
                                            onFocus={(event) => {
                                                if (isScrollHoverLockedRef.current) return;
                                                setHoveredDesktopSlug(project.slug);
                                                prefetchProject(project.slug);
                                                updatePreviewAnchorFromElement(event.currentTarget);
                                            }}
                                            onClick={() => navigateToProject(project.slug)}
                                            className="group w-full text-left border-b border-white/10 py-4 md:py-5 lg:py-6"
                                            style={{ contentVisibility: "auto", containIntrinsicSize: "120px" }}
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
                                                                isHovered ? "text-white" : "text-white/45 group-hover:text-white/80",
                                                            ].join(" ")}
                                                        >
                                                            {project.title}
                                                        </h3>
                                                        <span
                                                            className={[
                                                                "transition-opacity text-white/40",
                                                                isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100",
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

                        {/* Right: floating viewport preview */}
                        <div className="hidden xl:block xl:col-span-5">
                            <motion.div
                                className="fixed xl:left-[56%] 2xl:left-[58%] z-40 w-[340px] 2xl:w-[380px] -translate-y-1/2"
                                initial={false}
                                animate={{ top: previewAnchorY }}
                                transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.65 }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {hoveredDesktopProject ? (
                                        <motion.article
                                            key={hoveredDesktopProject.slug}
                                            initial={{ opacity: 0, y: 10, scale: 0.985 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.99 }}
                                            transition={{ duration: 0.22, ease: "easeOut" }}
                                            className="rounded-sm border border-white/10 bg-white/5 overflow-hidden shadow-2xl shadow-black/40 will-change-transform"
                                            style={{ contentVisibility: "auto", containIntrinsicSize: "560px" }}
                                        >
                                            <div className="relative w-full aspect-16/10 bg-black/20">
                                                {!isPreviewImageLoaded && (
                                                    <div className="absolute inset-0 z-10 animate-pulse bg-white/8" />
                                                )}
                                                <Image
                                                    src={hoveredDesktopProject.image}
                                                    alt={hoveredDesktopProject.title}
                                                    fill
                                                    sizes="(max-width: 1536px) 40vw, 560px"
                                                    loading="lazy"
                                                    quality={62}
                                                    className="absolute inset-0 h-full w-full object-cover opacity-95"
                                                    onLoadingComplete={() => setIsPreviewImageLoaded(true)}
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-3 text-white/30 font-mono text-[10px] uppercase tracking-widest mb-2">
                                                            <span>{hoveredDesktopProject.year}</span>
                                                            {hoveredDesktopProject.featured && (
                                                                <span className="text-white/40">Featured</span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-white font-black uppercase tracking-tight text-lg leading-tight truncate">
                                                            {hoveredDesktopProject.title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <a
                                                            href={hoveredDesktopProject.github}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label={`View ${hoveredDesktopProject.title} source code on GitHub`}
                                                            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/35 transition-colors"
                                                        >
                                                            <Github className="w-4 h-4" />
                                                        </a>
                                                        <a
                                                            href={hoveredDesktopProject.live}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label={`View ${hoveredDesktopProject.title} live demo`}
                                                            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/35 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-white/55 text-sm italic leading-relaxed line-clamp-3">
                                                    {hoveredDesktopProject.description}
                                                </p>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {hoveredDesktopProject.tech.map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="text-[10px] px-2.5 py-1 bg-white/4 text-white/60 rounded-full border border-white/10 font-mono uppercase tracking-widest"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.article>
                                    ) : null}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
