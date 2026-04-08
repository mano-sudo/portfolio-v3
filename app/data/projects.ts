import { PROJECT_DESCRIPTIONS } from "./project-descriptions";

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

type ProjectCore = Omit<Project, "description">;

const projectCoreList: readonly ProjectCore[] = [
    {
        slug: "attendance-monitoring-system",
        title: "Attendance Monitoring System",
        role: "Full-Stack Developer",
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
        image: "/file.svg",
    },
    {
        slug: "outfit-haven-ecommerce-platform",
        title: "OutfitHaven: Responsive E-Commerce Platform",
        role: "Full-Stack Developer",
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
        image: "/file.svg",
    },
    {
        slug: "burger-ka-samen-ordering-system",
        title: "Burger Ka Samen Ordering System",
        role: "Full-Stack Developer",
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
        image: "/file.svg",
    },
    {
        slug: "omnichannel-ecommerce-analytics-system",
        title: "Omnichannel E-commerce Analytics System",
        role: "Full-Stack Developer (Lead Frontend)",
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
        image: "/file.svg",
    },
    {
        slug: "enterprise-ecommerce-crm-hris-finance-ess",
        title: "E-commerce Platform with CRM, HRIS, Finance & ESS Modules",
        role: "Lead Frontend Developer",
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
        image: "/file.svg",
    },
    {
        slug: "electronic-medical-record-system",
        title: "Electronic Medical Record (EMR) System",
        role: "Full-Stack Developer",
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
        image: "/file.svg",
    },
    {
        slug: "car-dealership-trading-loan-management",
        title: "Car Dealership Trading & Loan Management System",
        role: "Full-Stack Developer",
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
        image: "/file.svg",
    },
];

function attachDescription(core: ProjectCore): Project {
    const description = PROJECT_DESCRIPTIONS[core.slug];
    if (description === undefined) {
        throw new Error(`Missing PROJECT_DESCRIPTIONS entry for slug: ${core.slug}`);
    }
    return { ...core, description };
}

export const projects: readonly Project[] = projectCoreList.map(attachDescription);

export const getProjectBySlug = (slug: string): Project | null => {
    return projects.find((project) => project.slug === slug) ?? null;
};
