"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-client";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Same key as navbar chat so labels match. */
const DISPLAY_NAME_STORAGE_KEY = "navbar-chat-display-name";

const REALTIME_CHANNEL = "portfolio-site-cursors";
const CURSOR_EVENT = "cursor";
const SEND_INTERVAL_MS = 45;
const STALE_MS = 4500;
const PRUNE_INTERVAL_MS = 900;
const MAX_PEERS = 32;
/** Lenis may not always emit `scroll`; light poll keeps cursors aligned during smooth scroll. */
const LAYOUT_POLL_MS = 72;

type LenisLike = {
    scroll: number;
    isHorizontal: boolean;
    on: (event: string, callback: () => void) => void;
    off: (event: string, callback: () => void) => void;
};

type WindowWithLenis = Window & { lenis?: LenisLike };

type CursorPayload = {
    oid: string;
    label: string;
    /** 0..1 position along full document width (scroll + viewport). */
    nx: number;
    /** 0..1 position along full document height (scroll + viewport). */
    ny: number;
};

type PeerCursor = CursorPayload & { at: number; color: string };

function getDocumentSize(): { dw: number; dh: number } {
    const el = document.documentElement;
    return {
        dw: Math.max(el.scrollWidth, el.clientWidth),
        dh: Math.max(el.scrollHeight, el.clientHeight),
    };
}

function getDocumentScroll(): { sx: number; sy: number } {
    const w = window as WindowWithLenis;
    const lenis = w.lenis;
    if (lenis && typeof lenis.scroll === "number") {
        return lenis.isHorizontal
            ? { sx: lenis.scroll, sy: w.scrollY }
            : { sx: w.scrollX, sy: lenis.scroll };
    }
    return { sx: w.scrollX, sy: w.scrollY };
}

function clientPointerToDocNorm(clientX: number, clientY: number): { nx: number; ny: number } {
    const { sx, sy } = getDocumentScroll();
    const { dw, dh } = getDocumentSize();
    const px = clientX + sx;
    const py = clientY + sy;
    return {
        nx: dw > 0 ? Math.min(1, Math.max(0, px / dw)) : 0,
        ny: dh > 0 ? Math.min(1, Math.max(0, py / dh)) : 0,
    };
}

function docNormToViewportClient(nx: number, ny: number): { cx: number; cy: number } {
    const { sx, sy } = getDocumentScroll();
    const { dw, dh } = getDocumentSize();
    const px = nx * dw;
    const py = ny * dh;
    return {
        cx: px - sx,
        cy: py - sy,
    };
}

function hueFromString(value: string): number {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) {
        h = (h * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(h) % 360;
}

function labelColor(label: string): string {
    const h = hueFromString(label);
    return `hsl(${h} 78% 52%)`;
}

function readDisplayLabel(sessionOid: string): string {
    try {
        const saved = window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY);
        if (saved && saved.trim().length > 0) {
            return saved.trim().slice(0, 24);
        }
    } catch {
        //
    }
    return `Guest-${sessionOid.slice(0, 4)}`;
}

function isValidPayload(raw: unknown, ownOid: string): raw is CursorPayload {
    if (!raw || typeof raw !== "object") return false;
    const o = raw as Record<string, unknown>;
    if (typeof o.oid !== "string" || o.oid.length === 0 || o.oid === ownOid) return false;
    if (typeof o.label !== "string") return false;
    if (typeof o.nx !== "number" || typeof o.ny !== "number") return false;
    if (o.nx < 0 || o.nx > 1 || o.ny < 0 || o.ny > 1) return false;
    return true;
}

function PeerCursorMarker({
    peer,
    layoutTick: _layoutTick,
}: {
    peer: PeerCursor;
    /** Forces recomputation of viewport position when scroll/layout changes. */
    layoutTick: number;
}) {
    void _layoutTick;
    const h = hueFromString(peer.label);
    const solid = peer.color;
    const glowOuter = `hsl(${h} 78% 52% / 0.42)`;
    const glowMid = `hsl(${h} 78% 52% / 0.22)`;
    const glowStrong = `hsl(${h} 78% 52% / 0.72)`;
    const ringInner = `hsl(${h} 78% 52% / 0.28)`;

    const { cx, cy } = docNormToViewportClient(peer.nx, peer.ny);
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;
    const margin = 80;
    if (cx < -margin || cy < -margin || cx > vw + margin || cy > vh + margin) {
        return null;
    }

    return (
        <motion.div
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 will-change-transform"
            initial={false}
            animate={{ left: cx, top: cy }}
            transition={{
                type: "spring",
                stiffness: 460,
                damping: 32,
                mass: 0.5,
            }}
        >
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <motion.div
                    className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${glowOuter} 0%, ${glowMid} 38%, transparent 68%)`,
                    }}
                    animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.55, 0.92, 0.55] }}
                    transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35"
                    style={{
                        borderColor: solid,
                        boxShadow: `0 0 18px ${glowStrong}, inset 0 0 12px ${ringInner}`,
                    }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="relative z-10 h-3 w-3 rounded-full ring-[3px] ring-white shadow-md"
                    style={{
                        background: `linear-gradient(145deg, #ffffff 0%, ${solid} 92%)`,
                        boxShadow: `0 0 18px ${glowStrong}, 0 2px 8px rgba(0,0,0,0.22)`,
                    }}
                    animate={{ scale: [1, 1.07, 1] }}
                    transition={{
                        duration: 1.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <div className="flex max-w-40 items-center gap-2 rounded-2xl border border-border bg-card/90 py-1.5 pl-2 pr-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-md dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)]">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                        style={{ backgroundColor: solid }}
                    />
                    <span
                        className="relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-background/90"
                        style={{ backgroundColor: solid }}
                    />
                </span>
                <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                    {peer.label}
                </span>
            </div>
        </motion.div>
    );
}

export default function CollaborativeCursors() {
    const pathname = usePathname();
    const [peers, setPeers] = useState<PeerCursor[]>([]);
    const [subscribed, setSubscribed] = useState(false);
    const [layoutTick, setLayoutTick] = useState(0);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const oidRef = useRef("");
    const lastSendRef = useRef(0);

    useEffect(() => {
        oidRef.current =
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `c-${Math.random().toString(36).slice(2, 10)}`;
    }, []);

    useEffect(() => {
        setLayoutTick((n) => n + 1);
    }, [pathname]);

    useEffect(() => {
        const bump = () => setLayoutTick((n) => n + 1);
        window.addEventListener("scroll", bump, { passive: true, capture: true });
        window.addEventListener("resize", bump);

        const win = window as WindowWithLenis;
        const lenis = win.lenis;
        if (lenis) {
            lenis.on("scroll", bump);
        }

        const poll =
            peers.length > 0 ? window.setInterval(bump, LAYOUT_POLL_MS) : undefined;

        return () => {
            window.removeEventListener("scroll", bump, { capture: true });
            window.removeEventListener("resize", bump);
            if (lenis) {
                lenis.off("scroll", bump);
            }
            if (poll !== undefined) window.clearInterval(poll);
        };
    }, [peers.length]);

    useEffect(() => {
        const client = getSupabaseBrowserClient();
        if (!client) return;
        const channel = client.channel(REALTIME_CHANNEL, {
            config: { broadcast: { self: false } },
        });

        channel.on("broadcast", { event: CURSOR_EVENT }, ({ payload }) => {
            if (!isValidPayload(payload, oidRef.current)) return;
            const label =
                payload.label.trim().length > 0 ? payload.label.trim().slice(0, 24) : "Guest";
            const row: PeerCursor = {
                oid: payload.oid,
                label,
                nx: payload.nx,
                ny: payload.ny,
                at: Date.now(),
                color: labelColor(label),
            };
            setPeers((prev) => {
                const without = prev.filter((p) => p.oid !== row.oid);
                const next = [...without, row];
                next.sort((a, b) => a.at - b.at);
                return next.slice(-MAX_PEERS);
            });
        });

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                channelRef.current = channel;
                setSubscribed(true);
            }
        });

        return () => {
            setSubscribed(false);
            channelRef.current = null;
            void client.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (!subscribed) return;

        const onMove = (event: PointerEvent) => {
            const ch = channelRef.current;
            if (!ch) return;
            const now = Date.now();
            if (now - lastSendRef.current < SEND_INTERVAL_MS) return;
            lastSendRef.current = now;
            const { nx, ny } = clientPointerToDocNorm(event.clientX, event.clientY);
            void ch.send({
                type: "broadcast",
                event: CURSOR_EVENT,
                payload: {
                    oid: oidRef.current,
                    label: readDisplayLabel(oidRef.current),
                    nx,
                    ny,
                } satisfies CursorPayload,
            });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [subscribed]);

    useEffect(() => {
        const id = window.setInterval(() => {
            const cutoff = Date.now() - STALE_MS;
            setPeers((prev) => prev.filter((p) => p.at >= cutoff));
        }, PRUNE_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, []);

    if (peers.length === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
            aria-hidden
        >
            {peers.map((p) => (
                <PeerCursorMarker key={p.oid} peer={p} layoutTick={layoutTick} />
            ))}
        </div>
    );
}
