/**
 * POST /api/sarvam/stt
 *
 * Server-side proxy for Sarvam AI Speech-to-Text API.
 * Forwards the multipart/form-data audio upload from the client
 * to Sarvam's endpoint and returns the JSON transcript response.
 *
 * This route keeps the SARVAM_API_KEY secret — it never reaches the browser.
 *
 * Expected client request:
 *   Content-Type: multipart/form-data
 *   Fields:
 *     - file          (Blob)   raw audio (WAV / WebM / MP3 / OGG)
 *     - language_code (string) e.g. "en-IN" | "unknown"
 *     - model         (string) e.g. "saarika:v2.5"
 *
 * Sarvam API doc: https://docs.sarvam.ai/api-reference-docs/speech-to-text
 */

import { NextRequest, NextResponse } from 'next/server'

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text'

export async function POST(req: NextRequest) {
    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) {
        return NextResponse.json(
            { error: 'SARVAM_API_KEY is not configured on the server.' },
            { status: 503 }
        )
    }

    // ── Parse incoming multipart form from the browser ───────────────────────
    let formData: FormData
    try {
        formData = await req.formData()
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const audioFile = formData.get('file') as Blob | null
    if (!audioFile) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // ── Build the forwarded request to Sarvam ────────────────────────────────
    const upstream = new FormData()
    upstream.append('file', audioFile, 'recording.wav')
    upstream.append('language_code', formData.get('language_code') as string ?? 'en-IN')
    upstream.append('model', formData.get('model') as string ?? 'saarika:v2.5')
    upstream.append('with_timestamps', formData.get('with_timestamps') as string ?? 'false')
    upstream.append('with_disfluencies', formData.get('with_disfluencies') as string ?? 'false')

    let sarvamResp: Response
    try {
        sarvamResp = await fetch(SARVAM_STT_URL, {
            method: 'POST',
            headers: {
                'api-subscription-key': apiKey,
            },
            body: upstream,
        })
    } catch (err) {
        console.error('[Sarvam STT] Network error:', err)
        return NextResponse.json({ error: 'Network error reaching Sarvam API' }, { status: 502 })
    }

    // ── Forward response to client ───────────────────────────────────────────
    const contentType = sarvamResp.headers.get('content-type') ?? ''
    if (!sarvamResp.ok) {
        const body = contentType.includes('json')
            ? await sarvamResp.json().catch(() => ({}))
            : { error: await sarvamResp.text().catch(() => `HTTP ${sarvamResp.status}`) }
        console.error('[Sarvam STT] API error:', sarvamResp.status, body)
        return NextResponse.json(body, { status: sarvamResp.status })
    }

    const result = await sarvamResp.json()
    return NextResponse.json(result)
}
