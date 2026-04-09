"use client";

import Link from "next/link";
import { Github, MessageCircle, Send, Star, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ChatMessage = {
    id: number;
    user: string;
    text: string;
    time: string;
};

type DbChatMessageRow = {
    id: number;
    username: string;
    message: string;
    created_at: string;
};

export default function AppNavbar() {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const shouldAutoScrollRef = useRef(true);
    const [currentTime, setCurrentTime] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
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

    const toTimeText = (isoValue: string) => {
        const date = new Date(isoValue);
        if (Number.isNaN(date.getTime())) return "--:--";
        const hh = date.getHours() % 12 || 12;
        const mm = date.getMinutes().toString().padStart(2, "0");
        const suffix = date.getHours() >= 12 ? "PM" : "AM";
        return `${hh}:${mm} ${suffix}`;
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

    // Hide navbar on scroll down, show on scroll up
    useEffect(() => {
        let lastY = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;
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

            const response = await fetch(
                `${url}/rest/v1/chat_messages?select=id,username,message,created_at&order=created_at.asc&limit=40`,
                {
                    method: "GET",
                    headers: {
                        apikey: key,
                        Authorization: `Bearer ${key}`,
                    },
                    cache: "no-store",
                }
            );
            if (!response.ok) return;
            const payload = (await response.json()) as DbChatMessageRow[];
            if (!Array.isArray(payload)) return;
            const mapped = payload.map((row) => ({
                id: row.id,
                user: row.username,
                text: row.message,
                time: toTimeText(row.created_at),
            }));
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
                    setChatMessages((prev) => {
                        if (prev.some((item) => item.id === row.id)) return prev;
                        return [
                            ...prev.slice(-48),
                            {
                                id: row.id,
                                user: row.username,
                                text: row.message,
                                time: toTimeText(row.created_at),
                            },
                        ];
                    });
                }
            )
            .subscribe();

        return () => {
            void client.removeChannel(channel);
        };
    }, []);

    const navItems = [
        { name: "ABOUT", href: "/" },
        { name: "PROJECTS", href: "/projects" },
        { name: "CONTACTS", href: "/#contact" },
    ];

    const sendMessage = async () => {
        const value = chatInput.trim();
        if (!value) return;
        const now = new Date();
        const hh = now.getHours() % 12 || 12;
        const mm = now.getMinutes().toString().padStart(2, "0");
        const suffix = now.getHours() >= 12 ? "PM" : "AM";
        const client = supabaseRef.current;
        if (client) {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
            if (!url || !key) return;
            const response = await fetch(`${url}/rest/v1/chat_messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: key,
                    Authorization: `Bearer ${key}`,
                    Prefer: "return=representation",
                },
                body: JSON.stringify([{ username: userNameRef.current, message: value }]),
            });

            // Apply immediately for sender; realtime keeps other clients in sync.
            if (response.ok) {
                const inserted = (await response.json()) as DbChatMessageRow[];
                const row = inserted[0];
                if (row && typeof row.id === "number") {
                    setChatMessages((prev) => {
                        if (prev.some((item) => item.id === row.id)) return prev;
                        return [
                            ...prev.slice(-48),
                            {
                                id: row.id,
                                user: row.username,
                                text: row.message,
                                time: toTimeText(row.created_at),
                            },
                        ];
                    });
                }
            }
        } else {
            setChatMessages((prev) => [
                ...prev,
                { id: Date.now(), user: userNameRef.current, text: value, time: `${hh}:${mm} ${suffix}` },
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

    return (
        <>
            <nav
                ref={navRef}
                className={`fixed top-0 w-full z-50 flex justify-between items-center p-6 px-8 md:px-12 lg:px-20 transition-transform duration-300 bg-background/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none ${navHidden && !menuOpen ? "-translate-y-full" : "translate-y-0"}`}
            >
                {/* Left - Logo */}
                <Link href="/" aria-label="Go to home" className="inline-flex items-center">
                    <span className="text-black/70 font-black leading-[0.88] tracking-[-0.04em] text-[clamp(0.9rem,1.9vw,1.35rem)]">
                        DevByRoman
                    </span>
                </Link>

                {/* Right Side - Menu + Status/Chat */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="hidden sm:flex items-center gap-2 sm:gap-3 md:gap-4">
                        <div className="flex items-center gap-2 rounded-xl  px-2 py-1.5">
                            <div className="flex items-center gap-2 px-1.5 text-black/70">
                                <Users className="h-4 w-4" />
                                <span className="hidden lg:inline text-xs md:text-sm font-semibold tracking-wide">
                                    {activeUsers} active users
                                </span>
                                <span className="inline lg:hidden text-xs font-semibold tracking-wide">{activeUsers}</span>
                            </div>

                            <div className="relative" ref={chatRef}>
                                <button
                                    type="button"
                                    onClick={() => setChatOpen((prev) => !prev)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-black/20 bg-background px-3 py-1.5 text-black/80 transition-colors hover:border-black/35 hover:bg-black/5"
                                    aria-expanded={chatOpen}
                                    aria-label="Open chat"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="hidden md:inline text-xs font-semibold uppercase tracking-wide">Messages</span>
                                </button>

                            {chatOpen && (
                                <div className="absolute right-0 mt-2 w-[min(94vw,360px)] rounded-2xl border border-black/15 bg-[#f4f3ee] p-3 text-black shadow-[0_24px_55px_-30px_rgba(0,0,0,0.35)]">
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
                                        <div key={message.id} className="flex items-start gap-2.5 rounded-xl bg-black/3 px-2.5 py-2">
                                            <img
                                                src={getAvatarUrl(message.user)}
                                                alt={`${message.user} avatar`}
                                                className="h-9 w-9 shrink-0 rounded-full border border-black/20 bg-black/5"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-base font-bold leading-none text-black/85">{message.user}</span>
                                                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-black/45">{message.time}</span>
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
                                className="inline-flex items-center gap-2 rounded-lg border border-black/20 bg-background px-3 py-1.5 text-black/80 transition-colors hover:border-black/35 hover:bg-black/5"
                                aria-label="Open GitHub repository"
                            >
                                <Github className="h-4 w-4" />
                                <span className="hidden md:inline text-xs font-semibold tracking-wide">{stars?.toLocaleString() ?? "1,017"}</span>
                                <Star className="h-3.5 w-3.5 fill-black/80 text-black/80" />
                            </Link>
                        </div>
                    </div>

                    {/* Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="relative z-60 flex flex-col items-center justify-center w-10 h-10 gap-[6px]"
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block w-6 h-[2px] bg-black transition-all duration-300 origin-center ${
                                menuOpen ? "rotate-45 translate-y-[8px]" : ""
                            }`}
                        />
                        <span
                            className={`block w-6 h-[2px] bg-black transition-all duration-300 ${
                                menuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                            }`}
                        />
                        <span
                            className={`block w-6 h-[2px] bg-black transition-all duration-300 origin-center ${
                                menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
                            }`}
                        />
                    </button>
                </div>
            </nav>

            {/* Full-Screen Menu Overlay */}
            <div
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