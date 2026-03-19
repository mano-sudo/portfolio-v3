export type Project = {
    slug: string;
    title: string;
    role: string;
    description: string;
    highlights: readonly string[];
    tech: readonly string[];
    github: string;
    live: string;
    featured: boolean;
    year: string;
    image: string;
};

export const projects: readonly Project[] = [
    {
        slug: "attendance-monitoring-system",
        title: "Attendance Monitoring System",
        role: "Full-Stack Developer",
        description:
            "A web-based attendance monitoring system with real-time time-in/time-out logging, admin controls, and automated attendance reporting.",
        highlights: [
            "Built real-time attendance logging for employee time-in and time-out.",
            "Implemented admin dashboard tools for employee and schedule management.",
            "Automated attendance report generation to reduce manual processing.",
            "Delivered a responsive interface for daily workforce operations.",
        ],
        tech: ["HTML", "CSS", "PHP", "MySQL", "Bootstrap", "JavaScript"],
        github: "https://github.com/mano-sudo/AMS",
        live: "https://ams.manosudo.com",
        featured: true,
        year: "2024",
        image: "/images/projects/atms.png",
    },
    {
        slug: "outfit-haven-ecommerce-platform",
        title: "OutfitHaven: Responsive E-Commerce Platform",
        role: "Full-Stack Developer",
        description:
            "A modern e-commerce platform for local fashion brands in the Philippines with dynamic storefront experiences and secure order handling.",
        highlights: [
            "Built product browsing and checkout flows for a smooth buying experience.",
            "Designed responsive UI for improved mobile and desktop usability.",
            "Integrated backend services for order handling and product data.",
            "Supported local fashion brands with scalable storefront capabilities.",
        ],
        tech: ["React", "Tailwind CSS", "Node.js", "MongoDB"],
        github: "https://github.com/mano-sudo/OutfitHaven",
        live: "https://outfithat.manosudo.com",
        featured: true,
        year: "2024",
        image: "/images/projects/outfithaven.png",
    },
    {
        slug: "burger-ka-samen-ordering-system",
        title: "Burger Ka Samen Ordering System",
        role: "Full-Stack Developer",
        description:
            "A full-stack burger ordering platform with customer cart and checkout plus an admin dashboard for products, orders, and users.",
        highlights: [
            "Implemented customer ordering flow with cart and checkout.",
            "Built admin dashboard modules for products, users, and orders.",
            "Designed responsive layouts for a better ordering experience.",
            "Connected frontend and backend for reliable order processing.",
        ],
        tech: ["HTML", "CSS", "PHP", "MySQL", "Tailwind CSS", "JavaScript"],
        github: "https://github.com/mano-sudo/Ordering-System",
        live: "https://ordering.manosudo.com",
        featured: false,
        year: "2023",
        image: "/images/projects/bks.png",
    },
    {
        slug: "omnichannel-ecommerce-analytics-system",
        title: "Omnichannel E-commerce Analytics System",
        role: "Full-Stack Developer (Lead Frontend)",
        description:
            "A full-stack omnichannel platform integrating Shopee, Lazada, TikTok Shop, and Shopify for centralized analytics and operations.",
        highlights: [
            "Integrated Shopee, Lazada, TikTok Shop, and Shopify into one platform.",
            "Built dashboards for revenue, profit, expenses, and losses across stores.",
            "Implemented centralized product management for multi-marketplace catalogs.",
            "Developed bulk product upload workflows for multi-store operations.",
            "Automated cross-platform data aggregation to reduce manual tracking.",
        ],
        tech: ["React", "TypeScript", "Laravel", "MySQL", "REST API"],
        github: "#",
        live: "#",
        featured: true,
        year: "2025",
        image: "/images/projects/melon.png",
    },
    {
        slug: "enterprise-ecommerce-crm-hris-finance-ess",
        title: "E-commerce Platform with CRM, HRIS, Finance & ESS Modules",
        role: "Lead Frontend Developer",
        description:
            "A multi-module enterprise platform centralizing CRM, HRIS, Finance, and ESS with real-time communication and operational analytics.",
        highlights: [
            "Led frontend development for CRM, HRIS, Finance, and ESS modules.",
            "Integrated Shopee, Lazada, TikTok, and Facebook for real-time messaging sync.",
            "Built admin workflows for customer response and lead management in one system.",
            "Created dashboards for sales performance and customer insight tracking.",
            "Delivered ESS features for employee time logs and profile self-service.",
        ],
        tech: ["React", "TypeScript", "Laravel", "MySQL", "WebSocket"],
        github: "#",
        live: "#",
        featured: true,
        year: "2025",
        image: "/images/projects/rz.png",
    },
    {
        slug: "electronic-medical-record-system",
        title: "Electronic Medical Record (EMR) System",
        role: "Full-Stack Developer",
        description:
            "A full-stack EMR platform for digitized patient record management, consultation tracking, and usage analytics.",
        highlights: [
            "Built patient profile and medical history management workflows.",
            "Implemented consultation tracking with video recording support.",
            "Added consultation duration monitoring for operational visibility.",
            "Created analytics dashboards for patient interactions and system usage.",
            "Improved workflow by replacing manual records with digital processes.",
        ],
        tech: ["React", "TypeScript", "Laravel", "MySQL", "Media APIs"],
        github: "#",
        live: "#",
        featured: false,
        year: "2024",
        image: "/images/projects/emr.png",
    },
    {
        slug: "car-dealership-trading-loan-management",
        title: "Car Dealership Trading & Loan Management System",
        role: "Full-Stack Developer",
        description:
            "A full-stack car dealership platform with customer application landing pages and admin tools for loans, leads, and role-based operations.",
        highlights: [
            "Built customer loan application flows connected to admin review dashboards.",
            "Implemented backend role-based access control for team responsibilities.",
            "Integrated SMTP notifications with bank loan instructions after approvals.",
            "Created analytics dashboards for leads, sales, and application statuses.",
            "Added dynamic admin tools for vehicle inventory and landing-page updates.",
        ],
        tech: ["React", "TypeScript", "Node.js", "MySQL", "SMTP"],
        github: "#",
        live: "#",
        featured: false,
        year: "2024",
        image: "/images/projects/dbauto.png",
    },
];

export const getProjectBySlug = (slug: string): Project | null => {
    return projects.find((project) => project.slug === slug) ?? null;
};
