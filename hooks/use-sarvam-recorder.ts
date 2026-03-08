'use client'

/**
 * useSarvamRecorder — MediaRecorder-based audio capture hook.
 *
 * Records from the microphone and returns a WAV Blob when recording stops.
 * This is used by the voice pipeline to feed audio into Sarvam STT.
 *
 * Usage:
 *   const { startRecording, stopRecording, isRecording, audioBlob } = useSarvamRecorder()
 *
 * Lifecycle:
 *   startRecording()  — acquires mic, starts MediaRecorder
 *   stopRecording()   — stops MediaRecorder → audioBlob is populated
 *
 * The hook manages mic permission gracefully (returns null if denied).
 */

import { useState, useRef, useCallback } from 'react'

export interface UseSarvamRecorderReturn {
    /** Whether microphone is currently recording */
    isRecording: boolean
    /** Audio blob from the most recent completed recording (null before first recording) */
    audioBlob: Blob | null
    /** Start recording. Returns false if mic permission denied. */
    startRecording: () => Promise<boolean>
    /** Stop recording and produce the audio blob. */
    stopRecording: () => void
    /** Cancel recording without producing a blob. */
    cancelRecording: () => void
    /** Error message if mic permission was denied */
    micError: string | null
}

export function useSarvamRecorder(): UseSarvamRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [micError, setMicError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const resolveStopRef = useRef<((blob: Blob) => void) | null>(null)

    const releaseMic = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
    }, [])

    const startRecording = useCallback(async (): Promise<boolean> => {
        setMicError(null)
        chunksRef.current = []

        let stream: MediaStream
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch (err) {
            const msg = (err as Error).message ?? 'Microphone access denied'
            setMicError(msg)
            console.error('[SarvamRecorder] Mic error:', err)
            return false
        }

        streamRef.current = stream

        // Pick the best supported MIME type
        const mimeType =
            MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                    MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' :
                        ''  // browser default

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        recorder.onstop = () => {
            releaseMic()
            setIsRecording(false)
            const finalBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
            setAudioBlob(finalBlob)
            // Resolve for direct await usage
            resolveStopRef.current?.(finalBlob)
            resolveStopRef.current = null
        }

        recorder.start(250) // collect chunks every 250ms
        setIsRecording(true)
        return true
    }, [releaseMic])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            // Override onstop to not produce a blob
            mediaRecorderRef.current.onstop = () => {
                releaseMic()
                setIsRecording(false)
            }
            mediaRecorderRef.current.stop()
        } else {
            releaseMic()
            setIsRecording(false)
        }
    }, [releaseMic])

    return { isRecording, audioBlob, startRecording, stopRecording, cancelRecording, micError }
}
