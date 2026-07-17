"use client";

import * as React from "react";
import { gsap } from "gsap";
import {
    ensureGlitchAudioRunning,
    playGlitchSound,
} from "@/app/utils/play-paintball-shot-sound";
import {
    notifyBlastModeSubscribers,
    BLAST_MODE_STORAGE_KEY,
} from "@/app/utils/blast-mode-store";

const BLAST_SCROLL_INTERACTIVE_SEL = "[data-blast-scroll-interactive]";

type GlitchVisualBlock = {
    left: number;
    top: number;
    width: number;
    height: number;
    color: string;
};

type GlitchVisual = {
    id: number;
    x: number;
    y: number;
    blocks: GlitchVisualBlock[];
};

/** True only if (x,y) is over a non-empty text character. */
function getTextNodeAtPoint(x: number, y: number): Text | null {
    if (typeof document === "undefined") return null;
    try {
        const doc = document as Document & {
            caretRangeFromPoint?: (nx: number, ny: number) => Range | null;
            caretPositionFromPoint?: (nx: number, ny: number) => CaretPosition | null;
        };
        if (typeof doc.caretRangeFromPoint === "function") {
            const range = doc.caretRangeFromPoint(x, y);
            if (range?.startContainer?.nodeType === Node.TEXT_NODE) {
                return range.startContainer as Text;
            }
            return null;
        }
        if (typeof doc.caretPositionFromPoint === "function") {
            const pos = doc.caretPositionFromPoint(x, y);
            if (pos?.offsetNode?.nodeType === Node.TEXT_NODE) {
                return pos.offsetNode as Text;
            }
            return null;
        }
    } catch {
        return null;
    }
    return null;
}

function textNodeHasVisibleChar(text: Text): boolean {
    return (text.textContent ?? "").trim().length > 0;
}

function pickInnerBlastTarget(raw: Element | null): HTMLElement | null {
    let el: Element | null = raw;
    while (el && el instanceof HTMLElement) {
        if (el.matches("[data-blast-ui]")) return null;
        if (el.hasAttribute("data-blast-target")) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

function pickSemanticTextTarget(raw: Element | null): HTMLElement | null {
    let el: Element | null = raw;
    while (el && el instanceof HTMLElement) {
        if (el.matches("[data-blast-ui]")) return null;
        if (el.matches("h1,h2,h3,h4,h5,h6,p,span,a,button,li,br,article,img")) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

function pickInnerBlastTargetFromTextNode(text: Text): HTMLElement | null {
    let el: HTMLElement | null = text.parentElement;
    while (el) {
        if (el.matches("[data-blast-ui]")) return null;
        if (el.hasAttribute("data-blast-target")) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

function pickHitWord(x: number, y: number, raw: Element | null): HTMLElement | null {
    if (!raw) return null;
    if (raw.closest("[data-blast-ui]")) return null;

    const target = pickInnerBlastTarget(raw) ?? pickSemanticTextTarget(raw);
    if (!target || target.closest("[data-blast-ui]")) return null;

    if (target.tagName === "IMG") {
        const rect = target.getBoundingClientRect();
        const inside =
            x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        return inside ? target : null;
    }

    if (raw instanceof HTMLElement && raw.tagName === "IMG") {
        const rect = raw.getBoundingClientRect();
        const inside =
            x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        return inside ? raw : null;
    }

    const textAtPoint = getTextNodeAtPoint(x, y);
    if (!textAtPoint || !textNodeHasVisibleChar(textAtPoint)) {
        const imgs = target.querySelectorAll("img");
        for (const im of imgs) {
            const r = im.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                return im;
            }
        }
        return target;
    }

    return pickInnerBlastTargetFromTextNode(textAtPoint) ?? target;
}

function readInitialState(): boolean {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem(BLAST_MODE_STORAGE_KEY);
    return raw === "on";
}

function writeStateToStorage(isOn: boolean): void {
    try {
        window.localStorage.setItem(BLAST_MODE_STORAGE_KEY, isOn ? "on" : "off");
        notifyBlastModeSubscribers();
    } catch {
        // ignore
    }
}

export default function FloatingBlastToggle(): React.JSX.Element {
    const [isOn, setIsOn] = React.useState<boolean>(false);
    const [showGlitchCursor, setShowGlitchCursor] = React.useState<boolean>(false);
    const [dateTimeText, setDateTimeText] = React.useState<string>("");
    const [cursorX, setCursorX] = React.useState<number>(0);
    const [cursorY, setCursorY] = React.useState<number>(0);
    const [glitches, setGlitches] = React.useState<GlitchVisual[]>([]);
    const [isGlobalGlitching, setIsGlobalGlitching] = React.useState<boolean>(false);
    const [hoverBlastControls, setHoverBlastControls] = React.useState<boolean>(false);

    React.useEffect(() => {
        setIsOn(readInitialState());
    }, []);

    React.useEffect(() => {
        if (!isOn) setHoverBlastControls(false);
    }, [isOn]);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const apply = (matches: boolean) => setShowGlitchCursor(matches);
        apply(mediaQuery.matches);
        const onChange = (event: MediaQueryListEvent) => apply(event.matches);
        mediaQuery.addEventListener("change", onChange);
        return () => mediaQuery.removeEventListener("change", onChange);
    }, []);

    React.useEffect(() => {
        const format = () => {
            const now = new Date();
            const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
            const day = days[now.getDay()] ?? "DAY";
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "P.M" : "A.M";
            const displayHours = hours % 12 || 12;
            setDateTimeText(`${day} ${displayHours}:${minutes} ${ampm}`);
        };

        format();
        const id = window.setInterval(format, 1000);
        return () => window.clearInterval(id);
    }, []);

    const toggle = React.useCallback(() => {
        const next = !isOn;
        setIsOn(next);
        writeStateToStorage(next);
        if (next) {
            void ensureGlitchAudioRunning();
        }
    }, [isOn]);

    // Cleanup glitches on disable
    React.useEffect(() => {
        if (!isOn) {
            setGlitches([]);
            setIsGlobalGlitching(false);
        }
    }, [isOn]);

    const spawnGlitchVisual = (x: number, y: number) => {
        const id = Date.now() + Math.random();
        const blocksCount = 5 + Math.floor(Math.random() * 5);
        const colors = ["#00ffff", "#ff0055", "#00ff66", "#ffff00", "#ffffff"];
        const blocks = Array.from({ length: blocksCount }).map(() => {
            const offsetRange = 60;
            return {
                left: (Math.random() - 0.5) * offsetRange,
                top: (Math.random() - 0.5) * offsetRange,
                width: 15 + Math.random() * 75,
                height: 2 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)] ?? "#ffffff",
            };
        });
        setGlitches((prev) => [...prev.slice(-8), { id, x, y, blocks }]);
        setTimeout(() => {
            setGlitches((prev) => prev.filter((g) => g.id !== id));
        }, 350);
    };

    const triggerGlobalGlitch = () => {
        setIsGlobalGlitching(true);
        setTimeout(() => setIsGlobalGlitching(false), 200);

        const mainEl = document.querySelector("main") as HTMLElement | null;
        if (mainEl) {
            gsap.timeline()
                .to(mainEl, {
                    x: () => gsap.utils.random(-10, 10),
                    y: () => gsap.utils.random(-8, 8),
                    skewX: () => gsap.utils.random(-1.5, 1.5),
                    filter: "contrast(170%) hue-rotate(25deg) saturate(150%)",
                    duration: 0.05,
                })
                .to(mainEl, {
                    x: () => gsap.utils.random(-5, 5),
                    y: () => gsap.utils.random(-4, 4),
                    skewX: () => gsap.utils.random(-0.8, 0.8),
                    filter: "contrast(130%) hue-rotate(-15deg) invert(5%)",
                    duration: 0.05,
                })
                .to(mainEl, {
                    x: 0,
                    y: 0,
                    skewX: 0,
                    filter: "none",
                    clearProps: "transform,filter",
                    duration: 0.08,
                });
        }
    };

    const scrambleTextNode = (textNode: Text) => {
        const anyNode = textNode as unknown as { __scrambling?: boolean };
        if (anyNode.__scrambling) return;
        anyNode.__scrambling = true;

        const originalText = textNode.nodeValue ?? "";
        if (!originalText.trim()) {
            anyNode.__scrambling = false;
            return;
        }

        const duration = 18; // animation frames
        let currentStep = 0;
        const glitchChars = "█▓▒░╬╠╣▀▄$#@%!&?*+=<>[]{}~";

        const interval = setInterval(() => {
            currentStep++;
            if (currentStep >= duration) {
                textNode.nodeValue = originalText;
                anyNode.__scrambling = false;
                clearInterval(interval);
            } else {
                const scrambled = originalText
                    .split("")
                    .map((char) => {
                        if (char === " " || char === "\n") return char;
                        const threshold = currentStep / duration;
                        return Math.random() < threshold
                            ? char
                            : glitchChars[Math.floor(Math.random() * glitchChars.length)] ?? "█";
                    })
                    .join("");
                textNode.nodeValue = scrambled;
            }
        }, 25);
    };

    const glitchElementTransform = (target: HTMLElement) => {
        if (target.dataset.glitching === "1") return;
        target.dataset.glitching = "1";

        gsap.timeline({
            onComplete: () => {
                delete target.dataset.glitching;
            },
        })
            .to(target, {
                x: () => gsap.utils.random(-12, 12),
                y: () => gsap.utils.random(-8, 8),
                skewX: () => gsap.utils.random(-15, 15),
                opacity: 0.75,
                duration: 0.05,
                ease: "power1.inOut",
            })
            .to(target, {
                x: () => gsap.utils.random(-6, 6),
                y: () => gsap.utils.random(-4, 4),
                skewX: () => gsap.utils.random(-8, 8),
                opacity: 0.85,
                duration: 0.05,
                ease: "power1.inOut",
            })
            .to(target, {
                x: 0,
                y: 0,
                skewX: 0,
                opacity: 1,
                clearProps: "transform,opacity",
                duration: 0.08,
            });
    };

    React.useEffect(() => {
        if (!isOn) return;

        const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            setCursorX(event.clientX);
            setCursorY(event.clientY);
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
        };
    }, [isOn]);

    React.useEffect(() => {
        if (!isOn) return;

        const onSelectStart = (event: Event) => {
            const target = event.target as Element | null;
            if (target?.closest("[data-blast-ui]")) return;
            if (target?.closest(BLAST_SCROLL_INTERACTIVE_SEL)) return;
            event.preventDefault();
        };

        const onPointerDown = (event: PointerEvent) => {
            if (!event.isPrimary) return;
            if (event.pointerType === "mouse" && event.button !== 0) return;

            const targetEl = event.target as Element | null;
            if (targetEl?.closest("[data-blast-ui]")) return;
            if (targetEl?.closest(BLAST_SCROLL_INTERACTIVE_SEL)) return;

            playGlitchSound();
            spawnGlitchVisual(event.clientX, event.clientY);
            triggerGlobalGlitch();

            const target = pickHitWord(event.clientX, event.clientY, targetEl);
            if (target) {
                const textNode = getTextNodeAtPoint(event.clientX, event.clientY);
                if (textNode && textNodeHasVisibleChar(textNode)) {
                    scrambleTextNode(textNode);
                } else {
                    glitchElementTransform(target);
                }
            }
        };

        document.addEventListener("selectstart", onSelectStart);
        document.addEventListener("dragstart", onSelectStart);
        window.addEventListener("pointerdown", onPointerDown);

        return () => {
            document.removeEventListener("selectstart", onSelectStart);
            document.removeEventListener("dragstart", onSelectStart);
            window.removeEventListener("pointerdown", onPointerDown);
        };
    }, [isOn]);

    React.useEffect(() => {
        const cursorClassName = "blast-cursor-hidden";
        const blastModeClassName = "blast-mode-active";
        const touchUiClassName = "blast-mode-touch-ui";

        if (isOn) {
            document.documentElement.classList.add(blastModeClassName);
            document.body.classList.add(blastModeClassName);
            const isTouchCapable =
                typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
            if (isTouchCapable) {
                document.documentElement.classList.add(touchUiClassName);
                document.body.classList.add(touchUiClassName);
            }
        } else {
            document.documentElement.classList.remove(blastModeClassName);
            document.body.classList.remove(blastModeClassName);
            document.documentElement.classList.remove(touchUiClassName);
            document.body.classList.remove(touchUiClassName);
        }

        const hideSystemCursor = isOn && showGlitchCursor && !hoverBlastControls;
        if (hideSystemCursor) {
            document.documentElement.classList.add(cursorClassName);
            document.body.classList.add(cursorClassName);
        } else {
            document.documentElement.classList.remove(cursorClassName);
            document.body.classList.remove(cursorClassName);
        }

        return () => {
            document.documentElement.classList.remove(cursorClassName);
            document.body.classList.remove(cursorClassName);
            document.documentElement.classList.remove(blastModeClassName);
            document.body.classList.remove(blastModeClassName);
            document.documentElement.classList.remove(touchUiClassName);
            document.body.classList.remove(touchUiClassName);
        };
    }, [isOn, showGlitchCursor, hoverBlastControls]);

    return (
        <>
            {/* Global Glitch Scanlines CRT Overlay */}
            {isGlobalGlitching && (
                <div
                    className="fixed inset-0 z-9999 pointer-events-none bg-glitch-overlay mix-blend-overlay"
                    aria-hidden="true"
                />
            )}

            {/* Localized Glitch Visual Burst Blocks */}
            {glitches.length > 0 && (
                <div className="fixed inset-0 z-9998 pointer-events-none" aria-hidden="true">
                    {glitches.map((glitch) => (
                        <div
                            key={glitch.id}
                            className="absolute"
                            style={{ left: glitch.x, top: glitch.y }}
                        >
                            {glitch.blocks.map((block, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-glitch-block-fade"
                                    style={{
                                        left: block.left,
                                        top: block.top,
                                        width: block.width,
                                        height: block.height,
                                        backgroundColor: block.color,
                                        transform: "translate(-50%, -50%)",
                                        boxShadow: `0 0 10px ${block.color}`,
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Trailing Chromatic Ghost Cursor */}
            {isOn && showGlitchCursor && !hoverBlastControls && (
                <div
                    className="fixed z-9999 pointer-events-none"
                    style={{ left: cursorX, top: cursorY, transform: "translate(-50%, -50%)" }}
                    aria-hidden="true"
                    data-blast-ui="1"
                >
                    {/* Cyan Pointer (left lagging ghost) */}
                    <div
                        className="absolute h-3 w-3 bg-[#00ffff] opacity-80"
                        style={{
                            transform: "translate(-8px, -8px)",
                            transition: "transform 0.04s ease-out",
                            boxShadow: "0 0 8px #00ffff",
                        }}
                    />
                    {/* Magenta Pointer (right lagging ghost) */}
                    <div
                        className="absolute h-3 w-3 bg-[#ff0055] opacity-80"
                        style={{
                            transform: "translate(8px, 8px)",
                            transition: "transform 0.08s ease-out",
                            boxShadow: "0 0 8px #ff0055",
                        }}
                    />
                    {/* Center White/Black Pixel Cursor */}
                    <div className="absolute h-3.5 w-3.5 border-2 border-foreground bg-background shadow-md" />
                </div>
            )}

            {/* Bottom HUD */}
            <div className="fixed bottom-5 inset-x-0 z-9999 px-6 pointer-events-none" data-blast-ui="1">
                <div className="flex items-center justify-between">
                    {/* Left: toggle */}
                    <div
                        className="pointer-events-auto cursor-pointer"
                        data-blast-controls="1"
                        onMouseEnter={() => setHoverBlastControls(true)}
                        onMouseLeave={() => setHoverBlastControls(false)}
                    >
                        <button
                            type="button"
                            onClick={toggle}
                            className={[
                                "group flex cursor-pointer items-center gap-3",
                                "rounded-full backdrop-blur-md",
                                "px-4 py-2",
                                "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)]",
                                "transition-[border-color,background-color] duration-200",
                                isOn ? "border-border bg-card" : "",
                            ].join(" ")}
                            aria-pressed={isOn}
                            aria-label="Toggle glitch mode"
                        >
                            <span
                                aria-hidden="true"
                                className={[
                                    "relative inline-flex h-5 w-9 items-center rounded-full",
                                    "border border-border bg-transparent",
                                    "transition-[border-color,background-color] duration-200",
                                    isOn ? "bg-muted border-foreground/35" : "",
                                ].join(" ")}
                            >
                                <span
                                    className={[
                                        "absolute left-0.5 top-1/2 -translate-y-1/2",
                                        "h-4 w-4 rounded-full bg-foreground",
                                        "transition-transform duration-200 ease-out",
                                        isOn ? "translate-x-4" : "translate-x-0",
                                    ].join(" ")}
                                />
                            </span>

                            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-foreground/80 select-none">
                                Glitch
                            </span>
                        </button>
                    </div>

                    <div />

                    {/* Right: date/time */}
                    <div className="pointer-events-none">
                        <div className="rounded-full backdrop-blur-md px-4 py-2">
                            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-foreground/70 select-none">
                                {dateTimeText}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
