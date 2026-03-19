"use client";

import { useEffect, useState } from "react";
import anime from "animejs";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
];

export default function FloatingNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState("home");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show nav after scrolling a bit
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (pathname !== "/") return;

        const sectionIds = navItems.map((item) => item.href.replace("#", ""));
        const observers: IntersectionObserver[] = [];

        sectionIds.forEach((id) => {
            const target = document.getElementById(id);
            if (!target) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry?.isIntersecting) {
                        setActiveSection(id);
                    }
                },
                {
                    threshold: 0.45,
                }
            );

            observer.observe(target);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, [pathname]);

    useEffect(() => {
        // Animate nav appearance
        if (isVisible) {
            anime({
                targets: ".floating-nav",
                translateY: [100, 0],
                opacity: [0, 1],
                duration: 800,
                easing: "easeOutExpo",
            });
        }
    }, [isVisible]);

    const handleClick = (href: string) => {
        const sectionId = href.replace("#", "");
        setActiveSection(sectionId);

        if (pathname !== "/") {
            router.push(`/${href}`);
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (!isVisible) return null;

    return (
        <nav className="floating-nav fixed bottom-8 left-1/2 -translate-x-1/2 z-50 opacity-0">
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card/80 backdrop-blur-lg border border-border shadow-2xl">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => handleClick(item.href)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            activeSection === item.name.toLowerCase()
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                        }`}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
        </nav>
    );
}
