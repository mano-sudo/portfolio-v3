"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppNavbar() {
    const pathname = usePathname();
    const [currentTime, setCurrentTime] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [navHidden, setNavHidden] = useState(false);

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

    const navItems = [
        { name: "ABOUT", href: "/" },
        { name: "PROJECTS", href: "/projects" },
        { name: "CONTACTS", href: "/#contact" },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 flex justify-between items-center p-6 px-8 md:px-12 lg:px-20 transition-transform duration-300 bg-background/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none ${navHidden && !menuOpen ? "-translate-y-full" : "translate-y-0"}`}>
                {/* Left - Dashboard */}
                <div className="text-black uppercase tracking-wider text-xs md:text-sm font-medium">
                    DASHBOARD
                </div>

                {/* Center - Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8 md:gap-12 lg:gap-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative uppercase tracking-wider text-xs md:text-sm font-medium transition-all ${
                                    isActive
                                        ? "text-black"
                                        : "text-black/60 hover:text-black"
                                }`}
                            >
                                {item.name}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-0 w-full h-px bg-black" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Right side nav */}
                    <Link
                        href="#contact"
                        aria-label="Navigate to contact section"
                        className="text-black uppercase tracking-wider text-xs md:text-sm font-medium hover:text-black/80 transition-colors"
                    >
                        LET&apos;S WORK
                    </Link>
                </div>

                {/* Mobile - Hamburger Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="lg:hidden relative z-60 flex flex-col items-center justify-center w-10 h-10 gap-[6px]"
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
            </nav>

            {/* Mobile Full-Screen Menu Overlay */}
            <div
                className={`fixed inset-0 z-55 lg:hidden transition-all duration-500 ${
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