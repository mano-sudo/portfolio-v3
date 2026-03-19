import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/app/data/projects";
import ProjectPageEnter from "@/app/components/project-page-enter";

type ProjectPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
    return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white overflow-x-hidden">
            <ProjectPageEnter>
                <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 py-12 sm:py-14 md:py-20 lg:py-24">
                <div className="mb-6 sm:mb-8 md:mb-10">
                    <Link
                        href="/#projects"
                        className="inline-flex items-center text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-white/55 hover:text-white transition-colors"
                    >
                        Back to projects
                    </Link>
                </div>

                <header className="space-y-4 sm:space-y-5">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-white/40">
                        <span>{project.year}</span>
                        {project.featured && <span>Featured</span>}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] wrap-break-word">
                        {project.title}
                    </h1>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-3xl">{project.description}</p>
                    <p className="text-white/50 text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.2em] font-mono wrap-break-word">{project.role}</p>
                </header>

                <div className="mt-8 sm:mt-10 md:mt-14 grid gap-6 sm:gap-8 md:gap-10">
                    <div className="rounded-sm border border-white/10 bg-white/5 p-4 md:p-5">
                        <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.16em] text-white/85 mb-4">
                            Project Preview
                        </h2>
                        <a
                            href={project.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block overflow-hidden rounded-sm border border-white/10 bg-black/30"
                            aria-label={`Open full preview image for ${project.title}`}
                        >
                            <img
                                src={project.image}
                                alt={`${project.title} preview`}
                                className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-white/75 border border-white/25 px-2 py-1 bg-black/40">
                                Click to expand
                            </div>
                        </a>
                    </div>

                    <div className="rounded-sm border border-white/10 bg-white/5 p-5 md:p-7">
                        <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.16em] text-white/85 mb-4">
                            Project Highlights
                        </h2>
                        <ul className="space-y-3 text-white/70 text-sm md:text-base leading-relaxed">
                            {project.highlights.map((highlight) => (
                                <li key={highlight} className="flex gap-3">
                                    <span className="text-white/45">-</span>
                                    <span>{highlight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-sm border border-white/10 bg-white/5 p-5 md:p-7">
                        <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.16em] text-white/85 mb-4">
                            Technology Stack
                        </h2>
                        <div className="flex flex-wrap gap-2.5">
                            {project.tech.map((tech) => (
                                <span
                                    key={tech}
                                    className="text-[10px] md:text-xs px-2.5 py-1.5 bg-white/5 text-white/70 rounded-full border border-white/15 font-mono uppercase tracking-[0.15em]"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-white/20 text-white/80 text-xs md:text-sm uppercase tracking-[0.12em] hover:text-white hover:border-white/40 transition-colors"
                        >
                            View source
                        </a>
                        <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-white/20 text-white/80 text-xs md:text-sm uppercase tracking-[0.12em] hover:text-white hover:border-white/40 transition-colors"
                        >
                            Live demo
                        </a>
                    </div>
                </div>
                </section>
            </ProjectPageEnter>
        </main>
    );
}
