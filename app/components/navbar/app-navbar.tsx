"use client";

import Link from "next/link";
import { Github, MessageCircle, Send, Star, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { countryCodeFromIanaTimeZone } from "@/app/utils/timezone-to-country-code";

/** Messages older than this are dropped in the UI and purged in the database (see supabase/migrations). */
const CHAT_MESSAGE_TTL_MS = 10 * 60 * 1000;

/** Past this scroll offset the navbar gets a solid surface; at the top it stays transparent. */
const NAV_SOLID_BG_SCROLL_PX = 24;

function normalizeCountryCode(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const t = value.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(t) ? t : null;
}

/** PostgREST / Postgres error when `country_code` is not in the table yet. */
function isChatCountryColumnError(body: unknown): boolean {
    if (!body || typeof body !== "object") return false;
    const o = body as { code?: string; message?: string };
    const msg = typeof o.message === "string" ? o.message : "";
    return (
        o.code === "PGRST204" ||
        o.code === "42703" ||
        msg.includes("country_code")
    );
}

function detectCountryCodeFromLocale(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language;
        const match = locale.match(/-([A-Za-z]{2})\b/);
        if (!match) return null;
        return normalizeCountryCode(match[1]);
    } catch {
        return null;
    }
}

/** Prefer `navigator.languages` so a region tag is found when `en-US` is listed before bare `en`. */
function countryCodeFromNavigatorLanguages(): string | null {
    if (typeof navigator === "undefined") return null;
    const list = [...(navigator.languages ?? []), navigator.language];
    for (const lang of list) {
        const match = lang.match(/-([A-Za-z]{2})\b/);
        if (!match) continue;
        const c = normalizeCountryCode(match[1]);
        if (c) return c;
    }
    return null;
}

/** Uses system IANA zone (e.g. Asia/Manila); usually matches real location better than en-US locale. */
function detectCountryCodeFromTimeZone(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!tz) return null;
        return countryCodeFromIanaTimeZone(tz);
    } catch {
        return null;
    }
}

/** ISO 3166-1 alpha-2 -> regional-indicator flag emoji. */
function countryCodeToFlagEmoji(code: string): string {
    const upper = code.toUpperCase();
    if (!/^[A-Z]{2}$/.test(upper)) return "";
    const base = 0x1f1e6;
    let out = "";
    for (let i = 0; i < upper.length; i += 1) {
        const cp = upper.codePointAt(i);
        if (cp === undefined) break;
        out += String.fromCodePoint(base + (cp - 65));
    }
    return out;
}

type ChatMessage = {
    id: number;
    user: string;
    text: string;
    time: string;
    createdAt: string;
    countryCode: string | null;
};

type DbChatMessageRow = {
    id: number;
    username: string;
    message: string;
    created_at: string;
    country_code?: string | null;
};

export default function AppNavbar() {
    const pathname = usePathname();
    const isProjectDetailPage = pathname.startsWith("/projects/") && pathname !== "/projects";
    const navRef = useRef<HTMLElement | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const shouldAutoScrollRef = useRef(true);
    const [currentTime, setCurrentTime] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [navSolidBg, setNavSolidBg] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [nameDraft, setNameDraft] = useState("");
    const [stars, setStars] = useState<number | null>(null);
    const [activeUsers, setActiveUsers] = useState<number>(1);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
    const userNameRef = useRef<string>(`Guest-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`);
    const countryCodeRef = useRef<string | null>(null);
    /** In-memory only: null = try country_code in REST; false = column missing this session. */
    const chatCountryColumnOkRef = useRef<boolean | null>(null);

    const toTimeText = (isoValue: string) => {
        const date = new Date(isoValue);
        if (Number.isNaN(date.getTime())) return "--:--";
        const hh = date.getHours() % 12 || 12;
        const mm = date.getMinutes().toString().padStart(2, "0");
        const suffix = date.getHours() >= 12 ? "PM" : "AM";
        return `${hh}:${mm} ${suffix}`;
    };

    const isChatMessageFresh = (createdAtIso: string) => {
        const t = new Date(createdAtIso).getTime();
        if (Number.isNaN(t)) return false;
        return Date.now() - t < CHAT_MESSAGE_TTL_MS;
    };

    const rowToChatMessage = (row: DbChatMessageRow): ChatMessage => {
        const fromDb = normalizeCountryCode(row.country_code);
        const selfFallback =
            row.username === userNameRef.current ? countryCodeRef.current : null;
        return {
            id: row.id,
            user: row.username,
            text: row.message,
            time: toTimeText(row.created_at),
            createdAt: row.created_at,
            countryCode: fromDb ?? selfFallback,
        };
    };

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const day = days[now.getDay()];
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? "P.M" : "A.M";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            setCurrentTime(`${day} ${displayHours}:${displayMinutes} ${ampm}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    // Hide navbar on scroll down, show on scroll up; solid bar only after leaving the top
    useEffect(() => {
        let lastY = window.scrollY;
        setNavSolidBg(lastY > NAV_SOLID_BG_SCROLL_PX);

        const onScroll = () => {
            const currentY = window.scrollY;
            setNavSolidBg(currentY > NAV_SOLID_BG_SCROLL_PX);
            if (menuOpen) return; // don't hide while overlay is open

            if (currentY > lastY && currentY > 80) {
                setNavHidden(true);
            } else if (currentY < lastY) {
                setNavHidden(false);
            }
            lastY = currentY;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [menuOpen]);

    useEffect(() => {
        setNavSolidBg(window.scrollY > NAV_SOLID_BG_SCROLL_PX);
    }, [pathname]);

    useEffect(() => {
        const applyHeaderHeight = () => {
            const nav = navRef.current;
            if (!nav) return;
            const height = Math.ceil(nav.getBoundingClientRect().height);
            document.documentElement.style.setProperty("--app-header-h", `${height}px`);
        };

        applyHeaderHeight();
        window.addEventListener("resize", applyHeaderHeight, { passive: true });

        const nav = navRef.current;
        let observer: ResizeObserver | null = null;
        if (nav && typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => applyHeaderHeight());
            observer.observe(nav);
        }

        return () => {
            window.removeEventListener("resize", applyHeaderHeight);
            observer?.disconnect();
        };
    }, []);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            if (!chatOpen) return;
            if (chatRef.current?.contains(event.target as Node)) return;
            setChatOpen(false);
        };
        window.addEventListener("pointerdown", onPointerDown);
        return () => window.removeEventListener("pointerdown", onPointerDown);
    }, [chatOpen]);

    useEffect(() => {
        const saved = window.localStorage.getItem("navbar-chat-display-name");
        const initial = (saved && saved.trim().length > 0) ? saved.trim() : userNameRef.current;
        userNameRef.current = initial;
        setDisplayName(initial);
        setNameDraft(initial);

        const fromTz = detectCountryCodeFromTimeZone();
        const savedCc = window.localStorage.getItem("navbar-chat-country-code");
        const fromStorage = normalizeCountryCode(savedCc);
        const fromLang = countryCodeFromNavigatorLanguages();
        const fromLocale = detectCountryCodeFromLocale();
        const cc = fromTz ?? fromStorage ?? fromLang ?? fromLocale;
        if (cc) {
            countryCodeRef.current = cc;
            window.localStorage.setItem("navbar-chat-country-code", cc);
        }
    }, []);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const response = await fetch("https://api.github.com/repos/mano-sudo/portfolio-v3");
                if (!response.ok) return;
                const data = (await response.json()) as { stargazers_count?: number };
                if (typeof data.stargazers_count === "number") {
                    setStars(data.stargazers_count);
                }
            } catch {
                // silent fallback
            }
        };
        void fetchStars();
    }, []);

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) return;
        supabaseRef.current = createClient(url, key);
    }, []);

    useEffect(() => {
        const client = supabaseRef.current;
        if (!client) return;

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) return;

        const channel = client.channel("portfolio-navbar-presence", {
            config: {
                presence: { key: userNameRef.current },
            },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                setActiveUsers(Object.keys(state).length || 1);
            })
            .subscribe((status) => {
                if (status !== "SUBSCRIBED") return;
                void channel.track({ joinedAt: new Date().toISOString() });
            });

        return () => {
            void channel.untrack();
            void client.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
            if (!url || !key) return;

            const selectWithoutCountry = "id,username,message,created_at";
            const selectWithCountry = `${selectWithoutCountry},country_code`;
            const tryCountry = chatCountryColumnOkRef.current !== false;

            const fetchList = async (select: string) =>
                fetch(
                    `${url}/rest/v1/chat_messages?select=${select}&order=created_at.desc&limit=40`,
                    {
                        method: "GET",
                        headers: {
                            apikey: key,
                            Authorization: `Bearer ${key}`,
                        },
                        cache: "no-store",
                    }
                );

            let usedCountryInSelect = tryCountry;
            let response = await fetchList(tryCountry ? selectWithCountry : selectWithoutCountry);
            if (!response.ok && tryCountry) {
                let errBody: unknown;
                try {
                    errBody = await response.json();
                } catch {
                    errBody = null;
                }
                if (isChatCountryColumnError(errBody)) {
                    chatCountryColumnOkRef.current = false;
                    usedCountryInSelect = false;
                    response = await fetchList(selectWithoutCountry);
                }
            }
            if (!response.ok) return;
            if (usedCountryInSelect) {
                chatCountryColumnOkRef.current = true;
            }
            const payload = (await response.json()) as DbChatMessageRow[];
            if (!Array.isArray(payload)) return;
            const mapped = payload
                .map(rowToChatMessage)
                .filter((m) => isChatMessageFresh(m.createdAt))
                .sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
            setChatMessages(mapped);
        };

        void loadMessages();

        const client = supabaseRef.current;
        if (!client) return;
        const channel = client
            .channel("portfolio-navbar-chat-db")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "chat_messages" },
                (payload) => {
                    const row = payload.new as DbChatMessageRow;
                    if (!row || typeof row.id !== "number") return;
                    if (!isChatMessageFresh(row.created_at)) return;
                    setChatMessages((prev) => {
                        if (prev.some((item) => item.id === row.id)) return prev;
                        return [...prev.slice(-48), rowToChatMessage(row)];
                    });
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "chat_messages" },
                (payload) => {
                    const oldRow = payload.old as { id?: number };
                    if (typeof oldRow?.id !== "number") return;
                    setChatMessages((prev) => prev.filter((m) => m.id !== oldRow.id));
                }
            )
            .subscribe();

        return () => {
            void client.removeChannel(channel);
        };
    }, []);

    // Drop expired messages locally on a timer (covers quiet periods before DB cron runs).
    useEffect(() => {
        const id = window.setInterval(() => {
            setChatMessages((prev) => prev.filter((m) => isChatMessageFresh(m.createdAt)));
        }, 30_000);
        return () => window.clearInterval(id);
    }, []);

    const navItems = [
        { name: "ABOUT", href: "/" },
        { name: "PROJECTS", href: "/projects" },
        { name: "CONTACTS", href: "/#contact" },
    ];

    const topTextClass = isProjectDetailPage ? "text-background/85" : "text-black/70";
    const topButtonClass = isProjectDetailPage
        ? "border-background/30 bg-black/25 text-background/90 hover:border-background/50 hover:bg-black/35"
        : "border-black/20 bg-background text-black/80 hover:border-black/35 hover:bg-black/5";
    const menuBarClass = isProjectDetailPage ? "bg-background" : "bg-black";

    const navSurfaceSolidClass = isProjectDetailPage
        ? "border-b border-white/10 bg-black/50 backdrop-blur-md"
        : "border-b border-black/10 bg-background/90 backdrop-blur-md";
    const navSurfaceTopClass = "border-b border-transparent bg-transparent backdrop-blur-none";
    const navSurfaceClass = navSolidBg ? navSurfaceSolidClass : navSurfaceTopClass;

    const sendMessage = async () => {
        const value = chatInput.trim();
        if (!value) return;
        const now = new Date();
        const hh = now.getHours() % 12 || 12;
        const mm = now.getMinutes().toString().padStart(2, "0");
        const suffix = now.getHours() >= 12 ? "PM" : "AM";
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (url && key) {
            const cc =
                countryCodeRef.current ??
                detectCountryCodeFromTimeZone() ??
                countryCodeFromNavigatorLanguages() ??
                detectCountryCodeFromLocale();
            if (cc) {
                countryCodeRef.current = cc;
                try {
                    window.localStorage.setItem("navbar-chat-country-code", cc);
                } catch {
                    //
                }
            }

            const includeCountry =
                chatCountryColumnOkRef.current !== false && Boolean(cc);
            const rowPayload: { username: string; message: string; country_code?: string } = {
                username: userNameRef.current,
                message: value,
            };
            if (includeCountry && cc) {
                rowPayload.country_code = cc;
            }

            const postBody = (payload: typeof rowPayload) =>
                fetch(`${url}/rest/v1/chat_messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: key,
                        Authorization: `Bearer ${key}`,
                        Prefer: "return=representation",
                    },
                    body: JSON.stringify([payload]),
                });

            let postedCountryColumn = includeCountry && Boolean(cc);
            let response = await postBody(rowPayload);

            if (!response.ok && postedCountryColumn) {
                let errBody: unknown;
                try {
                    errBody = await response.json();
                } catch {
                    errBody = null;
                }
                if (isChatCountryColumnError(errBody)) {
                    chatCountryColumnOkRef.current = false;
                    postedCountryColumn = false;
                    const minimal = { username: userNameRef.current, message: value };
                    response = await postBody(minimal);
                }
            }

            if (response.ok && postedCountryColumn) {
                chatCountryColumnOkRef.current = true;
            }

            // Apply immediately for sender; realtime keeps other clients in sync.
            if (response.ok) {
                const inserted = (await response.json()) as DbChatMessageRow[];
                const row = inserted[0];
                if (!row || typeof row.id !== "number") return;
                setChatMessages((prev) => {
                    if (prev.some((item) => item.id === row.id)) return prev;
                    return [...prev.slice(-48), rowToChatMessage(row)];
                });
            } else {
                // Keep chat usable even if backend policy blocks this client.
                const createdAt = now.toISOString();
                setChatMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        user: userNameRef.current,
                        text: value,
                        time: `${hh}:${mm} ${suffix}`,
                        createdAt,
                        countryCode: countryCodeRef.current,
                    },
                ]);
            }
        } else {
            const createdAt = now.toISOString();
            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    user: userNameRef.current,
                    text: value,
                    time: `${hh}:${mm} ${suffix}`,
                    createdAt,
                    countryCode: countryCodeRef.current,
                },
            ]);
        }
        setChatInput("");
    };

    const saveDisplayName = () => {
        const next = nameDraft.trim();
        if (!next) return;
        const normalized = next.slice(0, 24);
        userNameRef.current = normalized;
        setDisplayName(normalized);
        window.localStorage.setItem("navbar-chat-display-name", normalized);
        setIsEditingName(false);
    };

    const getAvatarUrl = (user: string) => {
        const normalized = user.trim().toLowerCase();
        let hash = 0;
        for (let i = 0; i < normalized.length; i += 1) {
            hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
            hash |= 0;
        }

        const styles = [
            "adventurer",
            "adventurer-neutral",
            "bottts-neutral",
            "lorelei",
            "micah",
            "personas",
            "thumbs",
        ] as const;
        const pickedStyle = styles[Math.abs(hash) % styles.length] ?? "personas";

        return `https://api.dicebear.com/9.x/${pickedStyle}/svg?seed=${encodeURIComponent(normalized)}&backgroundType=gradientLinear`;
    };

    useEffect(() => {
        const list = messageListRef.current;
        if (!list) return;
        if (!chatOpen) return;
        if (!shouldAutoScrollRef.current) return;
        list.scrollTop = list.scrollHeight;
    }, [chatMessages, chatOpen]);

    /** Other guests with at least one message in the thread (not you). Red badge shows this count. */
    const messengerOtherParticipantCount = useMemo(() => {
        const selfNorm = new Set<string>();
        const dn = displayName.trim().toLowerCase();
        const un = userNameRef.current.trim().toLowerCase();
        if (dn.length > 0) selfNorm.add(dn);
        if (un.length > 0) selfNorm.add(un);
        const others = new Set<string>();
        for (const m of chatMessages) {
            const key = m.user.trim().toLowerCase();
            if (key.length === 0 || selfNorm.has(key)) continue;
            others.add(key);
        }
        return others.size;
    }, [chatMessages, displayName]);

    const showMessengerParticipantBadge = messengerOtherParticipantCount > 0;

    return (
        <>
            <nav
                ref={navRef}
                data-shoot-ui="1"
                className={`fixed top-0 z-50 flex w-full min-w-0 items-center justify-between gap-2 py-4 pl-4 pr-3 will-change-transform transition-[transform,opacity,background-color,border-color] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-3 sm:p-6 sm:px-8 md:px-12 lg:px-20 ${navSurfaceClass} ${navHidden && !menuOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
            >
                {/* Left - Logo */}
                <Link href="/" aria-label="Go to home" className="inline-flex min-w-0 shrink items-center">
                    <span className={`${topTextClass} truncate font-semibold leading-[0.88] tracking-[-0.03em] text-[clamp(0.65rem,3.2vw,0.95rem)] sm:text-[clamp(0.72rem,1.35vw,0.95rem)]`}>
                        DevByRoman
                    </span>
                </Link>

                {/* Right Side - Menu + Status/Chat (visible on all breakpoints; compact on xs) */}
                <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
                    <div className="flex min-w-0 items-center gap-1 rounded-xl px-0 py-0 sm:gap-2 sm:px-2 sm:py-1.5 md:gap-3">
                        <div className={`flex items-center gap-1 px-0 sm:gap-2 sm:px-1.5 ${topTextClass}`}>
                            <Users className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                            <span className="hidden lg:inline text-xs md:text-sm font-semibold tracking-wide">
                                {activeUsers} active users
                            </span>
                            <span
                                className="inline text-[11px] font-semibold tabular-nums sm:text-xs lg:hidden"
                                aria-label={`${activeUsers} active users`}
                            >
                                {activeUsers}
                            </span>
                        </div>

                        <div className="relative" ref={chatRef}>
                                <button
                                    type="button"
                                    onClick={() => setChatOpen((prev) => !prev)}
                                    className={`relative inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors sm:gap-2 sm:px-3 ${topButtonClass}`}
                                    aria-expanded={chatOpen}
                                    aria-label={
                                        showMessengerParticipantBadge
                                            ? `Open chat, ${messengerOtherParticipantCount} other guest${messengerOtherParticipantCount === 1 ? "" : "s"} in thread`
                                            : "Open chat"
                                    }
                                >
                                    <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                    <span className="hidden min-[420px]:inline text-[10px] font-semibold uppercase tracking-wide sm:text-xs">
                                        Messages
                                    </span>
                                    {showMessengerParticipantBadge ? (
                                        <span
                                            className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-background sm:h-5 sm:min-w-[20px] sm:text-[11px]"
                                            aria-hidden
                                        >
                                            {messengerOtherParticipantCount > 99
                                                ? "99+"
                                                : messengerOtherParticipantCount}
                                        </span>
                                    ) : null}
                                </button>

                            {chatOpen && (
                                <div className="z-61 w-[min(calc(100vw-1.25rem),360px)] rounded-2xl border border-black/15 bg-[#f4f3ee] p-3 text-black shadow-[0_24px_55px_-30px_rgba(0,0,0,0.35)] max-sm:fixed max-sm:left-1/2 max-sm:right-auto max-sm:top-[calc(var(--app-header-h,80px)+0.5rem)] max-sm:mt-0 max-sm:-translate-x-1/2 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:translate-x-0">
                                <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-2">
                                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/80"># general</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingName((prev) => !prev)}
                                            className="text-[10px] font-mono uppercase tracking-[0.18em] text-black/55 transition-colors hover:text-black/90"
                                        >
                                            {isEditingName ? "cancel" : "change name"}
                                        </button>
                                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-black/45">live chat</span>
                                    </div>
                                </div>

                                {isEditingName && (
                                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-black/12 bg-black/3 p-2">
                                        <input
                                            type="text"
                                            value={nameDraft}
                                            onChange={(event) => setNameDraft(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") saveDisplayName();
                                            }}
                                            placeholder="Your display name"
                                            className="h-8 w-full rounded-md border border-black/10 bg-background px-2 text-sm text-black outline-none placeholder:text-black/40 focus:border-black/35"
                                        />
                                        <button
                                            type="button"
                                            onClick={saveDisplayName}
                                            className="rounded-md border border-black/20 bg-black/5 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-black/85 hover:bg-black/10"
                                        >
                                            Save
                                        </button>
                                    </div>
                                )}

                                <div
                                    ref={messageListRef}
                                    className="scrollbar-hidden max-h-60 space-y-2 overflow-y-auto overscroll-contain pr-1"
                                    style={{ WebkitOverflowScrolling: "touch" }}
                                    onWheel={(event) => event.stopPropagation()}
                                    onTouchMove={(event) => event.stopPropagation()}
                                    onScroll={(event) => {
                                        const element = event.currentTarget;
                                        const distanceToBottom =
                                            element.scrollHeight - element.scrollTop - element.clientHeight;
                                        shouldAutoScrollRef.current = distanceToBottom < 28;
                                    }}
                                >
                                    {chatMessages.map((message) => (
                                        <div key={message.id} className="flex items-start gap-2.5 rounded-xl px-2.5 py-2">
                                            <img
                                                src={getAvatarUrl(message.user)}
                                                alt={`${message.user} avatar`}
                                                className="h-9 w-9 shrink-0 rounded-full border border-black/20 bg-black/5"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="min-w-0 truncate text-base font-bold leading-none text-black/85">{message.user}</span>
                                                    {message.countryCode ? (
                                                        <span
                                                            className="shrink-0 text-base leading-none"
                                                            title={message.countryCode}
                                                            aria-label={`${message.countryCode} flag`}
                                                        >
                                                            {countryCodeToFlagEmoji(message.countryCode)}
                                                        </span>
                                                    ) : null}
                                                    <span className="shrink-0 text-[10px] font-mono uppercase tracking-[0.12em] text-black/45">{message.time}</span>
                                                </div>
                                                <p className="mt-1 wrap-break-word text-base leading-tight text-black/80">{message.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 flex items-center gap-2 border-t border-black/10 pt-2">
                                    <img
                                        src={getAvatarUrl(displayName || userNameRef.current)}
                                        alt="Your avatar"
                                        className="h-8 w-8 shrink-0 rounded-full border border-black/20 bg-black/5"
                                    />
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(event) => setChatInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") sendMessage();
                                        }}
                                        placeholder="Message #general"
                                        className="h-9 w-full rounded-lg border border-black/10 bg-background px-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/35"
                                    />
                                    <button
                                        type="button"
                                        onClick={sendMessage}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/20 bg-black/5 text-black/85 transition-colors hover:border-black/35 hover:bg-black/10"
                                        aria-label="Send message"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mt-1 pl-10 text-[10px] font-mono uppercase tracking-[0.16em] text-black/40">
                                    You are chatting as {displayName || userNameRef.current}
                                </div>
                            </div>
                            )}
                        </div>

                        <Link
                            href="https://github.com/mano-sudo/portfolio-v3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors sm:gap-2 sm:px-3 ${topButtonClass}`}
                            aria-label="Open GitHub repository"
                        >
                            <Github className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="text-[10px] font-semibold tabular-nums tracking-wide sm:text-xs">
                                {stars?.toLocaleString() ?? "1,017"}
                            </span>
                            <Star className={`h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 ${isProjectDetailPage ? "fill-background/90 text-background/90" : "fill-black/80 text-black/80"}`} />
                        </Link>
                    </div>

                    {/* Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="relative z-60 flex flex-col items-center justify-center w-10 h-10 gap-[6px]"
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block w-6 h-[2px] ${menuBarClass} transition-all duration-300 origin-center ${
                                menuOpen ? "rotate-45 translate-y-[8px]" : ""
                            }`}
                        />
                        <span
                            className={`block w-6 h-[2px] ${menuBarClass} transition-all duration-300 ${
                                menuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                            }`}
                        />
                        <span
                            className={`block w-6 h-[2px] ${menuBarClass} transition-all duration-300 origin-center ${
                                menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
                            }`}
                        />
                    </button>
                </div>
            </nav>

            {/* Full-Screen Menu Overlay */}
            <div
                data-shoot-ui="1"
                className={`fixed inset-0 z-55 transition-all duration-500 ${
                    menuOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

                {/* Menu Content */}
                <div className="relative h-full flex flex-col justify-center items-center gap-2 px-8">
                    {/* Close Button */}
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-6 right-8 w-10 h-10 flex items-center justify-center text-black/60 hover:text-black transition-colors duration-300"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Nav Links */}
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`group relative block py-4 transition-all duration-500 ${
                                    menuOpen
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-8"
                                }`}
                                style={{
                                    transitionDelay: menuOpen ? `${150 + i * 75}ms` : "0ms",
                                }}
                            >
                                <span
                                    className={`text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider transition-colors duration-300 ${
                                        isActive
                                            ? "text-black"
                                            : "text-black/40 group-hover:text-black"
                                    }`}
                                >
                                    {item.name}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div
                        className={`w-16 h-px bg-black/20 my-4 transition-all duration-500 ${
                            menuOpen
                                ? "opacity-100 scale-x-100"
                                : "opacity-0 scale-x-0"
                        }`}
                        style={{ transitionDelay: menuOpen ? "375ms" : "0ms" }}
                    />

                    {/* CTA */}
                    <Link
                        href="#contact"
                        onClick={() => setMenuOpen(false)}
                        className={`text-lg sm:text-xl font-semibold uppercase tracking-widest text-black/60 hover:text-black transition-all duration-500 ${
                            menuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: menuOpen ? "450ms" : "0ms" }}
                    >
                        LET&apos;S WORK
                    </Link>

                    {/* Time display at bottom */}
                    <div
                        className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-black/30 text-xs font-mono tracking-widest transition-all duration-500 ${
                            menuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4"
                        }`}
                        style={{ transitionDelay: menuOpen ? "525ms" : "0ms" }}
                    >
                        {currentTime}
                    </div>
                </div>
            </div>
        </>
    );
}