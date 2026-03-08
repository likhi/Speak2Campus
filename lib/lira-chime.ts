'use client'

/**
 * Lira Chime — Web Audio API activation sounds.
 * Pure synthesized audio, no external files required.
 */

function getAudioCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null
    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext
        if (!Ctx) return null
        return new Ctx()
    } catch {
        return null
    }
}

function tone(
    ctx: AudioContext,
    freq: number,
    startAt: number,
    duration: number,
    peak: number,
    type: OscillatorType = 'sine'
): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, startAt)
    gain.gain.setValueAtTime(0, startAt)
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(startAt + duration + 0.05)
}

/**
 * Two-tone ascending chime — plays when Lira wakes up (like Alexa).
 * C5 → E5 → G5 pleasant major triad arpeggio.
 */
export function playWakeChime(): void {
    const ctx = getAudioCtx()
    if (!ctx) return
    const t = ctx.currentTime
    tone(ctx, 523.25, t, 0.45, 0.15)        // C5
    tone(ctx, 659.25, t + 0.12, 0.45, 0.13) // E5
    tone(ctx, 783.99, t + 0.24, 0.55, 0.10) // G5
    setTimeout(() => ctx.close().catch(() => { }), 900)
}

/**
 * Single soft blip — plays when mic starts recording (like Siri's "ting").
 */
export function playListenChime(): void {
    const ctx = getAudioCtx()
    if (!ctx) return
    const t = ctx.currentTime
    tone(ctx, 1046.5, t, 0.18, 0.07) // C6 soft blip
    setTimeout(() => ctx.close().catch(() => { }), 300)
}

/**
 * Descending two-tone — plays when Lira finishes speaking.
 */
export function playEndChime(): void {
    const ctx = getAudioCtx()
    if (!ctx) return
    const t = ctx.currentTime
    tone(ctx, 659.25, t, 0.3, 0.09)        // E5
    tone(ctx, 523.25, t + 0.15, 0.3, 0.07) // C5
    setTimeout(() => ctx.close().catch(() => { }), 600)
}
