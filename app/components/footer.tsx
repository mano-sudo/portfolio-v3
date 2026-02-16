"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Github, Linkedin, Twitter, ArrowUp } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const socialLinks = [
    { name: "Email", icon: Mail, url: "mailto:romancaseres929@gmail.com" },
    { name: "GitHub", icon: Github, url: "#" },
    { name: "LinkedIn", icon: Linkedin, url: "#" },
    { name: "Twitter", icon: Twitter, url: "#" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Use usage of useGSAP consistent with local hook definition:
    // It returns the scope ref which must be attached to the container
    const containerRef = useGSAP(() => {
        // Footer content reveal animation
        gsap.from(".footer-content", {
            scrollTrigger: {
                trigger: ".footer-content", // Trigger relative to content or container
                start: "top 95%",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        });
    }, []);

    return (
        <footer ref={containerRef} className="relative bg-black w-full overflow-hidden border-t border-white/10 pt-20 pb-10">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-900/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
                <div className="flex flex-col gap-16 mb-16">
                    {/* Top Section: Navigation & Scroll To Top */}
                    <div className="footer-content flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-white/40 font-medium mb-6 block">Navigation</span>
                            <nav className="flex flex-col gap-3">
                                {["About", "Work", "Testimonials", "Contact"].map((item) => (
                                    <a 
                                        key={item} 
                                        href={`#${item.toLowerCase()}`}
                                        className="text-lg md:text-xl uppercase font-bold text-white/60 hover:text-white transition-colors tracking-wide w-fit"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        <button 
                            type="button"
                            onClick={scrollToTop}
                            className="group flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors"
                        >
                            <div className="p-3 rounded-full border border-white/10 group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-300">
                                <ArrowUp className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest">Back to Top</span>
                        </button>
                    </div>

                    {/* Middle Section: Large Name Branding */}
                    <div className="footer-content border-y border-white/5 py-12">
                        <h1 className="text-[clamp(3rem,10vw,12rem)] font-black uppercase text-white/5 leading-none text-center select-none pointer-events-none">
                            Roman Caseres
                        </h1>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Socials */}
                <div className="footer-content flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-0">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
                        <p className="text-white/30 text-xs uppercase tracking-wider">
                            © {currentYear} Roman Caseres
                        </p>
                        <span className="hidden md:block text-white/10">|</span>
                        <p className="text-white/30 text-xs uppercase tracking-wider">
                            Dev By Roman
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        {socialLinks.map((link) => (
                            <a 
                                key={link.name}
                                href={link.url}
                                className="group p-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                aria-label={link.name}
                            >
                                <link.icon className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
