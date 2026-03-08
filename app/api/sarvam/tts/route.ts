/**
 * POST /api/sarvam/tts
 *
 * Server-side proxy for Sarvam AI Text-to-Speech API.
 * Receives a JSON body from the browser, attaches the API key,
 * and returns the base64-encoded WAV audio from Sarvam.
 *
 * This route keeps the SARVAM_API_KEY secret — it never reaches the browser.
 *
 * Expected client request body (JSON):
 * {
 *   inputs:               string[]   // Array of text strings (each max ~500 chars)
 *   target_language_code: string     // e.g. "en-IN", "hi-IN"
 *   speaker:              string     // e.g. "meera", "maitreyi"
 *   speech_sample_rate?:  number     // 8000 | 16000 | 22050 (default: 22050)
 *   enable_preprocessing?: boolean   // default: true
 *   model?:               string     // "bulbul:v1" (default)
 *   pace?:                number     // 0.5 – 2.0  (default: 1.0)
 * }
 *
 * Sarvam API doc: https://docs.sarvam.ai/api-reference-docs/text-to-speech
 */

import { NextRequest, NextResponse } from 'next/server'

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech'
const MAX_CHARS_PER_INPUT = 500

export async function POST(req: NextRequest) {
    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) {
        return NextResponse.json(
            { error: 'SARVAM_API_KEY is not configured on the server.' },
            { status: 503 }
        )
    }

    // ── Parse client request ─────────────────────────────────────────────────
    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
        inputs,
        target_language_code = 'en-IN',
        speaker = 'anushka',
        speech_sample_rate = 22050,
        enable_preprocessing = true,
        model = 'bulbul:v2',
        pace = 1.0,
    } = body as {
        inputs: string[]
        target_language_code?: string
        speaker?: string
        speech_sample_rate?: number
        enable_preprocessing?: boolean
        model?: string
        pace?: number
    }

    if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
        return NextResponse.json({ error: 'inputs array is required' }, { status: 400 })
    }

    // Sarvam has a per-input character limit — truncate silently if exceeded
    const safeInputs = inputs.map(s =>
        typeof s === 'string' ? s.slice(0, MAX_CHARS_PER_INPUT) : ''
    )

    // ── Forward to Sarvam TTS ────────────────────────────────────────────────
    let sarvamResp: Response
    try {
        sarvamResp = await fetch(SARVAM_TTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey,
            },
            body: JSON.stringify({
                inputs: safeInputs,
                target_language_code,
                speaker,
                speech_sample_rate,
                enable_preprocessing,
                model,
                pace,
            }),
        })
    } catch (err) {
        console.error('[Sarvam TTS] Network error:', err)
        return NextResponse.json({ error: 'Network error reaching Sarvam API' }, { status: 502 })
    }

    // ── Forward response to client ───────────────────────────────────────────
    if (!sarvamResp.ok) {
        const body = await sarvamResp.json().catch(() => ({ error: `HTTP ${sarvamResp.status}` }))
        console.error('[Sarvam TTS] API error:', sarvamResp.status, body)
        return NextResponse.json(body, { status: sarvamResp.status })
    }

    const result = await sarvamResp.json()
    // result.audios is an array of base64 WAV strings
    return NextResponse.json(result)
}
