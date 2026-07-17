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
 * Create / resume the shared AudioContext from a direct user click (glitch toggle).
 * Helps autoplay policies.
 */
export function ensureGlitchAudioRunning(): Promise<void> {
    const ctx = getSharedAudioContext();
    if (!ctx || ctx.state === "closed") return Promise.resolve();
    if (ctx.state === "suspended") return ctx.resume().catch(() => undefined);
    return Promise.resolve();
}

function scheduleGlitch(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 0.08; // 80ms

    // Gain node for master volume
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.35, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + duration);
    master.connect(ctx.destination);

    // Glitch sound consists of:
    // 1) A short burst of white noise with a digital step pattern (bitcrushed texture)
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        const step = Math.floor(i / 100);
        data[i] = (Math.random() * 2 - 1) * (step % 2 === 0 ? 0.8 : 0.2);
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make it sound sharp/digital (bandpass filter sweeping down)
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.linearRampToValueAtTime(600, now + duration);
    filter.Q.setValueAtTime(3.5, now);

    noiseNode.connect(filter);
    filter.connect(master);
    noiseNode.start(now);
    noiseNode.stop(now + duration);

    // 2) A pitch-sweeping square/sawtooth oscillator for retro synth textures
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(200, now + 0.02);
    osc.frequency.setValueAtTime(1200, now + 0.04);
    
    // Quick gain envelope for the oscillator
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.setValueAtTime(0.08, now + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(now);
    osc.stop(now + duration);
}

/**
 * Short synthetic digital/sci-fi static blip (no external assets).
 */
export function playGlitchSound(): void {
    if (typeof window === "undefined") return;

    const ctx = getSharedAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const play = () => {
        try {
            scheduleGlitch(ctx);
        } catch {
            //
        }
    };

    if (ctx.state === "suspended") {
        void ctx.resume().then(play).catch(() => {});
    } else {
        play();
    }
}
