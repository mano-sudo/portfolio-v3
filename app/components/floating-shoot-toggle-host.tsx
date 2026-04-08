"use client";

import dynamic from "next/dynamic";

const FloatingShootToggle = dynamic(() => import("./floating-shoot-toggle"), {
    ssr: false,
});

export default function FloatingShootToggleHost(): React.JSX.Element {
    return <FloatingShootToggle />;
}
