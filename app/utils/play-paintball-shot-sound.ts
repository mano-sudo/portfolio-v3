let sharedContext: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
        const AC =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        if (!sharedContext || sharedContext.state === "closed") {
            sharedContext = new AC();
        }
        return sharedContext;
    } catch {
        return null;
    }
}

/**
 * Create / resume the shared AudioContext from a direct user click (shoot toggle).
 * Helps autoplay policies and avoids the first shot running before `resume()` finishes.
 */
export function ensurePaintballAudioRunning(): Promise<void> {
    const ctx = getSharedAudioContext();
    if (!ctx || ctx.state === "closed") return Promise.resolve();
    if (ctx.state === "suspended") return ctx.resume().catch(() => undefined);
    return Promise.resolve();
}

function scheduleShot(ctx: AudioContext): void {
    const master = ctx.createGain();
    master.gain.value = 0.65;
    master.connect(ctx.destination);

    const now = ctx.currentTime;
    const duration = 0.09;
    const detuneHz = (Math.random() - 0.5) * 140;

    const sampleRate = ctx.sampleRate;
    const frameCount = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
        const t = i / frameCount;
        const env = Math.exp(-t * 18);
        data[i] = (Math.random() * 2 - 1) * env * 0.92;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 920 + detuneHz * 0.6;
    bandpass.Q.value = 2.1;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
    noise.stop(now + duration);

    const body = ctx.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(200 + detuneHz * 0.35, now);
    body.frequency.exponentialRampToValueAtTime(78, now + 0.055);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.22, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.068);

    body.connect(bodyGain);
    bodyGain.connect(master);
    body.start(now);
    body.stop(now + 0.072);
}

/**
 * Short synthetic paintball-marker style pop (no external assets).
 * Call from a user gesture when possible; use {@link ensurePaintballAudioRunning} on toggle-on.
 */
export function playPaintballShotSound(): void {
    if (typeof window === "undefined") return;

    const ctx = getSharedAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const play = () => {
        try {
            scheduleShot(ctx);
        } catch {
            //
        }
    };

    // Do not gate on ctx.state === "running" after resume(); it can lag one microtask.
    if (ctx.state === "suspended") {
        void ctx.resume().then(play).catch(() => {
            //
        });
    } else {
        play();
    }
}
