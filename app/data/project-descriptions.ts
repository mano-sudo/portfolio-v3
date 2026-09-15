/**
 * Long-form project blurbs keyed by slug.
 * Kept separate from the main project list so detail routing and static generation stay predictable.
 */
export const PROJECT_DESCRIPTIONS: Readonly<Record<string, string>> = {
    "outfit-haven-ecommerce-platform":
        "A modern e-commerce platform for local fashion brands in the Philippines with dynamic storefront experiences and secure order handling.",
    "burger-ka-samen-ordering-system":
        "A full-stack burger ordering platform with customer cart and checkout plus an admin dashboard for products, orders, and users.",
    "omnichannel-ecommerce-analytics-system":
        "A full-stack omnichannel platform integrating Shopee, Lazada, TikTok Shop, and Shopify for centralized analytics and operations.",
    "enterprise-ecommerce-crm-hris-finance-ess":
        "A multi-module enterprise platform centralizing CRM, HRIS, Finance, and ESS with real-time communication and operational analytics.",
    "electronic-medical-record-system":
        "A full-stack EMR platform for digitized patient record management, consultation tracking, and usage analytics.",
    "car-dealership-trading-loan-management":
        "A full-stack car dealership platform with customer application landing pages and admin tools for loans, leads, and role-based operations.",
};

export function getProjectDescription(slug: string): string | undefined {
    return PROJECT_DESCRIPTIONS[slug];
}
