"use client";

import Image from "next/image";

export default function Hero() {
    return (
        <section
            data-shoot-target="1"
            data-shoot-granularity="char"
            className="relative w-full bg-[#f4f3ee] overflow-hidden min-h-[calc(100svh-var(--app-header-h,88px))] sm:h-auto sm:min-h-[calc(72dvh-var(--app-header-h,88px))] md:h-auto md:min-h-[calc(64dvh-var(--app-header-h,88px))] lg:h-auto lg:min-h-[calc(58dvh-var(--app-header-h,88px))] xl:h-auto xl:min-h-[calc(100svh-var(--app-header-h,88px))]"
            style={{
                marginTop: "var(--app-header-h, 88px)",
            }}
        >
            <div className="mx-auto h-full w-full max-w-[1920px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
                {/* Mobile layout */}
                <div className="md:hidden h-full flex flex-col justify-center gap-4 py-4 sm:py-6">
                    {/* Top */}
                    <div>
                        <div className="flex items-start justify-between gap-6">
                            <div className="font-mono uppercase tracking-[0.28em] text-[10px] text-black/70">
                                <div>01/</div>
                                <div className="mt-2 text-black/55 tracking-[0.26em]">
                                    From Philippines with
                                    <br />
                                    Love
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 sm:mt-5">
                            <h1
                                data-shoot-target="1"
                                data-shoot-granularity="char"
                                className="text-black font-black uppercase leading-[0.9] tracking-[-0.05em] text-[clamp(2.6rem,11vw,4.6rem)]"
                            >
                                Software
                                <br />
                                Developer
                            </h1>
                        </div>
                    </div>

                    {/* Middle */}
                    <div className="mt-2 sm:mt-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/70 mb-2">
                            Dr &amp; Me
                        </div>
                        <div className="relative w-full aspect-video overflow-hidden border border-black/20 bg-black/5">
                            <Image
                                src="/heropic.svg"
                                alt="Portrait"
                                width={1200}
                                height={675}
                                sizes="100vw"
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="pt-2 sm:pt-4">
                        <div className="mb-4 text-right">
                            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-black/72">
                                Building fast, clean web apps
                                <br />
                                for real users.
                            </p>
                            <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.24em] text-black/55">
                                Open for freelance / full-time
                                <br />
                                Based in Quezon City, PH
                            </div>
                        </div>

                        <div
                            data-shoot-target="1"
                            data-shoot-granularity="char"
                            className="text-right text-black font-black uppercase leading-[0.88] tracking-[-0.06em] text-[clamp(3.1rem,13vw,5.2rem)]"
                        >
                            Roman
                            <br />
                            Caseres
                        </div>
                        <div className="mt-4 text-right text-[10px] font-mono uppercase tracking-[0.26em] text-black/55">
                            {new Date().getFullYear()} Portfolio
                        </div>

                        <div className="mt-5 grid grid-cols-12 items-start gap-4">
                            <div className="col-span-2 text-black/70 text-lg leading-none select-none">
                                <span aria-hidden="true">-&gt;</span>
                            </div>
                            <div className="col-span-10">
                                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/70">
                                    I based in
                                    <br />
                                    Quezon City,
                                    <br />
                                    Passionate in architect &amp; UI
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-right text-[10px] font-mono uppercase tracking-[0.28em] text-black/55">
                            Design &amp; code by Roman
                        </div>
                    </div>
                </div>

                {/* Desktop/tablet layout */}
                <div className="hidden md:flex h-full flex-col justify-center gap-6 md:gap-8 lg:gap-10 py-6 md:py-8 lg:py-10">
                    {/* Top row */}
                    <div className="grid grid-cols-12 gap-y-10 gap-x-6 items-start">
                        {/* Top-left meta */}
                        <div className="col-span-12 md:col-span-5 md:order-2">
                            <div className="font-mono uppercase tracking-[0.28em] text-[10px] text-black/70 md:text-right">
                                <div>01/</div>
                                <div className="mt-2 text-black/55 tracking-[0.26em]">
                                    From Philippines with
                                    <br />
                                    Love
                                </div>
                            </div>
                        </div>

                        {/* Top-right headline */}
                        <div className="col-span-12 md:col-span-7 md:order-1 md:text-left">
                            <h1
                                data-shoot-target="1"
                                data-shoot-granularity="char"
                                className="text-black font-black uppercase leading-[0.88] tracking-[-0.04em] text-[clamp(2.8rem,6.6vw,6.6rem)]"
                            >
                                Software
                                <br />
                                Developer
                            </h1>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="grid grid-cols-12 gap-y-8 gap-x-6 items-start">
                        {/* Bottom-left name */}
                        <div className="col-span-12 md:col-span-5 md:order-2">
                            <div className="mb-8 max-w-104 md:ml-auto md:text-right">
                                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-black/72">
                                    Building fast, clean web apps
                                    <br />
                                    for real users.
                                </p>
                                <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.24em] text-black/55">
                                    Open for freelance / full-time
                                    <br />
                                    Based in Quezon City, PH
                                </div>
                            </div>

                            <div
                                data-shoot-target="1"
                                data-shoot-granularity="char"
                                className="text-black font-black uppercase leading-[0.88] tracking-[-0.05em] text-[clamp(3.4rem,6.7vw,6.4rem)] md:text-right"
                            >
                                Roman
                                <br />
                                Caseres
                            </div>

                            <div className="mt-8 text-[10px] font-mono uppercase tracking-[0.26em] text-black/55 md:text-right">
                                {new Date().getFullYear()} Portfolio
                            </div>
                        </div>

                        {/* Right-side media + bio */}
                        <div className="col-span-12 md:col-span-7 md:order-1">
                            <div className="md:flex md:justify-start">
                                <div className="w-full max-w-[720px]">
                                    <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/70 mb-2">
                                        Dr &amp; Me
                                    </div>

                                    {/* Image frame */}
                                    <div className="relative w-full aspect-16/6 overflow-hidden border border-black/20 bg-black/5">
                                        <Image
                                            src="/heropic.svg"
                                            alt="Portrait"
                                            width={1600}
                                            height={600}
                                            sizes="(max-width: 768px) 100vw, 640px"
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Bio line */}
                                    <div className="mt-6 grid grid-cols-12 items-start gap-4">
                                        <div className="col-span-2 text-black/70 text-lg leading-none select-none">
                                            <span aria-hidden="true">-&gt;</span>
                                        </div>
                                        <div className="col-span-10">
                                            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/70">
                                                I based in
                                                <br />
                                                Quezon City,
                                                <br />
                                                Passionate in architect &amp; UI
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 text-left text-[10px] font-mono uppercase tracking-[0.28em] text-black/55">
                                        Design &amp; code by Roman
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
