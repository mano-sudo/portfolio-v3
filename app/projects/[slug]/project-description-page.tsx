import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import type { Project } from "@/app/data/projects";
import ProjectPageEnter from "@/app/components/project-page-enter";
import ProjectDetailScrollDebug from "@/app/components/project-detail-scroll-debug";

type ProjectDescriptionPageProps = {
    project: Project;
};

function splitDescription(description: string): { lead: string; rest: string } {
    const trimmed = description.trim();
    const match = trimmed.match(/^(.+?[.!?])(\s+|$)/);
    if (match && match[1].length <= 160 && match[1].length >= 16) {
        return {
            lead: match[1].trim(),
            rest: trimmed.slice(match[0].length).trim(),
        };
    }
    return { lead: "Project overview", rest: trimmed };
}

function MetaRow({ label, value }: { label: string; value: string }): ReactElement {
    return (
        <div className="border-b border-border py-4 first:pt-0 sm:py-5">
            <dt className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground sm:text-[10px]">
                {label}
            </dt>
            <dd className="mt-2 text-sm font-medium leading-snug text-foreground sm:text-base wrap-break-word">
                {value}
            </dd>
        </div>
    );
}

export default function ProjectDescriptionPage({
    project,
}: ProjectDescriptionPageProps): ReactElement {
    const { lead, rest } = splitDescription(project.description);
    const techLine = project.tech.join(" | ");

    return (
        <main className="w-full overflow-x-hidden bg-background text-foreground">
            <ProjectDetailScrollDebug slug={project.slug} />
            <ProjectPageEnter>
                {/* —— Full-viewport hero (reference: full-bleed image, scroll for content) —— */}
                <section
                    className="relative isolate min-h-dvh w-full"
                    aria-label={`${project.title} hero`}
                >
                    <div className="absolute inset-0">
                        <Image
                            src={project.image}
                            alt=""
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                        <div
                            className="absolute inset-0 bg-linear-to-b from-black/55 via-black/15 to-black/55 sm:from-black/50 sm:via-black/10 sm:to-black/50"
                            aria-hidden
                        />
                    </div>

                    <div className="relative z-10 flex min-h-dvh flex-col">
                        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-[calc(var(--app-header-h,72px)+max(0.75rem,env(safe-area-inset-top,0px)))] sm:px-6 sm:pt-[calc(var(--app-header-h,80px)+max(1rem,env(safe-area-inset-top,0px)))] md:px-10 lg:px-14">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <Link
                                    href="/projects"
                                    className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/85 transition-colors hover:text-white sm:text-[11px]"
                                >
                                    All projects
                                </Link>
                                <span className="text-white/35" aria-hidden>
                                    /
                                </span>
                                <Link
                                    href="/"
                                    className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/85 transition-colors hover:text-white sm:text-[11px]"
                                >
                                    Home
                                </Link>
                            </div>
                            <a
                                href={project.image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-white/35 bg-black/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-colors hover:border-white/55 hover:bg-black/35 sm:text-[10px]"
                            >
                                Open image
                            </a>
                        </div>

                        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-28 pt-8 sm:px-8 sm:pb-32 md:px-12">
                            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-white/60 sm:text-[11px]">
                                Case study · {project.year}
                            </p>
                            <h1 className="max-w-[min(100%,56rem)] text-center text-[clamp(1.75rem,5vw,4rem)] font-black uppercase leading-[0.95] tracking-tighter text-white drop-shadow-[0_2px_24px_rgb(0_0_0/0.35)] text-balance">
                                {project.title}
                            </h1>
                        </div>

                        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-8">
                            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/65 sm:text-[10px]">
                                Scroll
                            </span>
                            <span
                                className="h-8 w-px animate-pulse bg-linear-to-b from-white/0 via-white/70 to-white/0 sm:h-10"
                                aria-hidden
                            />
                        </div>
                    </div>
                </section>

                {/* —— Case study body (reference: two columns, theme-aligned) —— */}
                <section
                    className="border-t border-border bg-background"
                    aria-label="Project details"
                >
                    <div className="mx-auto max-w-[1920px] px-5 py-14 sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-16 lg:py-24 xl:px-24">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20">
                            {/* Left column */}
                            <div className="lg:col-span-5 xl:col-span-4">
                                <p className="text-2xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-3xl md:text-4xl wrap-break-word">
                                    {project.title}
                                </p>
                                <a
                                    href={project.live}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 inline-block border-b border-foreground/25 pb-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground sm:text-xs"
                                >
                                    View live site
                                </a>

                                <dl className="mt-10 sm:mt-12">
                                    <MetaRow label="Year" value={project.year} />
                                    <MetaRow label="Role" value={project.role} />
                                    <MetaRow label="Tech stack" value={techLine || "—"} />
                                    <MetaRow
                                        label="Status"
                                        value={project.featured ? "Featured project" : "Portfolio build"}
                                    />
                                </dl>

                                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center border border-border px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:border-foreground/35 hover:bg-muted hover:text-foreground sm:w-auto"
                                    >
                                        View source
                                    </a>
                                    <a
                                        href={project.live}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-colors hover:bg-foreground/85 sm:w-auto"
                                    >
                                        Live demo
                                    </a>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="min-w-0 lg:col-span-7 xl:col-span-8">
                                <h2 className="text-[clamp(1.5rem,3.2vw,2.75rem)] font-black uppercase leading-[1.05] tracking-tight text-foreground text-balance">
                                    {lead}
                                </h2>
                                <div className="mt-6 h-px w-full bg-border sm:mt-8" aria-hidden />
                                <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg sm:leading-relaxed">
                                    {rest ? <p className="wrap-break-word">{rest}</p> : null}
                                </div>
                            </div>
                        </div>

                        {/* Highlights — two-column block (reference layout) */}
                        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-border pt-14 sm:mt-20 sm:gap-8 sm:pt-16 md:mt-24 md:pt-20 lg:grid-cols-12 lg:gap-12">
                            <div className="lg:col-span-5 xl:col-span-4">
                                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
                                    Highlights
                                </h2>
                                <p className="mt-4 text-xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-2xl md:text-3xl wrap-break-word">
                                    Scope &amp; impact
                                </p>
                            </div>
                            <div className="min-w-0 lg:col-span-7 xl:col-span-8">
                                <ul className="space-y-4 text-sm leading-relaxed text-foreground/80 sm:text-base md:space-y-5">
                                    {project.highlights.map((item) => (
                                        <li key={item} className="flex gap-3">
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/30" aria-hidden />
                                            <span className="wrap-break-word">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </ProjectPageEnter>
        </main>
    );
}
