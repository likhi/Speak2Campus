/**
 * Sarvam AI — Speech-to-Text (STT) + Text-to-Speech (TTS) client utilities.
 *
 * All API calls are made from the BROWSER to Next.js API routes
 * (/api/sarvam/stt and /api/sarvam/tts). Those routes forward the
 * request to Sarvam's cloud endpoints with the API key attached
 * server-side (so the key is never exposed in client JS bundles).
 *
 * ──────────────────────────────────────────────────────────
 * STT usage
 * ──────────────────────────────────────────────────────────
 * const text = await sarvamSTT(audioBlob, 'en-IN')
 *
 * ──────────────────────────────────────────────────────────
 * TTS usage
 * ──────────────────────────────────────────────────────────
 * const blob = await sarvamTTS('Hello from Lira', 'en-IN', 'meera')
 * const url  = URL.createObjectURL(blob)
 * const audio = new Audio(url)
 * audio.play()
 */

// ─── Supported languages ─────────────────────────────────────────────────────

export const SARVAM_LANGUAGES = {
    'en-IN': 'English (India)',
    'hi-IN': 'Hindi',
    'kn-IN': 'Kannada',
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'ml-IN': 'Malayalam',
    'bn-IN': 'Bengali',
    'gu-IN': 'Gujarati',
    'mr-IN': 'Marathi',
    'pa-IN': 'Punjabi',
    'or-IN': 'Odia',
} as const

export type SarvamLanguageCode = keyof typeof SARVAM_LANGUAGES

// ─── TTS speaker voices ───────────────────────────────────────────────────────
// See https://docs.sarvam.ai/api-reference-docs/text-to-speech

export const SARVAM_SPEAKERS = {
    // Female voices
    anushka: 'Anushka (Female, en-IN)',
    manisha: 'Manisha (Female, hi-IN)',
    vidya: 'Vidya (Female, kn-IN)',
    arya: 'Arya (Female, ta-IN/te-IN)',
    priya: 'Priya (Female)',
    neha: 'Neha (Female)',
    pooja: 'Pooja (Female)',
    ishita: 'Ishita (Female)',
    shreya: 'Shreya (Female)',
    simran: 'Simran (Female)',
    kavya: 'Kavya (Female)',
    ritu: 'Ritu (Female)',
    // Male voices
    abhilash: 'Abhilash (Male, hi-IN)',
    karun: 'Karun (Male)',
    hitesh: 'Hitesh (Male)',
    aditya: 'Aditya (Male)',
    rahul: 'Rahul (Male)',
    rohan: 'Rohan (Male)',
} as const

export type SarvamSpeaker = keyof typeof SARVAM_SPEAKERS

// ─── STT ─────────────────────────────────────────────────────────────────────

export interface SarvamSTTResult {
    transcript: string
    language_code: SarvamLanguageCode
    confidence?: number
}

/**
 * sarvamSTT — Convert an audio Blob to text via Sarvam AI STT API.
 *
 * @param audioBlob  Raw audio data (WAV / WebM / OGG / MP3).
 * @param language   BCP-47 language code. Default: 'en-IN'.
 *                   Use 'unknown' to let Sarvam auto-detect the language.
 * @returns          Transcript string (empty string on failure).
 */
export async function sarvamSTT(
    audioBlob: Blob,
    language: SarvamLanguageCode | 'unknown' = 'en-IN'
): Promise<SarvamSTTResult> {
    // Sarvam rejects codec-qualified MIME types like 'audio/webm;codecs=opus'.
    // Strip everything after the ';' to get the base type ('audio/webm').
    const rawType = audioBlob.type || 'audio/webm'
    const baseType = rawType.split(';')[0].trim()          // 'audio/webm'
    const ext = baseType.split('/')[1]?.replace('x-', '') || 'webm'  // 'webm'

    // Re-wrap with clean MIME type so FormData sets the right Content-Type header
    const cleanBlob = new Blob([await audioBlob.arrayBuffer()], { type: baseType })

    const formData = new FormData()
    formData.append('file', cleanBlob, `recording.${ext}`)
    formData.append('language_code', language)
    formData.append('model', 'saarika:v2.5')
    formData.append('with_timestamps', 'false')
    formData.append('with_disfluencies', 'false')

    const resp = await fetch('/api/sarvam/stt', {
        method: 'POST',
        body: formData,
    })

    if (!resp.ok) {
        const err = await resp.text().catch(() => `HTTP ${resp.status}`)
        throw new Error(`Sarvam STT failed: ${err}`)
    }

    const data = await resp.json()
    return {
        transcript: data.transcript ?? '',
        language_code: (data.language_code ?? language) as SarvamLanguageCode,
        confidence: data.confidence,
    }
}

// ─── TTS ─────────────────────────────────────────────────────────────────────

export interface SarvamTTSOptions {
    language?: SarvamLanguageCode
    speaker?: SarvamSpeaker
    /** Playback speed multiplier (0.5 – 2.0). Default: 1.0 */
    speed?: number
    /** Sarvam model version. Default: 'bulbul:v2' */
    model?: 'bulbul:v2' | 'bulbul:v3-beta' | 'bulbul:v3'
}

/**
 * sarvamTTS — Convert text to Indian-accented speech via Sarvam AI TTS API.
 *
 * Returns an audio Blob (WAV/MP3) which can be played via the Web Audio API.
 *
 * @example
 * const blob = await sarvamTTS('नमस्ते, मैं लीरा हूँ।', { language: 'hi-IN', speaker: 'maitreyi' })
 */
export async function sarvamTTS(
    text: string,
    options: SarvamTTSOptions = {}
): Promise<Blob> {
    const {
        language = 'en-IN',
        speaker = 'anushka',
        speed = 1.0,
        model = 'bulbul:v2',
    } = options

    const resp = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputs: [text],
            target_language_code: language,
            speaker,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model,
            pace: speed,
        }),
    })

    if (!resp.ok) {
        const err = await resp.text().catch(() => `HTTP ${resp.status}`)
        throw new Error(`Sarvam TTS failed: ${err}`)
    }

    const data = await resp.json()

    // Sarvam returns base64-encoded WAV in data.audios[0]
    const base64 = data.audios?.[0]
    if (!base64) throw new Error('Sarvam TTS: no audio data in response')

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: 'audio/wav' })
}

// ─── Playback helper ─────────────────────────────────────────────────────────

/**
 * playAudioBlob — Play a Blob audio using the HTML5 Audio element.
 *
 * Returns a Promise that resolves when playback finishes, or rejects
 * if there is a playback error. Supports AbortSignal for interruption.
 */
export function playAudioBlob(blob: Blob, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)

        const cleanup = () => {
            audio.pause()
            audio.src = ''
            URL.revokeObjectURL(url)
        }

        if (signal?.aborted) {
            cleanup()
            resolve()
            return
        }

        const abortHandler = () => {
            cleanup()
            resolve() // treat abort as graceful stop (not error)
        }

        signal?.addEventListener('abort', abortHandler, { once: true })

        audio.onended = () => { signal?.removeEventListener('abort', abortHandler); cleanup(); resolve() }
        audio.onerror = (e) => { signal?.removeEventListener('abort', abortHandler); cleanup(); reject(new Error(`Audio playback error: ${e}`)) }

        audio.play().catch(err => { cleanup(); reject(err) })
    })
}

// ─── Language detection helper ────────────────────────────────────────────────

/**
 * detectScriptLanguage — Quick heuristic to guess language code from text
 * by Unicode script analysis. Used as a fallback when Sarvam doesn't return
 * the detected language.
 */
export function detectScriptLanguage(text: string): SarvamLanguageCode {
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN' // Devanagari → Hindi
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN' // Kannada
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN' // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN' // Telugu
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN' // Malayalam
    if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN' // Bengali
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN' // Punjabi/Gurmukhi
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN' // Gujarati
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN' // Odia
    if (/[\u0900-\u097F\u0028]/.test(text)) return 'mr-IN' // Marathi (also Devanagari)
    return 'en-IN' // Default: English
}

/**
 * getSpeakerForLanguage — Returns a sensible default speaker for a given language.
 */
export function getSpeakerForLanguage(lang: SarvamLanguageCode): SarvamSpeaker {
    // Map languages to best matching Sarvam bulbul:v2 speakers
    const map: Partial<Record<SarvamLanguageCode, SarvamSpeaker>> = {
        'en-IN': 'anushka',
        'hi-IN': 'manisha',
        'kn-IN': 'vidya',
        'ta-IN': 'arya',
        'te-IN': 'arya',
        'ml-IN': 'arya',
        'bn-IN': 'abhilash',
        'mr-IN': 'abhilash',
        'pa-IN': 'manisha',
        'gu-IN': 'manisha',
        'or-IN': 'manisha',
    }
    return map[lang] ?? 'anushka'
}
