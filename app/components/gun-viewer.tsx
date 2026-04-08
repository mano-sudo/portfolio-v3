"use client";

import * as React from "react";
import { Canvas, type ThreeElements, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import type { Group } from "three";

type GunModelProps = GroupProps & {
    url: string;
};

type GroupProps = ThreeElements["group"];

function GunModel({ url, ...props }: GunModelProps) {
    const gltf = useGLTF(url);
    return <primitive object={gltf.scene} {...props} />;
}

type GunViewerProps = {
    aimX: number;
    aimY: number;
};

function GunRig({ aimX, aimY }: GunViewerProps): React.JSX.Element {
    const yawRef = React.useRef<Group | null>(null);
    const pitchRef = React.useRef<Group | null>(null);
    // Neutral facing direction when cursor is centered.
    const baseY = Math.PI * 1.20;
    const baseX = -0.08;

    useFrame(() => {
        const yawGroup = yawRef.current;
        const pitchGroup = pitchRef.current;
        if (!yawGroup || !pitchGroup) return;

        // Keep both sides closer in feel, but retain slight right bias.
        const yawLeftStrength = 1.20;
        const yawRightStrength = 1.20;
        const yawOffset = aimX < 0
            ? (-aimX) * yawLeftStrength
            : -(aimX * yawRightStrength);

        const targetY = baseY + yawOffset;
        const pitchUpStrength = 0.5;
        const pitchDownStrength = 0.58;
        const pitchOffset = aimY < 0
            ? (-aimY) * pitchUpStrength
            : -(aimY * pitchDownStrength);
        const targetX = baseX - pitchOffset;

        yawGroup.rotation.y += (targetY - yawGroup.rotation.y) * 0.12;
        pitchGroup.rotation.x += (targetX - pitchGroup.rotation.x) * 0.12;
    });

    return (
        <group ref={yawRef}>
            <group ref={pitchRef}>
                <GunModel url="/paintball_gun.glb" scale={1.2} position={[0, -0.03, 0]} />
            </group>
        </group>
    );
}

export default function GunViewer({ aimX, aimY }: GunViewerProps): React.JSX.Element {
    return (
        <div className="h-64 w-[min(92vw,30rem)] sm:h-80 sm:w-xl md:h-96 md:w-176 overflow-visible flex items-end justify-center">
            <div className="h-60 w-[min(88vw,24rem)] sm:h-72 sm:w-md md:h-88 md:w-xl">
                <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [1.75, 0.85, 2.1], fov: 36 }}
                    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
                >
                    <React.Suspense fallback={null}>
                        <ambientLight intensity={0.9} />
                        <directionalLight position={[2, 2, 2]} intensity={1.2} />
                        <GunRig aimX={aimX} aimY={aimY} />
                        <Environment preset="city" />
                    </React.Suspense>
                </Canvas>
            </div>
        </div>
    );
}

useGLTF.preload("/paintball_gun.glb");

