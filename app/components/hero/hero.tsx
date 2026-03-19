"use client";

import { useEffect, useRef, useState } from "react";

export default function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, "0");
            const m = now.getMinutes().toString().padStart(2, "0");
            const s = now.getSeconds().toString().padStart(2, "0");
            setCurrentTime(`${h}:${m}:${s}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="w-full min-h-dvh md:min-h-screen overflow-x-hidden relative bg-black"
        >

            {/* ── Decorative grid dots (top-right) ── */}
            <div className="hero-decor hidden lg:block absolute top-20 right-12 xl:right-20 opacity-20 pointer-events-none">
                <div className="grid grid-cols-5 gap-4">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-white" />
                    ))}
                </div>
            </div>

            {/* ── Vertical line accent (left) ── */}
            <div className="hero-decor hidden md:block absolute left-6 lg:left-10 top-1/4 h-32 w-px bg-linear-to-b from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* ── Corner brackets (bottom-left) ── */}
            <div className="hero-decor hidden lg:block absolute bottom-16 left-12 lg:left-20 pointer-events-none opacity-20">
                <div className="w-12 h-12 border-l border-b border-white" />
            </div>

            {/* ── Corner brackets (top-right) ── */}
            <div className="hero-decor hidden lg:block absolute top-16 right-[45%] pointer-events-none opacity-10">
                <div className="w-8 h-8 border-r border-t border-white" />
            </div>

            {/* ── Main content ── */}
            <div className="w-full max-w-[1920px] mx-auto relative">
                {/* Mobile layout (reference style) */}
                <div className="md:hidden min-h-dvh px-4 sm:px-6 pt-6 pb-6 flex flex-col">
                    {/* Top mini header */}
                    <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">
                                Dashboard
                            </div>
                        </div>

                        <a
                            href="#contacts"
                            className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/20 text-white/80 text-[10px] font-mono uppercase tracking-[0.25em] active:bg-white/10 transition-colors"
                        >
                            Contact
                        </a>
                    </div>

                    {/* Big stacked title */}
                    <div className="flex-1 flex items-center py-6">
                        <div className="w-full max-w-full pr-1 leading-[0.82] font-black uppercase tracking-tight text-[clamp(3.9rem,18vw,9.25rem)] sm:text-[clamp(4.8rem,20vw,9.8rem)] text-white/55 select-none">
                            <div className="max-w-full">Full</div>
                            <div className="relative max-w-full">
                                <div className="absolute left-0 top-[0.62em] h-2 w-[clamp(2.2rem,10vw,4.6rem)] bg-white/25" />
                                <div className="pl-[clamp(2.7rem,11vw,5.2rem)]">Stack</div>
                            </div>
                            <div className="max-w-full">Develop</div>
                            <div className="max-w-full">Er</div>
                        </div>
                    </div>

                    {/* Bottom about (no extra empty space) */}
                    <div className="flex items-end justify-between gap-6">
                        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
                            About
                        </div>
                        <p className="max-w-[24rem] text-xs leading-relaxed text-white/55">
                            Passionate full-stack developer crafting modern, performant web experiences from concept to
                            deployment.
                        </p>
                    </div>
                </div>

                {/* Desktop/tablet layout (existing) */}
                <div className="hidden md:block px-4 sm:px-6 md:pl-12 lg:pl-20 py-8 sm:py-12 md:py-16 lg:py-20">
                    <div className="flex flex-col space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4">
                    {/* FULL */}
                    <div className="hero-text-block group relative inline-block overflow-hidden px-4 sm:px-6 md:px-8">
                        <div className="pointer-events-none absolute inset-0 origin-left scale-x-0 opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:opacity-100 will-change-[transform,opacity]">
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                            <div className="absolute right-0 top-0 h-full w-px bg-white/60" />
                        </div>
                        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-linear-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100" />
                        <div className="pointer-events-none absolute -inset-2 sm:-inset-3 md:-inset-4 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 will-change-[opacity]">
                            <div className="absolute inset-0 rounded-md bg-white/10 blur-xl" />
                        </div>
                        <div className="relative text-[clamp(3.5rem,11vw,12rem)] font-black uppercase leading-[0.9] sm:leading-none select-none transition-[letter-spacing,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 sm:group-hover:translate-x-2 md:group-hover:translate-x-3 group-hover:tracking-[0.03em] sm:group-hover:tracking-[0.04em] md:group-hover:tracking-[0.06em] will-change-transform">
                            <span
                                className="absolute inset-0 opacity-30 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0"
                                style={{
                                    WebkitTextStroke: "2px #ffffff",
                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",
                                }}
                            >
                                FULL
                            </span>
                            <span className="opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-white">
                                FULL
                            </span>
                        </div>
                    </div>

                    {/* STACK */}
                    <div className="hero-text-block group relative inline-block overflow-hidden px-4 sm:px-6 md:px-8">
                        <div className="pointer-events-none absolute inset-0 origin-left scale-x-0 opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:opacity-100 will-change-[transform,opacity]">
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                            <div className="absolute right-0 top-0 h-full w-px bg-white/60" />
                        </div>
                        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-linear-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100" />
                        <div className="pointer-events-none absolute -inset-2 sm:-inset-3 md:-inset-4 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 will-change-[opacity]">
                            <div className="absolute inset-0 rounded-md bg-white/10 blur-xl" />
                        </div>
                        <div className="relative text-[clamp(3.5rem,11vw,12rem)] font-black uppercase leading-[0.9] sm:leading-none select-none transition-[letter-spacing,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 sm:group-hover:translate-x-2 md:group-hover:translate-x-3 group-hover:tracking-[0.03em] sm:group-hover:tracking-[0.04em] md:group-hover:tracking-[0.06em] will-change-transform">
                            <span
                                className="absolute inset-0 opacity-30 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0"
                                style={{
                                    WebkitTextStroke: "2px #ffffff",
                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",
                                }}
                            >
                                STACK
                            </span>
                            <span className="opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-white">
                                STACK
                            </span>
                        </div>
                    </div>

                    {/* Code snippet (desktop) */}
                    <div className="hero-code-snippet hidden xl:block absolute xl:top-[calc((3.5rem*0.9)+0.25rem+3.5rem+0.25rem)] xl:right-20 font-mono text-sm leading-relaxed">
                        <div className="text-white/50">const <span className="text-white/70">identity</span> = &#123;</div>
                        <div className="pl-4 text-white/40">
                            name: <span className="text-white/60">&quot;Roman Caseres&quot;</span>,
                        </div>
                        <div className="text-white/50">&#125;;</div>
                        <div className="mt-2 text-white/50">
                            const <span className="text-white/70">stack</span> = &#123;
                        </div>
                        <div className="pl-4 text-white/40">
                            frontend: <span className="text-white/60">[&quot;React&quot;, &quot;TypeScript&quot;, &quot;Tailwind&quot;]</span>,
                        </div>
                        <div className="pl-4 text-white/40">
                            backend: <span className="text-white/60">[&quot;Laravel&quot;, &quot;PHP&quot;, &quot;MySQL&quot;]</span>,
                        </div>
                        <div className="pl-4 text-white/40">
                            tools: <span className="text-white/60">[&quot;Git&quot;, &quot;Vite&quot;, &quot;Figma&quot;]</span>,
                        </div>
                        <div className="text-white/50">&#125;;</div>
                    </div>

                    {/* DEVELOPER */}
                    <h1 className="hero-text-block text-[clamp(2.5rem,9vw,12rem)] font-black uppercase leading-[0.9] sm:leading-none text-gray-400 px-4 sm:px-6 md:px-8">
                        <span className="sr-only">Full Stack </span>DEVELOPER
                    </h1>

                    {/* Description & CTA — visible only when code snippet is hidden */}
                    <div className="hero-mobile-desc xl:hidden mt-6 sm:mt-8 px-4 sm:px-6 md:px-8 space-y-6">
                        <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                            Passionate full-stack developer crafting modern, performant, and visually stunning web experiences from concept to deployment.
                        </p>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <a
                                href="#contacts"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold text-sm sm:text-base rounded-md hover:bg-gray-200 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                Contact Me
                            </a>
                            <a
                                href="https://github.com/mano-sudo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold text-sm sm:text-base rounded-md hover:bg-white/10 transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* ── Bottom bar with metadata ── */}
            <div className="hero-bottom-bar hidden md:flex absolute bottom-6 sm:bottom-8 left-0 right-0 px-4 sm:px-6 md:px-12 lg:px-20 items-center justify-between pointer-events-none">
                {/* Available badge */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/40 font-medium">Available for work</span>
                </div>

                {/* Live clock */}
                <div className="hidden sm:flex items-center gap-3 text-white/30 font-mono text-xs tracking-wider">
                    <span>LOCAL</span>
                    <span className="text-white/50">{currentTime}</span>
                </div>

                {/* Scroll indicator */}
                <div className="flex items-center gap-2 text-white/30">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">Scroll</span>
                    <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
                        <div className="w-0.5 h-2 bg-white/40 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* ── Horizontal divider at very bottom ── */}
            <div className="hero-decor absolute bottom-0 left-4 sm:left-6 md:left-12 lg:left-20 right-4 sm:right-6 md:right-12 lg:right-20 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
        </section>
    );
}
