"use client";

import dynamic from "next/dynamic";

const FloatingBlastToggle = dynamic(() => import("./floating-blast-toggle"), {
    ssr: false,
});

export default function FloatingBlastToggleHost(): React.JSX.Element {
    return <FloatingBlastToggle />;
}
