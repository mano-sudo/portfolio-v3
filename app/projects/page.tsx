"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/app/data/projects";
import { releaseDocumentScroll } from "@/app/utils/release-document-scroll";
import {
    prefersHardNavigationToProjectDetail,
    projectDetailPath,
} from "@/app/utils/project-detail-navigation";
import {
    logPrefersHardNavContext,
    logProjectsScroll,
} from "@/app/utils/projects-scroll-debug";

function projectTagsLine(project: Project): string {
    const tags = project.tech.slice(0, 3).map((t) => `[${t.toUpperCase()}]`);
    if (tags.length === 0) {
        return `[${project.year}]`;
    }
    return tags.join(" — ");
}

export default function ProjectsPage() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);
    const navTimeoutRef = useRef<number | null>(null);

    const navigateToProject = useCallback(
        (slug: string) => {
            if (isNavigating) return;

            const hard = prefersHardNavigationToProjectDetail();
            logProjectsScroll("/projects card click", {
                slug,
                hardNavigation: hard,
                targetPath: projectDetailPath(slug),
                ...logPrefersHardNavContext(),
            });

            if (hard) {
                logProjectsScroll("/projects -> location.assign (hard nav)", {
                    slug,
                    path: projectDetailPath(slug),
                });
                window.location.assign(projectDetailPath(slug));
                return;
            }

            setIsNavigating(true);
            setTransitionKey((value) => value + 1);

            logProjectsScroll("/projects scroll lock ON (isNavigating)", {});

            navTimeoutRef.current = window.setTimeout(() => {
                logProjectsScroll("/projects -> router.push (soft nav)", {
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
            logProjectsScroll("/projects scroll lock cleanup (releaseDocumentScroll)", {
                wasNavigating: true,
            });
            releaseDocumentScroll();
        };
    }, [isNavigating]);

    return (
        <main className="min-h-screen w-full overflow-x-hidden border-t border-black/10 bg-background text-foreground">
            {isNavigating && (
                <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">
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
                </div>
            )}

            <section
                className="projects-page-section mx-auto max-w-[1920px] px-5 py-14 sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-16 lg:py-24 xl:px-24"
                aria-label="All projects"
            >
                <header className="mb-10 max-w-2xl md:mb-14 lg:mb-16">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/45 sm:text-[11px]">
                            Portfolio
                        </span>
                        <span className="hidden h-px w-8 bg-black/10 sm:block" aria-hidden />
                        <Link
                            href="/"
                            className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/40 transition-colors hover:text-black/70 sm:text-[11px]"
                        >
                            Back to home
                        </Link>
                    </div>
                    <h1 className="mt-4 text-3xl font-black uppercase leading-[0.95] tracking-tighter text-black sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl">
                        All Projects
                    </h1>
                    <p className="mt-5 text-sm leading-relaxed text-black/55 sm:text-base md:text-lg">
                        Full list of work—same craft as the featured section. Open any card for the full case study.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-12 sm:gap-14 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:gap-x-10 lg:gap-y-16 xl:grid-cols-3">
                    {projects.map((project, index) => (
                        <article key={project.slug} className="min-w-0 w-full">
                            <button
                                type="button"
                                onClick={() => navigateToProject(project.slug)}
                                className="group w-full cursor-pointer text-left outline-none ring-black/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <div className="relative aspect-16/10 w-full overflow-hidden rounded-sm border border-black/10 bg-black/5">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                                        priority={index === 0}
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-5">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 sm:text-[11px]">
                                        {project.year}
                                    </span>
                                    {project.featured ? (
                                        <span className="rounded-sm border border-black/15 bg-black/3 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-black/50 sm:text-[10px]">
                                            Featured
                                        </span>
                                    ) : null}
                                </div>
                                <h2 className="mt-2 font-black uppercase leading-tight tracking-tight text-black sm:text-xl md:text-2xl">
                                    {project.title}
                                </h2>
                                <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-black/45 sm:text-[11px]">
                                    {projectTagsLine(project)}
                                </p>
                                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-black/55 sm:text-base">
                                    {project.description}
                                </p>
                                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-[11px]">
                                    View project details
                                </p>
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
