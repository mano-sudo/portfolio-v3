"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AnimatePresence,
    LazyMotion,
    domAnimation,
    m,
    motion,
    useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "@/app/data/projects";
import { releaseDocumentScroll } from "@/app/utils/release-document-scroll";
import {
    prefersHardNavigationToProjectDetail,
    projectDetailPath,
} from "@/app/utils/project-detail-navigation";
import { logPrefersHardNavContext, logProjectsScroll } from "@/app/utils/projects-scroll-debug";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const FEATURED_COUNT = 4;
const DESKTOP_MQ = "(min-width: 1024px)";

function categoryLabel(project: Project): string {
    const primary = project.tech[0] ?? "Build";
    const secondary = project.tech[1] ?? project.year;
    return `[${primary.toUpperCase()}] — [${secondary.toUpperCase()}]`;
}

/** Stacked layout tag line (reference-style multiple brackets). */
function projectTagsLine(project: Project): string {
    const tags = project.tech.slice(0, 3).map((t) => `[${t.toUpperCase()}]`);
    if (tags.length === 0) {
        return `[${project.year}]`;
    }
    return tags.join(" — ");
}

function useTypewriterTitle(fullText: string, sequenceKey: string): { display: string; complete: boolean } {
    const reduceMotion = useReducedMotion();
    const [display, setDisplay] = useState(fullText);
    const [complete, setComplete] = useState(true);

    useEffect(() => {
        if (reduceMotion) {
            setDisplay(fullText);
            setComplete(true);
            return;
        }

        setDisplay("");
        setComplete(false);
        let cancelled = false;
        let timeoutId: number = 0;
        let i = 0;
        const msPerChar = Math.min(30, Math.max(11, Math.round(2200 / Math.max(fullText.length, 1))));

        const step = (): void => {
            if (cancelled) return;
            i += 1;
            setDisplay(fullText.slice(0, i));
            if (i >= fullText.length) {
                setComplete(true);
                return;
            }
            timeoutId = window.setTimeout(step, msPerChar);
        };

        timeoutId = window.setTimeout(step, 45);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [fullText, sequenceKey, reduceMotion]);

    return { display, complete };
}

type DesktopGalleryProps = {
    viewportRef: RefObject<HTMLDivElement | null>;
    trackRef: RefObject<HTMLDivElement | null>;
    featured: readonly Project[];
    activeIndex: number;
    viewportShell: string;
    goToProject: (slug: string) => void;
};

function ProjectsDesktopGallery({
    viewportRef,
    trackRef,
    featured,
    activeIndex,
    viewportShell,
    goToProject,
}: DesktopGalleryProps) {
    const reduceMotion = useReducedMotion();
    const project = featured[activeIndex] ?? featured[0];
    const slug = project?.slug ?? "";
    const { display: typedTitle, complete: titleTyped } = useTypewriterTitle(project?.title ?? "", slug);

    return (
        <div
            className={`group/shell relative flex w-full flex-col overflow-hidden p-3 sm:p-4 ${viewportShell}`}
        >
            <span
                className="pointer-events-none absolute left-4 top-4 z-30 h-3 w-3 border-l border-t border-black/25 opacity-60 transition-opacity duration-300 group-hover/shell:opacity-100 sm:left-5 sm:top-5"
                aria-hidden
            />
            <span
                className="pointer-events-none absolute right-4 top-4 z-30 h-3 w-3 border-r border-t border-black/25 opacity-60 transition-opacity duration-300 group-hover/shell:opacity-100 sm:right-5 sm:top-5"
                aria-hidden
            />
            <span
                className="pointer-events-none absolute bottom-4 left-4 z-30 h-3 w-3 border-l border-b border-black/25 opacity-60 transition-opacity duration-300 group-hover/shell:opacity-100 sm:bottom-5 sm:left-5"
                aria-hidden
            />
            <span
                className="pointer-events-none absolute bottom-4 right-4 z-30 h-3 w-3 border-r border-b border-black/25 opacity-60 transition-opacity duration-300 group-hover/shell:opacity-100 sm:bottom-5 sm:right-5"
                aria-hidden
            />

            <div ref={viewportRef} className="relative min-h-0 w-full flex-1 overflow-hidden">
                <div
                    ref={trackRef}
                    className="absolute inset-0 flex flex-col gap-5 will-change-transform sm:gap-6 lg:gap-8"
                >
                    {featured.map((p, index) => (
                        <div
                            key={p.slug}
                            className="group/card h-full min-h-0 shrink-0 overflow-hidden rounded-sm border border-black/10 bg-background shadow-sm transition-shadow duration-300 group-hover/shell:shadow-[0_28px_60px_-34px_rgb(0_0_0/.2)]"
                        >
                            <button
                                type="button"
                                onClick={() => goToProject(p.slug)}
                                className="flex h-full min-h-0 w-full cursor-pointer flex-col text-left outline-none ring-black/40 focus-visible:ring-2 focus-visible:ring-inset"
                            >
                                <div className="relative min-h-0 h-full flex-1 overflow-hidden bg-black/5">
                                    <m.div
                                        className="relative h-full w-full"
                                        initial={false}
                                        whileHover={
                                            reduceMotion
                                                ? undefined
                                                : { scale: 1.03 }
                                        }
                                        transition={{ type: "tween", duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <Image
                                            src={p.image}
                                            alt={p.title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 65vw"
                                            className="object-cover object-center"
                                            priority={index === 0}
                                        />
                                    </m.div>
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />
                                </div>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between">
                    <div className="bg-linear-to-b from-black/75 via-black/35 to-transparent px-4 pb-16 pt-4 sm:px-5 sm:pb-20 sm:pt-5">
                        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/55 sm:text-[10px]">
                            {String(activeIndex + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
                        </p>
                        <h3
                            className="mt-3 min-h-[2.6em] max-w-[95%] font-black uppercase leading-[0.95] tracking-tight text-white text-[clamp(1.15rem,2.1vw,1.85rem)] wrap-break-word sm:min-h-[2.4em] lg:max-w-[90%]"
                            aria-live="polite"
                        >
                            {typedTitle}
                            {!titleTyped ? (
                                <span className="ml-0.5 inline-block h-[0.85em] w-px translate-y-px animate-pulse bg-white align-[-0.15em] sm:h-[0.9em]" />
                            ) : null}
                        </h3>
                        <div className="mt-2 min-h-5 max-w-full">
                            <AnimatePresence mode="wait">
                                <m.p
                                    key={slug}
                                    initial={
                                        reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-white/65 sm:text-[10px] sm:tracking-[0.2em] wrap-break-word"
                                >
                                    {categoryLabel(project)}
                                </m.p>
                            </AnimatePresence>
                        </div>
                        <AnimatePresence mode="wait">
                            <m.div
                                key={slug}
                                className="mt-4 flex flex-wrap gap-1.5 sm:gap-2"
                                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -3 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {project.tech.slice(0, 4).map((tech) => (
                                    <span
                                        key={tech}
                                        className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider text-white/85 sm:text-[9px]"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </m.div>
                        </AnimatePresence>
                    </div>

                    <div className="px-4 pb-3 sm:px-5 sm:pb-4">
                        <div className="flex gap-1.5 sm:gap-2">
                            {featured.map((p, i) => (
                                <div
                                    key={p.slug}
                                    className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/20"
                                    title={p.title}
                                >
                                    <m.div
                                        className="h-full rounded-full bg-white"
                                        initial={false}
                                        animate={{
                                            scaleX: i === activeIndex ? 1 : i < activeIndex ? 1 : 0.2,
                                            opacity: i === activeIndex ? 1 : i < activeIndex ? 0.55 : 0.35,
                                        }}
                                        transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ originX: 0 }}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="sr-only">
                            Project {activeIndex + 1} of {featured.length}. {project.title}.
                        </p>
                        <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.28em] text-white/50 sm:text-[9px]">
                            Scroll to scrub · Click a project to open
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Projects() {
    const router = useRouter();
    const featured = projects.slice(0, FEATURED_COUNT);
    const sectionRef = useRef<HTMLElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const pinnedScrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const navTimeoutRef = useRef<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);
    const [portalReady, setPortalReady] = useState(false);

    useEffect(() => {
        setPortalReady(true);
    }, []);

    const scrollToProject = useCallback((index: number) => {
        if (typeof window === "undefined") return;
        if (!window.matchMedia(DESKTOP_MQ).matches) return;

        const st = pinnedScrollTriggerRef.current;
        if (st) {
            const denom = Math.max(FEATURED_COUNT - 1, 1);
            const progress = index / denom;
            const targetScroll = st.start + (st.end - st.start) * progress;
            window.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
        setActiveIndex(index);
    }, []);

    const goToProject = useCallback(
        (slug: string) => {
            if (isNavigating) return;

            const hard = prefersHardNavigationToProjectDetail();
            logProjectsScroll("home #projects goToProject click", {
                slug,
                hardNavigation: hard,
                targetPath: projectDetailPath(slug),
                ...logPrefersHardNavContext(),
            });

            if (hard) {
                logProjectsScroll("home #projects -> location.assign (hard nav)", {
                    slug,
                    path: projectDetailPath(slug),
                });
                window.location.assign(projectDetailPath(slug));
                return;
            }

            setIsNavigating(true);
            setTransitionKey((v) => v + 1);
            logProjectsScroll("home #projects scroll lock ON (isNavigating)", {});

            navTimeoutRef.current = window.setTimeout(() => {
                logProjectsScroll("home #projects -> router.push (soft nav)", {
                    slug,
                    path: projectDetailPath(slug),
                });
                window.sessionStorage.setItem("route-transition-lock", "1");
                window.sessionStorage.setItem("project-transition-reveal", "1");
                router.push(projectDetailPath(slug));
            }, 620);
        },
        [isNavigating, router],
    );

    useEffect(() => {
        return () => {
            if (navTimeoutRef.current !== null) {
                window.clearTimeout(navTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isNavigating) return;

        document.documentElement.classList.add("route-transition-lock");
        document.body.classList.add("route-transition-lock");
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            logProjectsScroll("home #projects scroll lock cleanup (releaseDocumentScroll)", {
                wasNavigating: true,
            });
            releaseDocumentScroll();
        };
    }, [isNavigating]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            mm.add(DESKTOP_MQ, () => {
                const viewport = viewportRef.current;
                const track = trackRef.current;
                if (!viewport || !track) return () => {};

                const pinScrollPx = () =>
                    Math.round(window.innerHeight * (1.85 + FEATURED_COUNT * 0.42));

                const tl = gsap.fromTo(
                    track,
                    { y: 0 },
                    {
                        y: () =>
                            -Math.max(0, track.scrollHeight - viewport.clientHeight),
                        ease: "none",
                        scrollTrigger: {
                            trigger: section,
                            start: "center center",
                            end: () => `+=${pinScrollPx()}`,
                            pin: true,
                            pinSpacing: true,
                            scrub: 0.18,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                const p = self.progress;
                                const idx =
                                    FEATURED_COUNT <= 1
                                        ? 0
                                        : Math.min(
                                              Math.round(p * (FEATURED_COUNT - 1)),
                                              FEATURED_COUNT - 1,
                                          );
                                setActiveIndex(idx);
                            },
                        },
                    },
                );

                const st = tl.scrollTrigger ?? null;
                pinnedScrollTriggerRef.current = st;

                return () => {
                    pinnedScrollTriggerRef.current = null;
                    tl.scrollTrigger?.kill();
                };
            });
        }, sectionRef);

        return () => {
            pinnedScrollTriggerRef.current = null;
            ctx.revert();
        };
    }, []);

    /** Outer shell height (desktop preview column). Inner clip is shorter due to padding so gaps show between slides. */
    const viewportShell =
        "h-[72dvh] min-h-[300px] lg:h-[min(88vh,860px)] lg:min-h-[360px]";

    const transitionOverlay =
        portalReady && isNavigating
            ? createPortal(
                  <div
                      className="pointer-events-none fixed inset-0 z-9999 overflow-hidden"
                      data-project-transition-overlay
                      aria-hidden
                  >
                      <motion.div
                          key={transitionKey}
                          className="absolute inset-0 bg-[#0a0a0a]"
                          initial={{ y: "100%" }}
                          animate={{
                              y: ["100%", "0%", "0%"],
                          }}
                          transition={{
                              duration: 1.25,
                              times: [0, 0.24, 1],
                              ease: "easeInOut",
                          }}
                      />
                  </div>,
                  document.body,
              )
            : null;

    return (
        <>
            {transitionOverlay}
            <section
                ref={sectionRef}
                id="projects"
                data-shoot-scroll-interactive="1"
                className="projects-section scroll-mt-24  bg-background text-foreground"
                aria-label="Projects"
            >
                <div className="mx-auto max-w-[1920px] px-5 py-14 sm:px-8 md:px-12 lg:px-16 xl:px-24">
                {/* ——— Below lg: single column, stacked projects (theme) ——— */}
                <div className="lg:hidden">
                    <h2 className="text-3xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-4xl md:text-5xl">
                        Featured Work
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-relaxed text-black/55 sm:text-base md:text-lg">
                        We build websites where every scroll, every transition, and every interaction feels intentional.
                        The details most teams skip are the details we care about most.
                    </p>

                    <div className="mt-12 flex flex-col gap-14 sm:mt-14 sm:gap-16 md:gap-20">
                        {featured.map((project, index) => (
                            <article key={project.slug} className="w-full">
                                <button
                                    type="button"
                                    onClick={() => goToProject(project.slug)}
                                    className="group w-full text-left outline-none ring-black/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    <div className="relative aspect-16/10 w-full overflow-hidden rounded-sm border border-black/10 bg-black/5">
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            sizes="100vw"
                                            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                                            priority={index === 0}
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
                                    </div>
                                    <h3 className="mt-4 font-black uppercase leading-tight tracking-tight text-black sm:mt-5 sm:text-xl md:text-2xl">
                                        {project.title}
                                    </h3>
                                    <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-black/45 sm:text-[11px]">
                                        {projectTagsLine(project)}
                                    </p>
                                </button>
                            </article>
                        ))}
                    </div>

                    <div className="mt-12 border-t border-black/10 pt-10 sm:mt-14">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
                        >
                            View all
                        </Link>
                    </div>
                </div>

                {/* ——— lg+ : split column + pinned scrub gallery ——— */}
                <div className="hidden gap-10 lg:flex lg:flex-row lg:items-start lg:gap-14 xl:gap-20">
                    <div className="flex w-full shrink-0 flex-col lg:w-[min(100%,380px)] xl:w-[420px]">
                        <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.35em] text-black/45">
                            Selected Projects
                        </span>
                        <h2 className="text-3xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:text-4xl lg:text-5xl">
                            Featured
                            <br />
                            Work
                        </h2>
                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-black/55 sm:text-base">
                            Websites where scroll, motion, and interaction feel intentional. The details most teams skip
                            are the details we care about most.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:mt-10">
                            {featured.map((project, index) => {
                                const isActive = activeIndex === index;
                                return (
                                    <button
                                        key={project.slug}
                                        type="button"
                                        onClick={() => scrollToProject(index)}
                                        className="group flex items-center gap-3 rounded-sm text-left outline-none ring-black/30 focus-visible:ring-2"
                                    >
                                        <div
                                            className="relative h-14 w-24 shrink-0 overflow-hidden rounded-sm border border-black/10 bg-black/5 sm:h-16 sm:w-28"
                                            aria-hidden
                                        >
                                            <Image
                                                src={project.image}
                                                alt=""
                                                fill
                                                sizes="112px"
                                                className="object-cover opacity-95 transition-opacity group-hover:opacity-100"
                                            />
                                        </div>
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-[1px] transition-colors ${
                                                isActive
                                                    ? "bg-black"
                                                    : "bg-black/20 group-hover:bg-black/40"
                                            }`}
                                            aria-hidden
                                        />
                                        <span
                                            className={`min-w-0 truncate font-mono text-[10px] uppercase tracking-widest transition-colors ${
                                                isActive
                                                    ? "text-black"
                                                    : "text-black/40 group-hover:text-black/70"
                                            }`}
                                        >
                                            {project.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-10 sm:mt-12">
                            <Link
                                href="/projects"
                                className="inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
                            >
                                View all
                            </Link>
                        </div>
                    </div>

                    <LazyMotion features={domAnimation} strict>
                        <div className="min-h-0 flex-1 lg:pl-2">
                            <ProjectsDesktopGallery
                                viewportRef={viewportRef}
                                trackRef={trackRef}
                                featured={featured}
                                activeIndex={activeIndex}
                                viewportShell={viewportShell}
                                goToProject={goToProject}
                            />
                        </div>
                    </LazyMotion>
                </div>
            </div>
        </section>
        </>
    );
}
