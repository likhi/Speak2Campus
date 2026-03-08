'use client'

/**
 * useLiraFSM — React hook binding LiraFSM to React state.
 *
 * Mic strategy (NEW):
 *  - SLEEPING  → Passive mic: only listens for wake words, nothing else.
 *  - IDLE / WAKE_LISTENING → Brief full-mic window for command capture.
 *  - MANUAL_ACTIVE / VOICE_ACTIVE → Full mic for user's utterance.
 *  - PROCESSING / SPEAKING → Mic is OFF.
 *  - After pipeline completes → FSM returns to SLEEPING, mic OFF.
 *
 * The hook exposes `wakeFromTouch()` so the UI can call it on tap/click.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { liraFSM, type LiraState, type LiraUIState, deriveUIState } from '@/lib/lira-fsm'

// ─── Wake word variants ────────────────────────────────────────────────────
const WAKE_WORDS = ['lira', 'hey lira', 'hi lira', 'hlo lira', 'ok lira', 'hello lira']
const STOP_WORDS = ['stop', 'cancel', 'quiet', 'silence', 'shut up']

interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
}
interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start: () => void
    stop: () => void
    abort: () => void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onend: (() => void) | null
    onerror: ((event: Event & { error: string }) => void) | null
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInstance
        webkitSpeechRecognition: new () => SpeechRecognitionInstance
    }
}

export interface UseLiraFSMReturn {
    state: LiraState
    ui: LiraUIState
    transcript: string
    speechSupported: boolean
    onTap: () => void
    onInterrupt: () => void
    /** Call this when user touches the screen during SLEEPING */
    wakeFromTouch: () => void
    /** Manually put Lira back to sleep */
    goToSleep: () => void
    isSleeping: boolean
    isWakingUp: boolean
    /** Speak a text string directly (for text-input / quick-action paths) */
    speakText: (text: string) => void
}

export function useLiraFSM(
    processQuery: (query: string) => Promise<string>
): UseLiraFSMReturn {

    const [state, setState] = useState<LiraState>('SLEEPING')
    const [transcript, setTranscript] = useState('')
    const [speechSupported, setSpeported] = useState(true)
    const [isWakingUp, setIsWakingUp] = useState(false)

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
    const recognitionActive = useRef(false)
    const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastTranscript = useRef('')
    const stateRef = useRef<LiraState>('SLEEPING')
    // Tracks the AbortController of the currently active speakText() call
    const speakCtrlRef = useRef<AbortController | null>(null)

    // ─── Keep stateRef in sync ────────────────────────────────────────────
    useEffect(() => { stateRef.current = state }, [state])

    // ─── Voice selection ──────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
        const pick = () => {
            const voices = speechSynthesis.getVoices()
            femaleVoiceRef.current = voices.find(v =>
                /female|woman|zira|susan|samantha|linda|eva|emma/i.test(v.name)
            ) || voices[1] || voices[0] || null
        }
        pick()
        window.speechSynthesis.onvoiceschanged = pick
    }, [])

    // ─── TTS ─────────────────────────────────────────────────────────────
    /**
     * Splits text into sentence-sized chunks so Chrome doesn't silently
     * drop long utterances (Chrome has a ~220-char / ~15-sec pause bug).
     */
    const splitIntoChunks = (text: string): string[] => {
        const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]
        const chunks: string[] = []
        let current = ''
        for (const s of sentences) {
            if ((current + s).length > 200) {
                if (current.trim()) chunks.push(current.trim())
                current = s
            } else {
                current += s
            }
        }
        if (current.trim()) chunks.push(current.trim())
        return chunks.length > 0 ? chunks : [text]
    }

    const speak = useCallback((text: string, signal: AbortSignal): Promise<void> => {
        return new Promise(resolve => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
                resolve()
                return
            }

            // Cancel any running speech first
            window.speechSynthesis.cancel()

            let aborted = false
            let keepAliveTimer: ReturnType<typeof setInterval> | null = null

            const cleanup = () => {
                if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null }
                window.speechSynthesis.cancel()
            }

            signal.addEventListener('abort', () => {
                aborted = true
                cleanup()
                resolve()
            }, { once: true })

            if (aborted) { resolve(); return }

            // Re-fetch voices at speak-time to avoid the loading race on first call
            const voices = window.speechSynthesis.getVoices()
            const voice =
                femaleVoiceRef.current ||
                voices.find(v => /female|woman|zira|susan|samantha|linda|eva|emma/i.test(v.name)) ||
                voices.find(v => v.lang.startsWith('en')) ||
                voices[0] ||
                null

            const chunks = splitIntoChunks(text)
            let chunkIndex = 0

            const speakNext = () => {
                if (aborted || chunkIndex >= chunks.length) {
                    cleanup()
                    resolve()
                    return
                }

                const chunk = chunks[chunkIndex++]
                const utterance = new SpeechSynthesisUtterance(chunk)
                utterance.lang = 'en-IN'
                utterance.rate = 0.88
                utterance.pitch = 1.05
                utterance.volume = 1.0
                if (voice) utterance.voice = voice

                utterance.onend = () => {
                    if (aborted) { cleanup(); resolve(); return }
                    setTimeout(speakNext, 120)
                }
                utterance.onerror = (e) => {
                    console.warn('[Lira TTS] error on chunk:', e.error)
                    // Try next chunk on error rather than stopping completely
                    setTimeout(speakNext, 200)
                }

                // Chrome keep-alive: Chrome silently pauses synthesis after ~15s.
                // Calling resume() every 10s prevents this.
                if (keepAliveTimer) clearInterval(keepAliveTimer)
                keepAliveTimer = setInterval(() => {
                    if (window.speechSynthesis.paused) {
                        window.speechSynthesis.resume()
                    }
                }, 10_000)

                window.speechSynthesis.speak(utterance)
            }

            // Small settle delay after cancel() — Chrome needs ~80ms before
            // it accepts a new speak() call reliably.
            setTimeout(speakNext, 80)
        })
    }, [])

    // ─── Silence timer ────────────────────────────────────────────────────
    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    }, [])

    // ─── Mic control ─────────────────────────────────────────────────────
    /**
     * startListening: called when FSM moves to WAKE_LISTENING.
     * Starts the recognition engine if not already active.
     */
    const startListening = useCallback(() => {
        if (recognitionRef.current && !recognitionActive.current) {
            try { recognitionRef.current.start(); recognitionActive.current = true } catch { /* already active */ }
        }
    }, [])

    /**
     * stopListening: called when FSM disables the mic.
     * Aborts recognition completely — NO background drain.
     */
    const stopListening = useCallback(() => {
        clearSilenceTimer()
        if (recognitionRef.current && recognitionActive.current) {
            try { recognitionRef.current.abort() } catch { /* ignore */ }
            recognitionActive.current = false
        }
    }, [clearSilenceTimer])

    // ─── Register services ────────────────────────────────────────────────
    useEffect(() => {
        liraFSM.registerListening(startListening, stopListening)
        liraFSM.registerSpeak(speak)
        liraFSM.registerProcessQuery(processQuery)
    }, [startListening, stopListening, speak, processQuery])

    // ─── FSM callbacks for wake / sleep animation ─────────────────────────
    useEffect(() => {
        liraFSM.onWake = () => {
            setIsWakingUp(true)
            setTimeout(() => setIsWakingUp(false), 1000)
        }
        liraFSM.onSleep = () => {
            setTranscript('')
        }
    }, [])

    // ─── FSM state subscription ───────────────────────────────────────────
    useEffect(() => {
        const unsub = liraFSM.subscribe(event => {
            if (event.type === 'STATE_CHANGED') {
                setState(event.state)
                if (event.state === 'SLEEPING') setTranscript('')
            }
        })
        return unsub
    }, [])

    // ─── Speech Recognition engine ────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return
        const API = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!API) { setSpeported(false); return }

        const recognition = new API()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-IN'
        recognitionRef.current = recognition

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = ''
            let final = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const r = event.results[i]
                if (r.isFinal) final += r[0].transcript + ' '
                else interim += r[0].transcript
            }

            const text = (final || interim).trim()
            setTranscript(text)
            lastTranscript.current = text
            const lower = text.toLowerCase()
            const current = stateRef.current

            // ── Passive wake-word detection (SLEEPING state) ───────────────
            if (current === 'SLEEPING') {
                const detected = WAKE_WORDS.some(w => lower.includes(w))
                if (detected) {
                    // Stop the passive recognition first
                    try { recognition.abort() } catch { /* ignore */ }
                    recognitionActive.current = false
                    // Wake the FSM (which will call startListening via WAKE_LISTENING)
                    liraFSM.wake()

                    // Check if they spoke a full command right after wake word
                    const command = WAKE_WORDS.reduce((acc, w) => {
                        const idx = lower.indexOf(w)
                        if (idx !== -1) return lower.slice(idx + w.length).trim()
                        return acc
                    }, '')
                    if (command.length > 3) {
                        // Full command in one shot — submit after wake
                        liraFSM.onWakeWordDetected().then(() => {
                            liraFSM.submitTranscript(command)
                        })
                    } else {
                        liraFSM.onWakeWordDetected()
                    }
                    return
                }
                // Not a wake word — ignore entirely (passive mode)
                return
            }

            // ── Active wake-word detection (WAKE_LISTENING) ───────────────
            if (current === 'WAKE_LISTENING') {
                const detected = WAKE_WORDS.some(w => lower.includes(w))
                if (detected) {
                    const command = WAKE_WORDS.reduce((acc, w) => {
                        const idx = lower.indexOf(w)
                        if (idx !== -1) return lower.slice(idx + w.length).trim()
                        return acc
                    }, '')
                    if (command.length > 3) {
                        liraFSM.onWakeWordDetected().then(() => {
                            liraFSM.submitTranscript(command)
                        })
                    } else {
                        liraFSM.onWakeWordDetected()
                    }
                    return
                }
            }

            // ── Active recording: submit on silence ───────────────────────
            if (current === 'MANUAL_ACTIVE' || current === 'VOICE_ACTIVE') {
                if (final.trim()) {
                    clearSilenceTimer()
                    silenceTimerRef.current = setTimeout(() => {
                        if (stateRef.current === 'MANUAL_ACTIVE' || stateRef.current === 'VOICE_ACTIVE') {
                            const captured = lastTranscript.current.trim()
                            if (STOP_WORDS.some(w => captured.toLowerCase().startsWith(w))) {
                                liraFSM.interrupt()
                            } else {
                                liraFSM.submitTranscript(captured)
                            }
                        }
                    }, 1800)
                }
            }
        }

        recognition.onend = () => {
            recognitionActive.current = false
            const current = stateRef.current
            // Auto-restart whenever Lira is awake and listening
            if (current === 'SLEEPING' || current === 'WAKE_LISTENING' || current === 'IDLE') {
                try { recognition.start(); recognitionActive.current = true } catch { /* ignore */ }
            }
            // MANUAL_ACTIVE, VOICE_ACTIVE, PROCESSING, SPEAKING → mic stays OFF
        }

        recognition.onerror = (e) => {
            recognitionActive.current = false
            if (e.error === 'not-allowed') { setSpeported(false); return }
            // Auto-recover whenever Lira is awake and listening
            setTimeout(() => {
                const current = stateRef.current
                if (current === 'SLEEPING' || current === 'WAKE_LISTENING' || current === 'IDLE') {
                    try { recognition.start(); recognitionActive.current = true } catch { /* ignore */ }
                }
            }, 1500)
        }

        // Boot: start in SLEEPING with passive mic running
        liraFSM.initialize().catch(console.error)
        // Start passive mic immediately for wake-word detection
        try { recognition.start(); recognitionActive.current = true } catch { /* ignore */ }

        return () => {
            // ── Full teardown on unmount (e.g. page navigation) ───────────
            liraFSM.destroy()                          // aborts FSM speech + mic
            try { recognition.abort() } catch { /* ignore */ }
            // Cancel text-input/quick-action speech path
            if (speakCtrlRef.current) {
                speakCtrlRef.current.abort()
                speakCtrlRef.current = null
            }
            // Hard stop — catches any speech the browser is still queuing
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ─── Public API ───────────────────────────────────────────────────────
    const onTap = useCallback(() => liraFSM.onManualTap(), [])
    const onInterrupt = useCallback(() => liraFSM.interrupt(), [])
    const wakeFromTouch = useCallback(() => {
        if (stateRef.current === 'SLEEPING') liraFSM.wake()
    }, [])
    const goToSleep = useCallback(() => liraFSM.goToSleep(), [])

    /**
     * speakText — lets the text-input / quick-action paths speak a response
     * without going through the full FSM voice pipeline.
     *
     * ✅ Cancels any currently active speak (FSM voice path OR previous speakText)
     *    before starting the new one, so a new query always interrupts mid-speech.
     * ✅ Calling speakText('') is a "cancel only" signal — stops current speech
     *    without starting a new utterance.
     */
    const speakText = useCallback((text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

        // 1. Interrupt FSM voice-path speaking (SPEAKING / PROCESSING states)
        liraFSM.interrupt()

        // 2. Cancel any previous speakText() that is still running
        if (speakCtrlRef.current) {
            speakCtrlRef.current.abort()
            speakCtrlRef.current = null
        }

        // 3. Empty string = cancel-only, don't start a new utterance
        if (!text.trim()) return

        // 4. Start fresh
        const ctrl = new AbortController()
        speakCtrlRef.current = ctrl
        speak(text, ctrl.signal)
            .then(() => { if (speakCtrlRef.current === ctrl) speakCtrlRef.current = null })
            .catch(() => { })
    }, [speak])

    const ui = deriveUIState(state, liraFSM.getSource())
    const isSleeping = state === 'SLEEPING'

    return { state, ui, transcript, speechSupported, onTap, onInterrupt, wakeFromTouch, goToSleep, isSleeping, isWakingUp, speakText }
}
