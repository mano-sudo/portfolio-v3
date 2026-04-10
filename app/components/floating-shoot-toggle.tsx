"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";

type ShootToggleState = "on" | "off";

const STORAGE_KEY = "shoot-toggle-state";

const SPLAT_FADE_MS = 520;
const SPLAT_TOTAL_LIFETIME_MS = 3200;
const SPLAT_VISIBLE_MS = SPLAT_TOTAL_LIFETIME_MS - SPLAT_FADE_MS;

function GunLoadingFallback(): React.JSX.Element {
    return (
        <div className="h-64 w-[min(92vw,30rem)] sm:h-80 sm:w-xl md:h-96 md:w-176 overflow-visible flex items-end justify-center">
            <div className="h-60 w-[min(88vw,24rem)] sm:h-72 sm:w-md md:h-88 md:w-xl flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
            </div>
        </div>
    );
}

const GunViewer = dynamic(() => import("./gun-viewer"), {
    ssr: false,
    loading: () => <GunLoadingFallback />,
});

type PaintSplat = {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    hue: number;
    saturation: number;
    lightness: number;
    exiting?: boolean;
};

function prepareShootWords(element: HTMLElement): void {
    if (element.dataset.shootPrepared === "1") return;
    if (element.closest("[data-shoot-ui]")) return;
    if (element.classList.contains("shoot-word")) return;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null = walker.nextNode();

    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text;
            if (textNode.textContent && textNode.textContent.trim().length > 0) {
                textNodes.push(textNode);
            }
        }
        node = walker.nextNode();
    }

    const splitByChar =
        element.dataset.shootGranularity === "char" ||
        element.tagName === "H1" ||
        element.tagName === "H2";

    textNodes.forEach((textNode) => {
        const text = textNode.textContent ?? "";
        const parts = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                fragment.appendChild(document.createTextNode(part));
                return;
            }

            if (splitByChar && part.length > 1) {
                [...part].forEach((char) => {
                    const charSpan = document.createElement("span");
                    charSpan.textContent = char;
                    charSpan.className = "shoot-word inline-block";
                    fragment.appendChild(charSpan);
                });
                return;
            }

            const wordSpan = document.createElement("span");
            wordSpan.textContent = part;
            wordSpan.className = "shoot-word inline-block";
            fragment.appendChild(wordSpan);
        });

        textNode.parentNode?.replaceChild(fragment, textNode);
    });

    element.dataset.shootPrepared = "1";
}

/** True only if (x,y) is over a non-empty text character (not padding / empty layout). */
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

function pickHitWord(x: number, y: number, raw: Element | null): HTMLElement | null {
    if (!raw) return null;
    if (raw.closest("[data-shoot-ui]")) return null;

    const target = raw.closest<HTMLElement>(
        "[data-shoot-target],h1,h2,h3,h4,h5,h6,p,span,a,button,li,br,img,div,article"
    );
    if (!target || target.closest("[data-shoot-ui]")) return null;

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

    prepareShootWords(target);

    const textAtPoint = getTextNodeAtPoint(x, y);
    if (!textAtPoint || !textNodeHasVisibleChar(textAtPoint)) {
        const imgs = target.querySelectorAll("img");
        for (const im of imgs) {
            const r = im.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                return im;
            }
        }
        return null;
    }

    let node: Node | null = textAtPoint.parentElement;
    while (node) {
        if (node instanceof HTMLElement && node.classList.contains("shoot-word")) {
            if (node.closest("[data-shoot-ui]")) return null;
            return node;
        }
        node = node.parentElement;
    }

    return null;
}

function readInitialState(): boolean {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "on";
}

function writeStateToStorage(isOn: boolean): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, isOn ? "on" : "off");
    } catch {
        // ignore storage errors (private mode, etc.)
    }
}

export default function FloatingShootToggle(): React.JSX.Element {
    const [isOn, setIsOn] = React.useState<boolean>(false);
    const [showGunCursor, setShowGunCursor] = React.useState<boolean>(false);
    const [dateTimeText, setDateTimeText] = React.useState<string>("");
    const [aimX, setAimX] = React.useState<number>(0);
    const [aimY, setAimY] = React.useState<number>(0);
    const [cursorX, setCursorX] = React.useState<number>(0);
    const [cursorY, setCursorY] = React.useState<number>(0);
    const [splats, setSplats] = React.useState<PaintSplat[]>([]);
    const pointerRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const updateAimFromPoint = React.useCallback((x: number, y: number) => {
        setCursorX(x);
        setCursorY(y);
        pointerRef.current = { x, y };
        setAimX(Math.max(-1, Math.min(1, (x / window.innerWidth) * 2 - 1)));
        setAimY(Math.max(-1, Math.min(1, (y / window.innerHeight) * 2 - 1)));
    }, []);

    React.useEffect(() => {
        setIsOn(readInitialState());
    }, []);

    React.useEffect(() => {
        // Warm up the JS chunk so first render appears faster.
        void import("./gun-viewer");
    }, []);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const apply = (matches: boolean) => setShowGunCursor(matches);
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
        setIsOn((prev) => {
            const next = !prev;
            writeStateToStorage(next);
            return next;
        });
    }, []);

    // Fade all splats out when leaving shoot mode, then clear.
    React.useEffect(() => {
        if (isOn) return;
        setSplats((prev) => {
            if (prev.length === 0) return prev;
            return prev.map((s) => ({ ...s, exiting: true }));
        });
        const id = window.setTimeout(() => {
            setSplats([]);
        }, SPLAT_FADE_MS);
        return () => window.clearTimeout(id);
    }, [isOn]);

    // Drop half-faded splats if shoot mode is turned back on mid-fade.
    React.useEffect(() => {
        if (!isOn) return;
        setSplats((prev) => prev.filter((s) => !s.exiting));
    }, [isOn]);

    React.useEffect(() => {
        if (!isOn) return;

        setCursorX(window.innerWidth / 2);
        setCursorY(window.innerHeight / 2);

        const onPointerMove = (event: PointerEvent) => {
            // Touch drags (e.g. scrolling) must not steer the gun; only mouse/trackpad
            // tracks aim continuously, matching large-viewport behavior.
            if (event.pointerType === "touch") return;
            updateAimFromPoint(event.clientX, event.clientY);
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
        };
    }, [isOn, updateAimFromPoint]);

    React.useEffect(() => {
        if (!isOn) return;
        let firingInterval: number | null = null;
        let isHoldingPrimary = false;
        let touchStart: { x: number; y: number } | null = null;
        let touchMoved = false;
        const touchMoveThreshold = 12;

        const onSelectStart = (event: Event) => {
            const target = event.target as Element | null;
            if (target?.closest("[data-shoot-ui]")) return;
            event.preventDefault();
        };

        const fireShot = (x: number, y: number) => {
            const raw = document.elementFromPoint(x, y);
            if (raw?.closest("[data-shoot-ui]")) {
                return;
            }

            const id = Date.now() + Math.floor(Math.random() * 1000);
            const size = 26 + Math.random() * 20;
            const rotation = (Math.random() * 80) - 40;
            const palettes = [
                { min: 340, max: 360 }, // magenta/red
                { min: 8, max: 28 },    // orange
                { min: 185, max: 210 }, // cyan/blue
                { min: 265, max: 288 }, // violet
                { min: 95, max: 122 },  // green
            ] as const;
            const picked = palettes[Math.floor(Math.random() * palettes.length)];
            const hue = picked.min + Math.random() * (picked.max - picked.min);
            const saturation = 74 + Math.random() * 18;
            const lightness = 42 + Math.random() * 16;

            setSplats((prev) => [
                ...prev.slice(-45),
                { id, x, y, size, rotation, hue, saturation, lightness },
            ]);
            window.setTimeout(() => {
                setSplats((prev) =>
                    prev.map((splat) => (splat.id === id ? { ...splat, exiting: true } : splat))
                );
                window.setTimeout(() => {
                    setSplats((prev) => prev.filter((splat) => splat.id !== id));
                }, SPLAT_FADE_MS);
            }, SPLAT_VISIBLE_MS);

            const pageContent = document.querySelector("main") as HTMLElement | null;
            if (pageContent) {
                gsap.fromTo(
                    pageContent,
                    { x: 0, y: 0, rotate: 0 },
                    {
                        x: 9,
                        y: -6,
                        rotate: -0.15,
                        duration: 0.045,
                        repeat: 5,
                        yoyo: true,
                        ease: "power1.inOut",
                        clearProps: "transform",
                    }
                );
            }

            const target = pickHitWord(x, y, raw);
            if (!target) return;

            if (target.dataset.shotDown === "1") {
                gsap.to(target, {
                    y: "+=12",
                    rotation: "+=6",
                    duration: 0.16,
                    ease: "power1.out",
                });
                return;
            }

            target.dataset.shotDown = "1";
            target.style.willChange = "transform, opacity";
            const impactTilt = gsap.utils.random(-7, 7, 1);
            const fallTilt = gsap.utils.random(-24, 24, 1);
            const tl = gsap.timeline();
            tl.to(target, {
                x: gsap.utils.random(-6, 6, 1),
                y: gsap.utils.random(-10, -4, 1),
                rotation: impactTilt,
                scale: 1.08,
                duration: 0.09,
                ease: "power2.out",
            })
                .to(target, {
                    x: gsap.utils.random(-2, 2, 1),
                    y: gsap.utils.random(-2, 2, 1),
                    rotation: impactTilt * 0.45,
                    scale: 0.96,
                    duration: 0.08,
                    ease: "power1.inOut",
                })
                .to(target, {
                    y: window.innerHeight * 0.55,
                    rotation: fallTilt,
                    opacity: 0.15,
                    scale: 1,
                    duration: 1.05,
                    ease: "power2.in",
                });
        };

        const stopHoldFire = () => {
            isHoldingPrimary = false;
            if (firingInterval !== null) {
                window.clearInterval(firingInterval);
                firingInterval = null;
            }
        };

        const onPointerDown = (event: PointerEvent) => {
            if (!event.isPrimary) return;
            if (event.pointerType === "mouse" && event.button !== 0) return;
            if ((event.target as Element | null)?.closest("[data-shoot-ui]")) return;

            // Keep touchscreen scrolling natural while allowing tap-to-shoot.
            // Do not update aim on touch down (avoids gun jumping when starting a scroll).
            if (event.pointerType === "touch") {
                touchStart = { x: event.clientX, y: event.clientY };
                touchMoved = false;
                return;
            }

            event.preventDefault();
            window.getSelection()?.removeAllRanges();
            updateAimFromPoint(event.clientX, event.clientY);

            fireShot(event.clientX, event.clientY);

            isHoldingPrimary = true;
            if (firingInterval !== null) window.clearInterval(firingInterval);
            firingInterval = window.setInterval(() => {
                if (!isHoldingPrimary) return;
                fireShot(pointerRef.current.x, pointerRef.current.y);
            }, 90);
        };

        const onPointerMove = (event: PointerEvent) => {
            if (!event.isPrimary) return;
            if (event.pointerType !== "touch") return;
            if (!touchStart) return;
            const movedDistance = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
            if (movedDistance > touchMoveThreshold) {
                touchMoved = true;
            }
        };

        const onPointerUp = (event: PointerEvent) => {
            if (!event.isPrimary) return;
            if (event.pointerType === "mouse" && event.button !== 0) return;
            if (event.pointerType === "touch") {
                if (!(event.target as Element | null)?.closest("[data-shoot-ui]") && !touchMoved) {
                    updateAimFromPoint(event.clientX, event.clientY);
                    fireShot(event.clientX, event.clientY);
                }
                touchStart = null;
                touchMoved = false;
            }
            stopHoldFire();
        };

        const onPointerCancel = () => {
            touchStart = null;
            touchMoved = false;
            stopHoldFire();
        };

        const onWindowBlur = () => {
            stopHoldFire();
        };

        document.addEventListener("selectstart", onSelectStart);
        document.addEventListener("dragstart", onSelectStart);
        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerCancel);
        window.addEventListener("blur", onWindowBlur);
        return () => {
            stopHoldFire();
            document.removeEventListener("selectstart", onSelectStart);
            document.removeEventListener("dragstart", onSelectStart);
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerCancel);
            window.removeEventListener("blur", onWindowBlur);
        };
    }, [isOn, updateAimFromPoint]);

    React.useEffect(() => {
        const cursorClassName = "shoot-cursor-hidden";
        const shootModeClassName = "shoot-mode-active";
        const touchUiClassName = "shoot-mode-touch-ui";

        if (isOn) {
            document.documentElement.classList.add(shootModeClassName);
            document.body.classList.add(shootModeClassName);
            const isTouchCapable =
                typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
            if (isTouchCapable) {
                document.documentElement.classList.add(touchUiClassName);
                document.body.classList.add(touchUiClassName);
            }
        } else {
            document.documentElement.classList.remove(shootModeClassName);
            document.body.classList.remove(shootModeClassName);
            document.documentElement.classList.remove(touchUiClassName);
            document.body.classList.remove(touchUiClassName);
        }

        if (isOn && showGunCursor) {
            document.documentElement.classList.add(cursorClassName);
            document.body.classList.add(cursorClassName);
        } else {
            document.documentElement.classList.remove(cursorClassName);
            document.body.classList.remove(cursorClassName);
        }

        return () => {
            document.documentElement.classList.remove(cursorClassName);
            document.body.classList.remove(cursorClassName);
            document.documentElement.classList.remove(shootModeClassName);
            document.body.classList.remove(shootModeClassName);
            document.documentElement.classList.remove(touchUiClassName);
            document.body.classList.remove(touchUiClassName);
        };
    }, [isOn, showGunCursor]);

    return (
        <>
            {/* Paint splats: keep mounted while fading after shoot mode ends */}
            {(isOn || splats.length > 0) && (
                <div className="fixed inset-0 z-9998 pointer-events-none" aria-hidden="true">
                    {splats.map((splat) => (
                        <div
                            key={splat.id}
                            className="absolute transition-opacity ease-out"
                            style={{
                                left: splat.x,
                                top: splat.y,
                                width: splat.size,
                                height: splat.size,
                                transform: `translate(-50%, -50%) rotate(${splat.rotation}deg)`,
                                opacity: splat.exiting ? 0 : 1,
                                transitionDuration: `${SPLAT_FADE_MS}ms`,
                            }}
                        >
                            <span
                                className="absolute inset-0 opacity-95"
                                style={{
                                    clipPath:
                                        "polygon(50% 0%, 59% 10%, 71% 4%, 77% 16%, 91% 12%, 89% 27%, 100% 38%, 88% 49%, 100% 62%, 84% 67%, 90% 82%, 74% 81%, 69% 97%, 55% 90%, 46% 100%, 35% 88%, 21% 96%, 15% 82%, 0% 77%, 6% 62%, 0% 48%, 11% 39%, 3% 24%, 18% 20%, 24% 5%, 38% 12%)",
                                    background: `hsl(${splat.hue} ${splat.saturation}% ${splat.lightness}%)`,
                                }}
                            />
                            <span
                                className="absolute inset-0 opacity-70"
                                style={{
                                    clipPath:
                                        "polygon(50% 8%, 62% 16%, 75% 14%, 84% 25%, 90% 38%, 83% 52%, 89% 65%, 77% 71%, 75% 85%, 62% 82%, 53% 92%, 42% 84%, 29% 88%, 22% 76%, 10% 70%, 14% 56%, 8% 44%, 18% 34%, 13% 22%, 27% 21%, 33% 10%, 44% 16%)",
                                    background: `hsl(${splat.hue + 12} ${Math.min(splat.saturation + 8, 96)}% ${Math.min(splat.lightness + 10, 66)}%)`,
                                }}
                            />
                            <span
                                className="absolute rounded-full opacity-82"
                                style={{
                                    width: splat.size * 0.24,
                                    height: splat.size * 0.24,
                                    left: -splat.size * 0.18,
                                    top: splat.size * 0.12,
                                    background: `hsl(${splat.hue - 8} ${splat.saturation}% ${Math.max(splat.lightness - 10, 25)}%)`,
                                }}
                            />
                            <span
                                className="absolute rounded-full opacity-80"
                                style={{
                                    width: splat.size * 0.2,
                                    height: splat.size * 0.2,
                                    right: -splat.size * 0.15,
                                    bottom: splat.size * 0.1,
                                    background: `hsl(${splat.hue + 16} ${Math.min(splat.saturation + 6, 96)}% ${Math.max(splat.lightness - 4, 28)}%)`,
                                }}
                            />
                            <span
                                className="absolute rounded-full opacity-78"
                                style={{
                                    width: splat.size * 0.16,
                                    height: splat.size * 0.16,
                                    left: splat.size * 0.36,
                                    bottom: -splat.size * 0.18,
                                    background: `hsl(${splat.hue} ${splat.saturation}% ${Math.max(splat.lightness - 12, 24)}%)`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Custom gun cursor */}
            {isOn && showGunCursor && (
                <div
                    className="fixed z-9999 pointer-events-none"
                    style={{ left: cursorX, top: cursorY, transform: "translate(-50%, -50%)" }}
                    aria-hidden="true"
                    data-shoot-ui="1"
                >
                    <div className="relative h-7 w-7">
                        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/70" />
                        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-black/70" />
                        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/80" />
                        <span className="absolute right-[-8px] top-1/2 h-[2px] w-3 -translate-y-1/2 bg-black/80" />
                    </div>
                </div>
            )}

            {/* Gun (above the bottom HUD) */}
            {isOn && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-9999 pointer-events-none" data-shoot-ui="1">
                    <GunViewer aimX={aimX} aimY={aimY} />
                </div>
            )}

            {/* Bottom HUD */}
            <div className="fixed bottom-5 inset-x-0 z-9999 px-6 pointer-events-none" data-shoot-ui="1">
                <div className="flex items-center justify-between">
                    {/* Left: toggle */}
                    <div className="pointer-events-auto" data-shoot-controls="1">
                        <button
                            type="button"
                            onClick={toggle}
                            className={[
                                "group flex items-center gap-3",
                                "rounded-full  backdrop-blur-md",
                                "px-4 py-2",
                                "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)]",
                                "transition-[border-color,background-color] duration-200",
                                isOn ? "border-black/35 bg-[#f4f3ee]" : "",
                            ].join(" ")}
                            aria-pressed={isOn}
                            aria-label="Toggle shoot mode"
                        >
                            <span
                                aria-hidden="true"
                                className={[
                                    "relative inline-flex h-5 w-9 items-center rounded-full",
                                    "border border-black/25 bg-transparent",
                                    "transition-[border-color,background-color] duration-200",
                                    isOn ? "bg-black/5 border-black/35" : "",
                                ].join(" ")}
                            >
                                <span
                                    className={[
                                        "absolute left-0.5 top-1/2 -translate-y-1/2",
                                        "h-4 w-4 rounded-full bg-black",
                                        "transition-transform duration-200 ease-out",
                                        isOn ? "translate-x-4" : "translate-x-0",
                                    ].join(" ")}
                                />
                            </span>

                            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/80 select-none">
                                Shoot
                            </span>
                        </button>
                    </div>

                    <div />

                    {/* Right: date/time */}
                    <div className="pointer-events-none">
                        <div className="rounded-full  backdrop-blur-md px-4 py-2">
                            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-black/70 select-none">
                                {dateTimeText}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

