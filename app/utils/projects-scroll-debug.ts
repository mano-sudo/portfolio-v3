/**
 * Set to false to silence [projects-scroll] logs after you finish diagnosing.
 */
export const PROJECTS_SCROLL_DEBUG = false;

type ScrollSnapshot = Record<string, unknown>;

export function snapshotDocumentScrollState(): ScrollSnapshot {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return { note: "ssr" };
    }

    const html = document.documentElement;
    const body = document.body;
    const htmlStyle = window.getComputedStyle(html);
    const bodyStyle = window.getComputedStyle(body);
    const win = window as Window & { lenis?: { scroll?: number } };

    let lenisScroll: string | undefined;
    try {
        lenisScroll =
            typeof win.lenis?.scroll === "number"
                ? String(win.lenis.scroll)
                : win.lenis
                  ? "present"
                  : undefined;
    } catch {
        lenisScroll = "error";
    }

    return {
        href: window.location.href,
        pathname: window.location.pathname,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        maxTouchPoints: navigator.maxTouchPoints,
        htmlClientHeight: html.clientHeight,
        htmlScrollHeight: html.scrollHeight,
        bodyClientHeight: body.clientHeight,
        bodyScrollHeight: body.scrollHeight,
        scrollY: window.scrollY,
        htmlOverflow: htmlStyle.overflow,
        htmlOverflowY: htmlStyle.overflowY,
        bodyOverflow: bodyStyle.overflow,
        bodyOverflowY: bodyStyle.overflowY,
        bodyTouchAction: bodyStyle.touchAction,
        bodyPosition: bodyStyle.position,
        htmlClass: html.className,
        bodyClass: body.className,
        htmlStyleOverflow: html.style.overflow,
        htmlStyleOverflowY: html.style.overflowY,
        bodyStyleOverflow: body.style.overflow,
        bodyStyleOverflowY: body.style.overflowY,
        bodyStyleTouchAction: body.style.touchAction,
        session_routeTransitionLock: window.sessionStorage.getItem("route-transition-lock"),
        session_projectTransitionReveal: window.sessionStorage.getItem("project-transition-reveal"),
        lenis: lenisScroll,
    };
}

export function logProjectsScroll(message: string, extra?: ScrollSnapshot): void {
    if (!PROJECTS_SCROLL_DEBUG) return;
    const snapshot = snapshotDocumentScrollState();
    console.log(`[projects-scroll] ${message}`, { ...snapshot, ...extra });
}

export function logPrefersHardNavContext(): ScrollSnapshot {
    if (typeof window === "undefined") return {};
    const mq = window.matchMedia("(max-width: 1024px)");
    return {
        maxTouchPoints: navigator.maxTouchPoints,
        matchMedia_maxWidth_1024: mq.matches,
        prefersHardNav:
            navigator.maxTouchPoints > 0 && mq.matches,
    };
}
