"use client";

import Image from "next/image";
import { LazyMotion, domAnimation } from "framer-motion";
import {
    HeroAvailability,
    HeroBackdrop,
    HeroEnterBlock,
    HeroEnterSplitRow,
    HeroExploreLink,
    HeroInteractivePortrait,
    HeroMotionRoot,
    HeroTechChips,
} from "./hero-interactive";

export default function Hero() {
    return (
        <LazyMotion features={domAnimation} strict>
        <section
            data-shoot-target="1"
            data-shoot-granularity="char"
            className="relative isolate w-full overflow-hidden bg-background contain-layout pb-8 min-h-[calc(100svh-var(--app-header-h,88px))] sm:min-h-[calc(72dvh-var(--app-header-h,88px))] sm:pb-10 md:min-h-0 md:pb-14 lg:pb-6 xl:flex xl:min-h-[calc(100svh-var(--app-header-h,88px))] xl:flex-col xl:justify-center xl:pb-8"
            style={{
                marginTop: "var(--app-header-h, 88px)",
            }}
        >
            <HeroBackdrop />
            <div className="relative z-10 mx-auto h-full min-h-0 w-full max-w-[1920px] px-4 sm:px-6 md:h-auto md:px-10 lg:px-14 xl:px-20">
                {/* Mobile layout */}
                <HeroMotionRoot className="md:hidden flex h-full flex-col justify-center gap-4 py-4 sm:py-6">
                    <HeroEnterSplitRow
                        left={
                            <div className="font-mono uppercase tracking-[0.28em] text-[10px] text-black/70">
                                <div>01/</div>
                                <div className="mt-2 text-black/55 tracking-[0.26em]">
                                    From Philippines with
                                    <br />
                                    Love
                                </div>
                            </div>
                        }
                        right={<HeroAvailability />}
                    />

                    <HeroEnterBlock drift="center">
                        <h1
                            data-shoot-target="1"
                            data-shoot-granularity="char"
                            className="text-black font-black uppercase leading-[0.9] tracking-[-0.05em] text-[clamp(2.6rem,11vw,4.6rem)]"
                        >
                            Software
                            <br />
                            Developer
                        </h1>
                    </HeroEnterBlock>

                    <HeroEnterBlock drift="left">
                        <HeroTechChips />
                    </HeroEnterBlock>

                    <HeroEnterBlock drift="center">
                        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/70 mb-2">
                            Dr &amp; Me
                        </div>
                        <HeroInteractivePortrait frameClassName="w-full aspect-video">
                            <Image
                                src="/heropic.svg"
                                alt="Portrait"
                                width={1200}
                                height={675}
                                sizes="100vw"
                                priority
                                fetchPriority="high"
                                className="h-full w-full object-cover"
                            />
                        </HeroInteractivePortrait>
                    </HeroEnterBlock>

                    <HeroEnterBlock drift="right">
                        <div className="text-right">
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
                    </HeroEnterBlock>

                    <HeroEnterBlock drift="right">
                        <div
                            data-shoot-target="1"
                            data-shoot-granularity="char"
                            className="text-right text-black font-black uppercase leading-[0.88] tracking-[-0.06em] text-[clamp(3.1rem,13vw,5.2rem)]"
                        >
                            Roman
                            <br />
                            Caseres
                        </div>
                    </HeroEnterBlock>

                    <HeroEnterBlock>
                        <div className="text-right text-[10px] font-mono uppercase tracking-[0.26em] text-black/55">
                            {new Date().getFullYear()} Portfolio
                        </div>
                    </HeroEnterBlock>

                    <HeroEnterBlock>
                        <div className="grid grid-cols-12 items-start gap-4">
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
                    </HeroEnterBlock>

                    <HeroEnterBlock className="flex justify-end" drift="right">
                        <HeroExploreLink />
                    </HeroEnterBlock>

                    <HeroEnterBlock drift="right">
                        <div className="text-right text-[10px] font-mono uppercase tracking-[0.28em] text-black/55">
                            Design &amp; code by Roman
                        </div>
                    </HeroEnterBlock>
                </HeroMotionRoot>

                {/* Desktop/tablet layout */}
                <HeroMotionRoot className="hidden flex-col gap-6 py-6 md:flex md:justify-start md:gap-8 md:py-8 lg:gap-10 lg:py-10">
                    {/* Top row */}
                    <div className="grid grid-cols-12 items-start gap-x-6 gap-y-10">
                        <HeroEnterBlock className="col-span-12 md:col-span-5 md:order-2">
                            <div className="flex flex-col items-end gap-3 md:items-end">
                                <HeroAvailability />
                                <div className="font-mono uppercase tracking-[0.28em] text-[10px] text-black/70 md:text-right">
                                    <div>01/</div>
                                    <div className="mt-2 text-black/55 tracking-[0.26em]">
                                        From Philippines with
                                        <br />
                                        Love
                                    </div>
                                </div>
                            </div>
                        </HeroEnterBlock>

                        <HeroEnterBlock className="col-span-12 md:col-span-7 md:order-1 md:text-left" drift="left">
                            <h1
                                data-shoot-target="1"
                                data-shoot-granularity="char"
                                className="text-black font-black uppercase leading-[0.88] tracking-[-0.04em] text-[clamp(2.8rem,6.6vw,6.6rem)]"
                            >
                                Software
                                <br />
                                Developer
                            </h1>
                            <div className="mt-4">
                                <HeroTechChips />
                            </div>
                        </HeroEnterBlock>
                    </div>

                    {/* Bottom row */}
                    <div className="grid grid-cols-12 items-start gap-x-6 gap-y-8">
                        <HeroEnterBlock className="col-span-12 md:col-span-5 md:order-2" drift="right">
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

                            <div className="mt-6 flex justify-end md:justify-end">
                                <HeroExploreLink />
                            </div>
                        </HeroEnterBlock>

                        <HeroEnterBlock className="col-span-12 md:col-span-7 md:order-1" drift="left">
                            <div className="md:flex md:justify-start">
                                <div className="w-full max-w-[720px]">
                                    <HeroInteractivePortrait frameClassName="w-full aspect-16/6">
                                        <Image
                                            src="/heropic.svg"
                                            alt="Portrait"
                                            width={1600}
                                            height={600}
                                            sizes="(max-width: 768px) 100vw, 640px"
                                            priority
                                            fetchPriority="high"
                                            className="h-full w-full object-cover"
                                        />
                                    </HeroInteractivePortrait>

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
                        </HeroEnterBlock>
                    </div>
                </HeroMotionRoot>
            </div>
        </section>
        </LazyMotion>
    );
}
