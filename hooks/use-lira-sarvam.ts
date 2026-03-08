'use client'

/**
 * useLiraSarvam — Sarvam AI-powered voice pipeline for Lira.
 *
 * Drop-in replacement for useLiraFSM that wires:
 *   • Sarvam AI STT  → MediaRecorder mic capture → sarvamSTT()
 *   • Sarvam AI TTS  → sarvamTTS() + playAudioBlob()
 *
 * Falls back to browser SpeechSynthesis if Sarvam TTS call fails.
 *
 * The hook exposes an identical interface to UseLiraFSMReturn so that
 * <VoiceAssistant> can switch between browser-TTS and Sarvam-TTS by swapping
 * one import line.
 *
 * WAKE WORD DETECTION
 * -------------------
 * Sarvam STT is NOT streaming — it needs a complete audio chunk.
 * Therefore we keep the original browser Web Speech API ONLY for
 * passive wake-word detection ("Hi Lira"), since it is low-latency
 * and runs locally without network cost.
 *
 * After wake-word → full Sarvam STT pipeline takes over for the actual command.
 *
 * STATE MACHINE INTEGRATION
 * -------------------------
 * Uses the same LiraFSM singleton as useLiraFSM.
 * Registers custom startListening / stopListening / speak callbacks.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { liraFSM, type LiraState, type LiraUIState, deriveUIState } from '@/lib/lira-fsm'
import {
    sarvamSTT,
    sarvamTTS,
    playAudioBlob,
    detectScriptLanguage,
    getSpeakerForLanguage,
    type SarvamLanguageCode,
} from '@/lib/sarvam-ai'
import type { UseLiraFSMReturn } from '@/hooks/use-lira-fsm'
import { playWakeChime, playListenChime, playEndChime } from '@/lib/lira-chime'

// ─── Wake word variants (kept for browser Web Speech API passive detection) ──
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLiraSarvam(
    processQuery: (query: string) => Promise<string>
): UseLiraFSMReturn {

    const [state, setState] = useState<LiraState>('SLEEPING')
    const [transcript, setTranscript] = useState('')
    const [speechSupported, setSpeechSupported] = useState(true)
    const [isWakingUp, setIsWakingUp] = useState(false)

    // Detected language from the last STT result — used to respond in the same language
    const detectedLangRef = useRef<SarvamLanguageCode>('en-IN')

    // Mic / MediaRecorder state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const recordingActiveRef = useRef(false)

    // Wake-word detector (browser Web Speech, passive only)
    const wakeRecognitionRef = useRef<SpeechRecognitionInstance | null>(null)
    const wakeRecognitionActive = useRef(false)

    // Audio playback abort for Sarvam TTS
    const ttsAbortRef = useRef<AbortController | null>(null)

    // AudioContext + interval for real-time silence detection
    const silenceAudioCtxRef = useRef<AudioContext | null>(null)
    const silenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Timestamp of when Lira last finished speaking — used to discard echo
    const lastSpeakEndTimeRef = useRef<number>(0)

    // FSM state ref (avoids stale closures in recognition callbacks)
    const stateRef = useRef<LiraState>('SLEEPING')
    useEffect(() => { stateRef.current = state }, [state])

    // ─── Sarvam TTS speak ──────────────────────────────────────────────────────

    /**
     * Speak text via Sarvam TTS → WAV playback.
     * Falls back to browser SpeechSynthesis on error.
     */
    const speak = useCallback(async (text: string, signal: AbortSignal): Promise<void> => {
        if (!text.trim()) return

        try {
            // ── Determine language & speaker ────────────────────────────────────
            const lang = detectedLangRef.current ?? 'en-IN'
            const speaker = getSpeakerForLanguage(lang)

            // ── Speaking personality: adjust pace based on response type ────────
            // Announcements → slower (0.88) for clarity
            // Short replies  → slightly faster (1.05) for snappiness
            // Normal         → natural (1.0)
            const isAnnouncement = /announcement|notice|event|important|update/i.test(text)
            const isShortReply = text.replace(/\s+/g, ' ').trim().length < 70
            const pace = isAnnouncement ? 0.88 : isShortReply ? 1.05 : 1.0

            // Sarvam has a 500-char limit per input — split into sentence chunks
            const MAX = 480
            const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text]
            const chunks: string[] = []
            let buf = ''
            for (const s of sentences) {
                if ((buf + s).length > MAX) {
                    if (buf.trim()) chunks.push(buf.trim())
                    buf = s
                } else { buf += s }
            }
            if (buf.trim()) chunks.push(buf.trim())
            if (chunks.length === 0) chunks.push(text.slice(0, MAX))

            // Play each chunk sequentially
            for (const chunk of chunks) {
                if (signal.aborted) return
                try {
                    const blob = await sarvamTTS(chunk, { language: lang, speaker, speed: pace })
                    if (signal.aborted) return
                    await playAudioBlob(blob, signal)
                } catch (chunkErr) {
                    console.warn('[Lira Sarvam TTS] chunk error, skipping:', chunkErr)
                }
            }

            // Play end chime after all chunks complete
            if (!signal.aborted) {
                playEndChime()
                // Stamp the moment Lira stopped speaking — echo guard uses this
                lastSpeakEndTimeRef.current = Date.now()
            }
        } catch (err) {
            console.error('[Lira Sarvam TTS] failed, falling back to browser TTS:', err)
            await browserTTSFallback(text, signal)
            // Stamp even on fallback path
            if (!signal.aborted) lastSpeakEndTimeRef.current = Date.now()
        }
    }, [])

    /** Browser SpeechSynthesis fallback when Sarvam TTS is unavailable/errors. */
    function browserTTSFallback(text: string, signal: AbortSignal): Promise<void> {
        return new Promise(resolve => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) { resolve(); return }
            window.speechSynthesis.cancel()

            const onAbort = () => { window.speechSynthesis.cancel(); resolve() }
            signal.addEventListener('abort', onAbort, { once: true })

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = detectedLangRef.current ?? 'en-IN'
            utterance.rate = 0.88
            utterance.pitch = 1.05
            utterance.onend = () => { signal.removeEventListener('abort', onAbort); resolve() }
            utterance.onerror = () => { signal.removeEventListener('abort', onAbort); resolve() }
            window.speechSynthesis.speak(utterance)
        })
    }

    // ─── speakText (public — for quick actions / text input path) ──────────────

    const speakText = useCallback((text: string) => {
        // Cancel any in-flight speech
        if (ttsAbortRef.current) {
            ttsAbortRef.current.abort()
            ttsAbortRef.current = null
        }
        liraFSM.interrupt()
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel()
        }

        if (!text.trim()) return // cancel-only call

        const ctrl = new AbortController()
        ttsAbortRef.current = ctrl
        speak(text, ctrl.signal)
            .then(() => { if (ttsAbortRef.current === ctrl) ttsAbortRef.current = null })
            .catch(() => { })
    }, [speak])

    // ─── Sarvam STT mic capture ────────────────────────────────────────────────

    /** Release microphone stream tracks and silence detection resources. */
    const releaseMic = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        recordingActiveRef.current = false
        // Cleanup silence detection
        if (silenceIntervalRef.current) {
            clearInterval(silenceIntervalRef.current)
            silenceIntervalRef.current = null
        }
        silenceAudioCtxRef.current?.close().catch(() => { })
        silenceAudioCtxRef.current = null
    }, [])

    /**
     * startListening — called by FSM when entering WAKE_LISTENING / MANUAL_ACTIVE / VOICE_ACTIVE.
     * Starts MediaRecorder. Audio is collected until stopListening() is called,
     * then sent to Sarvam STT.
     */
    const startListening = useCallback(() => {
        if (recordingActiveRef.current) return // already recording
        chunksRef.current = []

        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,   // 🔇 Cancel Lira's own TTS from mic
                noiseSuppression: true,   // 🔇 Reduce background noise
                autoGainControl: true,    // 🎚️ Normalize mic level
            }
        }).then(async stream => {
            streamRef.current = stream

            const mimeType =
                MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                    MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                        MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : ''

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            mediaRecorderRef.current = recorder

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            recorder.onstop = async () => {
                releaseMic()
                if (chunksRef.current.length === 0) {
                    liraFSM.submitTranscript('')
                    return
                }

                // ── Echo guard: discard transcript captured right after Lira spoke ──
                // If this recording started within 1.5s of Lira finishing TTS,
                // the audio is almost certainly a room echo of her own voice.
                const msSinceSpeaking = Date.now() - lastSpeakEndTimeRef.current
                if (msSinceSpeaking < 1500) {
                    console.log(`[Lira] Echo guard: discarding transcript (${msSinceSpeaking}ms since last speech)`)
                    chunksRef.current = []
                    liraFSM.submitTranscript('')
                    return
                }

                // Strip codec parameter — Sarvam only accepts base MIME types
                // e.g. 'audio/webm;codecs=opus' → 'audio/webm'
                const baseType = (mimeType || 'audio/webm').split(';')[0].trim()
                const audioBlob = new Blob(chunksRef.current, { type: baseType })
                chunksRef.current = []

                try {
                    const result = await sarvamSTT(audioBlob, 'en-IN')
                    const text = (result.transcript ?? '').trim()
                    // Store the detected language so TTS can respond in the same language
                    if (result.language_code) {
                        detectedLangRef.current = result.language_code
                    } else {
                        detectedLangRef.current = detectScriptLanguage(text)
                    }

                    setTranscript(text)

                    if (STOP_WORDS.some(w => text.toLowerCase().startsWith(w))) {
                        liraFSM.interrupt()
                    } else {
                        liraFSM.submitTranscript(text)
                    }
                } catch (err) {
                    console.error('[Lira Sarvam STT] error:', err)
                    // On STT failure, tell FSM with an error-signal empty string
                    // The assistant logic will speak the "couldn't understand" message
                    liraFSM.submitTranscript('')
                }
            }

            // ── Real-time silence detection via AudioContext AnalyserNode ──────
            // HOW IT WORKS:
            //   1. Wait 800ms grace period (user is still starting to speak)
            //   2. Then poll every 100ms for silence (RMS below threshold)
            //   3. If 1.5s of continuous silence → auto-stop recording
            // WHY no hasSpeech gate: the old code required speech detection before
            // starting the silence counter, which broke for soft speakers — the
            // RMS never crossed threshold so the gate never opened and the 7s
            // hard timeout fired instead of the natural silence detector.
            try {
                const AudioCtxCtor = window.AudioContext || (window as any).webkitAudioContext
                if (AudioCtxCtor) {
                    const analyserCtx = new AudioCtxCtor() as AudioContext
                    // Resume in case browser suspended it due to autoplay policy
                    if (analyserCtx.state === 'suspended') await analyserCtx.resume().catch(() => { })
                    silenceAudioCtxRef.current = analyserCtx
                    const analyser = analyserCtx.createAnalyser()
                    analyser.fftSize = 512
                    analyser.smoothingTimeConstant = 0.75
                    const micSrc = analyserCtx.createMediaStreamSource(stream)
                    micSrc.connect(analyser)
                    const data = new Float32Array(analyser.fftSize / 2)
                    let silenceStart: number | null = null
                    const THRESHOLD = 0.012   // RMS voice/silence boundary
                    const SILENCE_MS = 1500   // 1.5s of silence → auto-stop
                    const GRACE_MS = 800    // wait 800ms before counting silence
                    const recordStart = Date.now()

                    silenceIntervalRef.current = setInterval(() => {
                        if (!recordingActiveRef.current) {
                            clearInterval(silenceIntervalRef.current!)
                            silenceIntervalRef.current = null
                            return
                        }
                        // Grace period: don’t count silence in the first 800ms
                        if (Date.now() - recordStart < GRACE_MS) return

                        analyser.getFloatTimeDomainData(data)
                        const rms = Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length)

                        if (rms > THRESHOLD) {
                            // User is speaking — reset silence counter
                            silenceStart = null
                        } else {
                            // Silence detected
                            if (silenceStart === null) silenceStart = Date.now()
                            if (Date.now() - silenceStart > SILENCE_MS) {
                                clearInterval(silenceIntervalRef.current!)
                                silenceIntervalRef.current = null
                                if (mediaRecorderRef.current?.state !== 'inactive' && recordingActiveRef.current) {
                                    mediaRecorderRef.current?.stop()
                                }
                            }
                        }
                    }, 100)
                }
            } catch (e) {
                console.warn('[Lira] Silence detection unavailable:', e)
            }

            // Play mic-start sound (like Siri's "ting")
            playListenChime()
            recorder.start(250) // 250ms chunks
            recordingActiveRef.current = true
        }).catch(err => {
            console.error('[Lira Sarvam] Mic access denied:', err)
            setSpeechSupported(false)
            liraFSM.submitTranscript('')
        })
    }, [releaseMic])

    /**
     * stopListening — called by FSM when leaving MANUAL/VOICE_ACTIVE.
     * Stops the MediaRecorder which triggers onstop → sarvamSTT → submitTranscript.
     */
    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        } else {
            releaseMic()
        }
        // Also stop the passive wake-word recognizer while command is in flight
        pauseWakeWordDetection()
    }, [releaseMic])

    // ─── Passive wake-word detection (browser Web Speech API) ─────────────────

    const pauseWakeWordDetection = useCallback(() => {
        if (wakeRecognitionRef.current && wakeRecognitionActive.current) {
            try { wakeRecognitionRef.current.abort() } catch { /* ignore */ }
            wakeRecognitionActive.current = false
        }
    }, [])

    const resumeWakeWordDetection = useCallback(() => {
        if (!wakeRecognitionRef.current || wakeRecognitionActive.current) return
        const cur = stateRef.current
        if (cur !== 'SLEEPING' && cur !== 'WAKE_LISTENING' && cur !== 'IDLE') return
        try {
            wakeRecognitionRef.current.start()
            wakeRecognitionActive.current = true
        } catch { /* already started */ }
    }, [])

    // ─── Register services with FSM ────────────────────────────────────────────

    useEffect(() => {
        liraFSM.registerListening(startListening, stopListening)
        liraFSM.registerSpeak(speak)
        liraFSM.registerProcessQuery(processQuery)
    }, [startListening, stopListening, speak, processQuery])

    // ─── FSM wake / sleep animation callbacks ─────────────────────────────────

    useEffect(() => {
        liraFSM.onWake = () => {
            // Play Alexa-style wake chime 🎵
            playWakeChime()
            setIsWakingUp(true)
            setTimeout(() => setIsWakingUp(false), 1000)
        }
        liraFSM.onSleep = () => {
            setTranscript('')
        }
    }, [])

    // ─── FSM state subscription ───────────────────────────────────────────────

    useEffect(() => {
        const unsub = liraFSM.subscribe(event => {
            if (event.type === 'STATE_CHANGED') {
                setState(event.state)
                if (event.state === 'SLEEPING') {
                    setTranscript('')
                    // Resume passive wake detection after returning to sleep
                    setTimeout(resumeWakeWordDetection, 500)
                }
                if (event.state === 'WAKE_LISTENING' || event.state === 'IDLE') {
                    resumeWakeWordDetection()
                }
            }
        })
        return unsub
    }, [resumeWakeWordDetection])

    // ─── Passive wake-word detection setup ────────────────────────────────────

    useEffect(() => {
        if (typeof window === 'undefined') return
        const API = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!API) {
            setSpeechSupported(false)

            // No browser speech recognition — boot FSM anyway (text-only mode)
            liraFSM.initialize().catch(console.error)
            return
        }

        const recognition = new API()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-IN'
        wakeRecognitionRef.current = recognition

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = ''
            let final = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const r = event.results[i]
                if (r.isFinal) final += r[0].transcript + ' '
                else interim += r[0].transcript
            }
            const text = (final || interim).trim()
            const lower = text.toLowerCase()
            const current = stateRef.current

            // ── Passive wake-word detection only ───────────────────────────────
            if (current === 'SLEEPING' || current === 'IDLE' || current === 'WAKE_LISTENING') {
                const detected = WAKE_WORDS.some(w => lower.includes(w))
                if (detected) {
                    try { recognition.abort() } catch { /* ignore */ }
                    wakeRecognitionActive.current = false

                    // Check for command embedded after wake word in same utterance
                    const command = WAKE_WORDS.reduce((acc, w) => {
                        const idx = lower.indexOf(w)
                        if (idx !== -1) return lower.slice(idx + w.length).trim()
                        return acc
                    }, '')

                    if (current === 'SLEEPING') {
                        liraFSM.wake()
                    }

                    if (command.length > 3) {
                        // Command was spoken right after wake word — skip recording, submit directly
                        liraFSM.onWakeWordDetected().then(() => {
                            // Skip Sarvam STT for the wake-command — text already available
                            detectedLangRef.current = 'en-IN'
                            liraFSM.submitTranscript(command)
                        })
                    } else {
                        liraFSM.onWakeWordDetected()
                    }
                    return
                }
            }
        }

        recognition.onend = () => {
            wakeRecognitionActive.current = false
            const cur = stateRef.current
            // Only auto-restart in passive detection states
            if (cur === 'SLEEPING' || cur === 'IDLE' || cur === 'WAKE_LISTENING') {
                try { recognition.start(); wakeRecognitionActive.current = true } catch { /* ignore */ }
            }
        }

        recognition.onerror = (e) => {
            wakeRecognitionActive.current = false
            if (e.error === 'not-allowed') { setSpeechSupported(false); return }
            setTimeout(() => {
                const cur = stateRef.current
                if (cur === 'SLEEPING' || cur === 'IDLE' || cur === 'WAKE_LISTENING') {
                    try { recognition.start(); wakeRecognitionActive.current = true } catch { /* ignore */ }
                }
            }, 1500)
        }

        // Boot FSM and start passive mic
        liraFSM.initialize().catch(console.error)
        try { recognition.start(); wakeRecognitionActive.current = true } catch { /* ignore */ }

        return () => {
            liraFSM.destroy()
            try { recognition.abort() } catch { /* ignore */ }
            if (ttsAbortRef.current) {
                ttsAbortRef.current.abort()
                ttsAbortRef.current = null
            }
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
            }
            releaseMic()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ─── Auto-silence timer for MANUAL/VOICE_ACTIVE ───────────────────────────
    // When recording, we stop after a silence period (3 s without new audio chunks)
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (state === 'MANUAL_ACTIVE' || state === 'VOICE_ACTIVE') {
            // Start a 5-second max-recording auto-stop (hard ceiling).
            // The AudioContext silence detector (above) fires much earlier — typically
            // within 800ms + 1.5s = ~2.3s after the user stops speaking.
            // This 5s timer only fires if the AudioContext detector failed.
            silenceTimerRef.current = setTimeout(() => {
                if (stateRef.current === 'MANUAL_ACTIVE' || stateRef.current === 'VOICE_ACTIVE') {
                    stopListening()
                }
            }, 5_000)
        } else {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = null
            }
        }
        return () => {
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
        }
    }, [state, stopListening])

    // ─── Public API ───────────────────────────────────────────────────────────

    const onTap = useCallback(() => liraFSM.onManualTap(), [])
    const onInterrupt = useCallback(() => {
        liraFSM.interrupt()
        if (ttsAbortRef.current) { ttsAbortRef.current.abort(); ttsAbortRef.current = null }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
        stopListening()
    }, [stopListening])

    const wakeFromTouch = useCallback(() => {
        if (stateRef.current === 'SLEEPING') liraFSM.wake()
    }, [])
    const goToSleep = useCallback(() => liraFSM.goToSleep(), [])

    const ui: LiraUIState = deriveUIState(state, liraFSM.getSource())
    const isSleeping = state === 'SLEEPING'

    return {
        state, ui, transcript, speechSupported,
        onTap, onInterrupt, wakeFromTouch, goToSleep,
        isSleeping, isWakingUp, speakText,
    }
}
