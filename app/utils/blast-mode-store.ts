"use client";

import { useSyncExternalStore } from "react";

export const BLAST_MODE_STORAGE_KEY = "blast-toggle-state";

function readBlastModeFromStorage(): boolean {
    if (typeof window === "undefined") return false;
    try {
        return window.localStorage.getItem(BLAST_MODE_STORAGE_KEY) === "on";
    } catch {
        return false;
    }
}

const listeners = new Set<() => void>();

export function notifyBlastModeSubscribers(): void {
    for (const listener of listeners) {
        listener();
    }
}

export function subscribeBlastMode(onStoreChange: () => void): () => void {
    const onStorage = (event: StorageEvent): void => {
        if (event.key === BLAST_MODE_STORAGE_KEY || event.key === null) {
            onStoreChange();
        }
    };
    window.addEventListener("storage", onStorage);
    listeners.add(onStoreChange);
    return () => {
        window.removeEventListener("storage", onStorage);
        listeners.delete(onStoreChange);
    };
}

export function getBlastModeSnapshot(): boolean {
    return readBlastModeFromStorage();
}

/** True while the paintball / blast-mode toggle is on (same source as FloatingBlastToggle). */
export function useBlastModeOn(): boolean {
    return useSyncExternalStore(subscribeBlastMode, getBlastModeSnapshot, () => false);
}
