/**
 * Lira Finite State Machine — Dual-Activation Control System
 *
 * States:
 *   SLEEPING → IDLE (wake) → WAKE_LISTENING → MANUAL_ACTIVE | VOICE_ACTIVE → PROCESSING → SPEAKING → SLEEPING
 *
 * Key change: After a full pipeline cycle the FSM returns to SLEEPING,
 * NOT WAKE_LISTENING. Continuous background mic is therefore STOPPED
 * once Lira is awake and working. The mic only runs when the user
 * explicitly wakes Lira (voice wake-word or touch) and then again
 * during the single-utterance recording window.
 */

import { AsyncMutex } from './lira-mutex'

// ─── Types ─────────────────────────────────────────────────────────────────

export type LiraState =
    | 'SLEEPING'        // Screen dark — mic OFF
    | 'IDLE'            // Just woke — greeting phase
    | 'WAKE_LISTENING'  // Listening for user command (brief window)
    | 'MANUAL_ACTIVE'   // Tap-triggered recording
    | 'VOICE_ACTIVE'    // Wake-word-triggered recording
    | 'PROCESSING'
    | 'SPEAKING'

export type ActivationSource = 'NONE' | 'MANUAL' | 'WAKE_WORD'

export type LiraEvent =
    | { type: 'STATE_CHANGED'; state: LiraState }
    | { type: 'TRANSCRIPT_UPDATE'; text: string; isFinal: boolean }
    | { type: 'RESPONSE_READY'; text: string }
    | { type: 'ERROR'; error: Error }
    | { type: 'ACTIVATION_SOURCE'; source: ActivationSource }

export type LiraEventHandler = (event: LiraEvent) => void

// ─── UI State ─────────────────────────────────────────────────────────────

export interface LiraUIState {
    currentState: LiraState
    tapButtonEnabled: boolean
    tapButtonLabel: string
    wakeWordActive: boolean
    statusLabel: string
    statusColor: 'gray' | 'blue' | 'red' | 'amber' | 'green' | 'emerald'
    animatePulse: boolean
    animateWave: boolean
    cancelButtonVisible: boolean
    modeIndicatorText: string | null
    modeIndicatorVariant: 'manual' | 'voice' | null
    showProcessingDots: boolean
}

export function deriveUIState(state: LiraState, source: ActivationSource): LiraUIState {
    switch (state) {
        case 'SLEEPING':
            return {
                currentState: state,
                tapButtonEnabled: false,
                tapButtonLabel: 'Sleeping…',
                wakeWordActive: false,
                statusLabel: 'Say "Hi Lira" or tap to wake',
                statusColor: 'gray',
                animatePulse: false,
                animateWave: false,
                cancelButtonVisible: false,
                modeIndicatorText: null,
                modeIndicatorVariant: null,
                showProcessingDots: false,
            }

        case 'IDLE':
            return {
                currentState: state,
                tapButtonEnabled: true,
                tapButtonLabel: 'Tap to Talk',
                wakeWordActive: false,
                statusLabel: 'Say "Hi Lira" or tap mic',
                statusColor: 'gray',
                animatePulse: false,
                animateWave: false,
                cancelButtonVisible: false,
                modeIndicatorText: null,
                modeIndicatorVariant: null,
                showProcessingDots: false,
            }

        case 'WAKE_LISTENING':
            return {
                currentState: state,
                tapButtonEnabled: true,
                tapButtonLabel: 'Tap to Talk',
                wakeWordActive: true,
                statusLabel: 'Listening…',
                statusColor: 'blue',
                animatePulse: true,
                animateWave: false,
                cancelButtonVisible: false,
                modeIndicatorText: null,
                modeIndicatorVariant: null,
                showProcessingDots: false,
            }

        case 'MANUAL_ACTIVE':
            return {
                currentState: state,
                tapButtonEnabled: false,
                tapButtonLabel: 'Listening…',
                wakeWordActive: false,
                statusLabel: '🎤 Listening…',
                statusColor: 'red',
                animatePulse: true,
                animateWave: true,
                cancelButtonVisible: true,
                modeIndicatorText: '✋ Manual Mode Active',
                modeIndicatorVariant: 'manual',
                showProcessingDots: false,
            }

        case 'VOICE_ACTIVE':
            return {
                currentState: state,
                tapButtonEnabled: false,
                tapButtonLabel: 'Voice Mode',
                wakeWordActive: false,
                statusLabel: '🎤 Listening…',
                statusColor: 'red',
                animatePulse: true,
                animateWave: true,
                cancelButtonVisible: true,
                modeIndicatorText: '🗣️ Voice Mode Active',
                modeIndicatorVariant: 'voice',
                showProcessingDots: false,
            }

        case 'PROCESSING':
            return {
                currentState: state,
                tapButtonEnabled: false,
                tapButtonLabel: 'Processing…',
                wakeWordActive: false,
                statusLabel: '⚙️ Processing…',
                statusColor: 'amber',
                animatePulse: false,
                animateWave: false,
                cancelButtonVisible: false,
                modeIndicatorText: null,
                modeIndicatorVariant: null,
                showProcessingDots: true,
            }

        case 'SPEAKING':
            return {
                currentState: state,
                tapButtonEnabled: false,
                tapButtonLabel: 'Speaking…',
                wakeWordActive: false,
                statusLabel: '🔊 Speaking…',
                statusColor: 'green',
                animatePulse: false,
                animateWave: true,
                cancelButtonVisible: true,
                modeIndicatorText: null,
                modeIndicatorVariant: null,
                showProcessingDots: false,
            }
    }
}

// ─── Timeouts ───────────────────────────────────────────────────────────────

export const TIMEOUTS = {
    SILENCE_MS: 2_000,
    RECORD_MAX_MS: 15_000,
    PROCESSING_MAX_MS: 30_000,
} as const

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms)
        ),
    ])
}

// ─── Lira FSM ───────────────────────────────────────────────────────────────

export class LiraFSM {
    private state: LiraState = 'SLEEPING'
    private source: ActivationSource = 'NONE'
    private mutex = new AsyncMutex()
    private cancelled = false
    private abortController = new AbortController()
    private listeners: Set<LiraEventHandler> = new Set()

    private onStartListeningCb: (() => void) | null = null
    private onStopListeningCb: (() => void) | null = null
    private onSpeakCb: ((text: string, signal: AbortSignal) => Promise<void>) | null = null
    private onProcessQueryCb: ((query: string) => Promise<string>) | null = null

    /** Callback to notify React that Lira is waking (for animation) */
    onWake: (() => void) | null = null
    /** Callback to notify React to go to sleep */
    onSleep: (() => void) | null = null



    // ─── Event system ────────────────────────────────────────────────────────

    subscribe(handler: LiraEventHandler): () => void {
        this.listeners.add(handler)
        return () => this.listeners.delete(handler)
    }

    private emit(event: LiraEvent): void {
        this.listeners.forEach(h => h(event))
    }

    // ─── Services ───────────────────────────────────────────────────────────

    registerListening(start: () => void, stop: () => void): void {
        this.onStartListeningCb = start
        this.onStopListeningCb = stop
    }

    registerSpeak(fn: (text: string, signal: AbortSignal) => Promise<void>): void {
        this.onSpeakCb = fn
    }

    registerProcessQuery(fn: (query: string) => Promise<string>): void {
        this.onProcessQueryCb = fn
    }

    // ─── State ──────────────────────────────────────────────────────────────

    getState(): LiraState { return this.state }
    getSource(): ActivationSource { return this.source }
    getUIState(): LiraUIState { return deriveUIState(this.state, this.source) }

    private transition(next: LiraState): void {
        if (this.state === next) return
        console.log(`[Lira FSM] ${this.state} → ${next}`)
        this.state = next
        this.source = this.derivedSource(next)
        this.emit({ type: 'STATE_CHANGED', state: next })
        this.emit({ type: 'ACTIVATION_SOURCE', source: this.source })
    }

    private derivedSource(state: LiraState): ActivationSource {
        if (state === 'MANUAL_ACTIVE') return 'MANUAL'
        if (state === 'VOICE_ACTIVE') return 'WAKE_WORD'
        if (state === 'IDLE' || state === 'WAKE_LISTENING' || state === 'SLEEPING') return 'NONE'
        return this.source
    }

    // ─── Session persistence key ──────────────────────────────────────────────
    private static readonly SESSION_KEY = 'lira_awake'

    private static saveAwake(): void {
        try { if (typeof window !== 'undefined') sessionStorage.setItem(LiraFSM.SESSION_KEY, '1') } catch { /* ignore */ }
    }
    private static clearAwake(): void {
        try { if (typeof window !== 'undefined') sessionStorage.removeItem(LiraFSM.SESSION_KEY) } catch { /* ignore */ }
    }
    private static wasAwake(): boolean {
        try { return typeof window !== 'undefined' && sessionStorage.getItem(LiraFSM.SESSION_KEY) === '1' } catch { return false }
    }

    // ─── Init / Boot ─────────────────────────────────────────────────────────
    /**
     * On first load: if the user had already woken Lira before navigating away,
     * restore the awake state immediately so she stays active across page visits.
     * Only starts in SLEEPING if the user has never woken her (or explicitly slept).
     */
    async initialize(): Promise<void> {
        if (LiraFSM.wasAwake()) {
            // Restore awake — skip sleep screen entirely
            this.transition('IDLE')
            this.onWake?.()
            this.startWakeListening()
        } else {
            this.transition('SLEEPING')
        }
    }

    // ─── Wake (called by hook on "Hi Lira" or touch) ─────────────────────────
    wake(): void {
        if (this.state !== 'SLEEPING') return
        LiraFSM.saveAwake()   // persist — survives page navigation
        this.transition('IDLE')
        this.onWake?.()
        this.startWakeListening()
    }

    private startWakeListening(): void {
        this.transition('WAKE_LISTENING')
        this.onStartListeningCb?.()
    }

    // ─── Sleep (from UI or auto-timer) ───────────────────────────────────────
    /** Only called by the explicit sleep button — clears the session flag. */
    goToSleep(): void {
        if (this.state === 'SLEEPING') return
        LiraFSM.clearAwake()  // forget awake state — next visit starts sleeping
        this.onStopListeningCb?.()
        this.transition('SLEEPING')
        this.onSleep?.()
    }

    // ─── Manual Tap ──────────────────────────────────────────────────────────
    async onManualTap(): Promise<void> {
        // ── Tap during SPEAKING: interrupt current speech, jump to listening ──
        // This lets the user ask a new question with a single tap instead of
        // needing to press Stop, then tap Mic.
        if (this.state === 'SPEAKING') {
            this.interrupt()
            // safeReset() will fire async — skip to WAKE_LISTENING immediately
            // so the user doesn't have to wait for the 1s cooldown
            this.transition('IDLE')
            this.startWakeListening()
            return
        }

        if (this.state !== 'WAKE_LISTENING') {
            console.log('[Lira FSM] Manual tap ignored — state:', this.state)
            return
        }
        if (!this.mutex.tryAcquire()) {
            console.log('[Lira FSM] Manual tap ignored — mutex locked')
            return
        }

        this.cancelled = false
        this.abortController = new AbortController()

        try {
            this.onStopListeningCb?.()
            this.transition('MANUAL_ACTIVE')

            const query = await this.awaitTranscript()
            if (this.cancelled || !query.trim()) return

            const response = await this.runProcessing(query)
            if (this.cancelled) return

            await this.runSpeaking(response)
        } catch (err) {
            this.handleError(err as Error)
        } finally {
            await this.safeReset()
        }
    }

    // ─── Wake Word Detected ────────────────────────────────────────────────
    async onWakeWordDetected(): Promise<void> {
        if (this.state !== 'WAKE_LISTENING') {
            console.log('[Lira FSM] Wake word ignored — state:', this.state)
            return
        }
        if (!this.mutex.tryAcquire()) {
            console.log('[Lira FSM] Wake word ignored — mutex locked')
            return
        }

        this.cancelled = false
        this.abortController = new AbortController()

        try {
            this.onStopListeningCb?.()
            this.transition('VOICE_ACTIVE')

            const query = await this.awaitTranscript()
            if (this.cancelled || !query.trim()) return

            const response = await this.runProcessing(query)
            if (this.cancelled) return

            await this.runSpeaking(response)
        } catch (err) {
            this.handleError(err as Error)
        } finally {
            await this.safeReset()
        }
    }

    // ─── Pipeline steps ───────────────────────────────────────────────────────

    private transcriptResolver: ((query: string) => void) | null = null

    private awaitTranscript(): Promise<string> {
        return withTimeout(
            new Promise<string>(resolve => { this.transcriptResolver = resolve }),
            TIMEOUTS.RECORD_MAX_MS,
            'Recording'
        )
    }

    submitTranscript(query: string): void {
        if (this.transcriptResolver) {
            this.transcriptResolver(query)
            this.transcriptResolver = null
        }
    }

    private async runProcessing(query: string): Promise<string> {
        this.transition('PROCESSING')
        if (!this.onProcessQueryCb) throw new Error('No query processor registered')
        return withTimeout(this.onProcessQueryCb(query), TIMEOUTS.PROCESSING_MAX_MS, 'Processing')
    }

    private async runSpeaking(text: string): Promise<void> {
        this.transition('SPEAKING')
        this.emit({ type: 'RESPONSE_READY', text })
        if (!this.onSpeakCb) return
        // Natural "thinking" pause before speaking — makes it feel human like Alexa/Siri
        await new Promise(resolve => setTimeout(resolve, 400))
        if (this.cancelled) return
        await this.onSpeakCb(text, this.abortController.signal).catch(() => { })
    }

    // ─── Interrupt ────────────────────────────────────────────────────────────

    interrupt(): void {
        if (
            this.state !== 'SPEAKING' &&
            this.state !== 'PROCESSING' &&
            this.state !== 'MANUAL_ACTIVE' &&
            this.state !== 'VOICE_ACTIVE'
        ) return

        console.log('[Lira FSM] Interrupt triggered')
        this.cancelled = true
        this.abortController.abort()

        if (this.transcriptResolver) {
            this.transcriptResolver('')
            this.transcriptResolver = null
        }
    }

    // ─── Error ────────────────────────────────────────────────────────────────

    private handleError(err: Error): void {
        if (err.message.includes('aborted') || err.message.includes('Timeout')) {
            console.warn('[Lira FSM] Pipeline timeout/abort:', err.message)
        } else {
            console.error('[Lira FSM] Error:', err.message)
            this.emit({ type: 'ERROR', error: err })
        }
    }

    // ─── Safe Reset ──────────────────────────────────────────────────────────
    /**
     * After every pipeline run (success, error, or interrupt):
     *  1. Release mutex
     *  2. Return to WAKE_LISTENING so Lira stays awake for the next command.
     *
     * Lira ONLY goes to sleep when the user explicitly presses the sleep button
     * (which calls goToSleep() directly).
     */
    private async safeReset(): Promise<void> {
        this.cancelled = false
        this.transcriptResolver = null
        this.mutex.release()
        // Transition to IDLE first so the UI shows a brief "ready" state
        this.transition('IDLE')
        // ── Post-speech cooldown ────────────────────────────────────────────────
        // Wait 1 second before starting the mic again. Without this delay the
        // MediaRecorder picks up the room echo of Lira's TTS audio (the same way
        // a phone on speaker hears itself). echoCancellation also helps, but this
        // timing buffer is the definitive guard against self-activation.
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Only proceed if we haven't been interrupted or put to sleep
        if (this.state !== 'SLEEPING') {
            this.startWakeListening()
        }
    }

    destroy(): void {
        this.interrupt()
        this.listeners.clear()
        this.onStartListeningCb = null
        this.onStopListeningCb = null
        this.onSpeakCb = null
        this.onProcessQueryCb = null
        // Reset flags so the singleton is clean when component remounts (page navigation)
        this.cancelled = false
        this.transcriptResolver = null
        this.abortController = new AbortController()
        this.mutex.release()   // release any lock held mid-pipeline during navigation
    }
}

/** Singleton FSM instance */
export const liraFSM = new LiraFSM()
