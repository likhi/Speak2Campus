"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Mic, MicOff, Send, GraduationCap,
  Volume2, Brain, Radio, Loader2, Eye, Hand, AlertCircle, Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { QuickActions } from "@/components/quick-actions"
import { FoundersFloatingButton } from "@/components/founders-floating-button"
import { ChatMessage } from "@/components/chat-message"
import type { Message, ActionButton } from "@/components/chat-message"
import { fetchLocations, fetchFaculty, fetchEvents, fetchTimetable } from "@/lib/db-client"
import { processQuery } from "@/lib/query-processor"
import { liraFSM } from "@/lib/lira-fsm"
import { useLiraSarvam } from "@/hooks/use-lira-sarvam"
import type { LiraUIState, LiraState } from "@/lib/lira-fsm"

// ─── Constants ─────────────────────────────────────────────────────────────

const FALLBACK_MESSAGE = "Hmm, I didn't quite catch that. You can ask me about faculty, campus locations, class timetables, or today's announcements. What would you like to know?"
const CONTEXT_MEMORY_SIZE = 3

/**
 * Matches ANY query that is clearly about announcements / notices / today's updates.
 * This must be tested BEFORE any timetable / class intent check.
 *
 * Covers:
 *  - Direct: "announcements", "notices", "notifications"
 *  - Today variants: "today's updates", "today's announcements", "today notice"
 *  - Natural questions: "what's happening today", "any news today"
 *  - Latest: "latest updates", "latest announcements"
 *  - College-specific: "college announcements", "important notice"
 *
 * Intentionally does NOT match queries that ALSO contain timetable / dept words
 * (mca/mba/mcom + timetable/schedule/class) — those are handled in the timetable branch.
 */
const TODAY_UPDATES_RE =
  /\bannouncement(?:s)?\b|\bnotice(?:s)?\b|\bnotification(?:s)?\b|\bbulletin\b|\bcircular(?:s)?\b|\bmemo(?:s)?\b/i

/**
 * Matches queries where 'today' co-occurs with update/news/happening/going on
 * but there's no explicit timetable keyword (timetable, schedule, class) and no dept.
 * These map to the announcements / today-updates API.
 */
const TODAY_CONTEXT_RE =
  /\btoday\b.*(?:update|news|happen|going on|announcement|notice|bulletin|what.?s on|plan|agenda|inform)/i
const CONTEXT_TODAY_RE =
  /(?:update|news|happen|going on|announcement|notice|bulletin|what.?s on|plan|agenda|inform).*\btoday\b/i
const LATEST_UPDATES_RE =
  /\b(?:latest|recent|new|any|college|important|daily)\s+(?:update|updates|news|announcement|announcements|notice|notices|notification|notifications)\b/i


// ─── Types are imported from @/components/chat-message (Message, ActionButton)


// ─── Sub-components ─────────────────────────────────────────────────────────

/**
 * VoiceWaveform — animated bars shown when mic is active
 */
function VoiceWaveform({ active, color = "bg-current" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[2, 4, 3, 5, 4, 3, 2, 4, 3].map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-all duration-300",
            color,
            active ? "animate-bounce opacity-90" : "opacity-20"
          )}
          style={{
            height: active ? `${h * 3.5}px` : '3px',
            animationDelay: `${i * 55}ms`,
            animationDuration: '700ms',
          }}
        />
      ))}
    </div>
  )
}

/**
 * ProcessingDots — three dot bounce animation for PROCESSING state
 */
function ProcessingDots() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 150, 300].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

/**
 * ModeIndicator — shows "Manual Mode Active" or "Voice Mode Active" pill
 * Only visible when ONE mode is locked and the other is disabled.
 */
function ModeIndicator({ text, variant }: { text: string; variant: 'manual' | 'voice' }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold",
      "animate-in fade-in slide-in-from-top-2 duration-300",
      variant === 'manual'
        ? "bg-blue-500/20 border border-blue-400/40 text-blue-200"
        : "bg-purple-500/20 border border-purple-400/40 text-purple-200"
    )}>
      <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
      {text}
    </div>
  )
}

/**
 * StateBadge — animated status indicator
 */
function StateBadge({ ui }: { ui: LiraUIState }) {
  const colorMap: Record<string, string> = {
    gray: 'bg-slate-500/80',
    blue: 'bg-blue-500/80',
    red: 'bg-red-500/80',
    amber: 'bg-amber-500/80',
    green: 'bg-green-500/80',
    emerald: 'bg-emerald-500/80',
  }

  let StateIcon: React.FC<React.SVGProps<SVGSVGElement>> | null = null
  switch (ui.currentState) {
    case 'SLEEPING': StateIcon = Moon; break
    case 'IDLE': StateIcon = Eye; break
    case 'WAKE_LISTENING': StateIcon = Radio; break
    case 'MANUAL_ACTIVE': StateIcon = Hand; break
    case 'VOICE_ACTIVE': StateIcon = Mic; break
    case 'PROCESSING': StateIcon = Brain; break
    case 'SPEAKING': StateIcon = Volume2; break
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-medium",
      "transition-all duration-500 backdrop-blur-sm shadow-lg",
      colorMap[ui.statusColor]
    )}>
      {ui.animatePulse && (
        <span className="w-2 h-2 rounded-full bg-white/70 animate-ping" />
      )}
      {ui.currentState === 'PROCESSING'
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : StateIcon ? <StateIcon className="w-3.5 h-3.5" /> : null
      }
      <span>{ui.statusLabel}</span>
      {ui.animateWave && <VoiceWaveform active />}
    </div>
  )
}

/**
 * ActivationButton — the main mic tap button.
 */
function ActivationButton({
  ui,
  onTap,
  onInterrupt,
}: {
  ui: LiraUIState
  onTap: () => void
  onInterrupt: () => void
}) {
  const isActive = ui.currentState === 'MANUAL_ACTIVE'
  const isSpeaking = ui.currentState === 'SPEAKING'
  const isProcessing = ui.currentState === 'PROCESSING'

  return (
    <Button
      id="lira-tap-button"
      type="button"
      size="lg"
      // During SPEAKING: tap calls onTap (which triggers onManualTap → interrupt + listen)
      // During recording: tap calls onInterrupt to stop mic
      disabled={isProcessing}
      onClick={
        isActive
          ? onInterrupt   // recording → stop mic
          : onTap         // idle, wake-listening, OR speaking → tap to speak/interrupt
      }
      className={cn(
        "rounded-full w-14 h-14 shrink-0 transition-all duration-300 relative",
        isActive && "animate-pulse ring-4 ring-red-400/40 bg-red-600 hover:bg-red-700",
        isSpeaking && "animate-pulse ring-4 ring-green-400/40 bg-green-600 hover:bg-green-700",
        isProcessing && "opacity-60 cursor-not-allowed",
      )}
      title={
        isSpeaking
          ? 'Tap to interrupt and ask a new question'
          : isActive
            ? 'Tap to stop recording'
            : isProcessing
              ? 'Processing…'
              : ui.tapButtonLabel
      }
    >
      {isActive
        ? <MicOff className="w-6 h-6" />
        : isProcessing
          ? <Loader2 className="w-6 h-6 animate-spin" />
          : <Mic className="w-6 h-6" />
      }
    </Button>
  )
}

/**
 * CancelButton — stop button shown during SPEAKING or recording states.
 */
function CancelButton({ onInterrupt }: { onInterrupt: () => void }) {
  return (
    <Button
      id="lira-cancel-button"
      type="button"
      size="sm"
      variant="destructive"
      onClick={onInterrupt}
      className={cn(
        "rounded-full px-4 py-1.5 text-xs font-semibold gap-2",
        "animate-in fade-in slide-in-from-bottom-3 duration-200"
      )}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      Stop
    </Button>
  )
}

// ─── Keyframe styles injected once ──────────────────────────────────────────
const ROBOT_STYLES = `
  @keyframes liraBlink {
    0%,86%,100%{transform:scaleY(1);opacity:1}
    91%{transform:scaleY(0.05);opacity:.7}
  }
  @keyframes liraBlink2 {
    0%,78%,100%{transform:scaleY(1);opacity:1}
    83%{transform:scaleY(0.05);opacity:.7}
  }
  @keyframes liRaEyeGlow {
    0%,100%{box-shadow:0 0 14px 3px oklch(0.6 0.3 200 / .8),0 0 30px oklch(0.5 0.25 200 / .4)}
    50%{box-shadow:0 0 22px 6px oklch(0.7 0.35 195 / .9),0 0 50px oklch(0.55 0.3 200 / .5)}
  }
  @keyframes liRaScan {
    0%{top:0%;opacity:.4}
    100%{top:100%;opacity:0}
  }
  @keyframes antennaPulse {
    0%,100%{box-shadow:0 0 6px 2px oklch(0.65 0.25 250 / .6),0 0 16px oklch(0.55 0.22 250 / .3)}
    50%{box-shadow:0 0 14px 5px oklch(0.75 0.3 250),0 0 30px oklch(0.6 0.25 250 / .6)}
  }
  @keyframes ledFlow {
    0%,100%{opacity:.3} 50%{opacity:1}
  }
  @keyframes mouthBar {
    0%,100%{transform:scaleY(.4)} 50%{transform:scaleY(1)}
  }
  @keyframes circuitShimmer {
    0%,100%{opacity:.04} 50%{opacity:.1}
  }
  @keyframes liraRingExpand {
    0%   { transform: scale(1);   opacity: 0.75; }
    100% { transform: scale(2.8); opacity: 0; }
  }
  @keyframes liraOrbPulse {
    0%,100% { transform: scale(1);   opacity: 0.9; }
    50%     { transform: scale(1.08); opacity: 1; }
  }
  @keyframes liraBarDance {
    0%, 100% { transform: scaleY(0.25); }
    50%      { transform: scaleY(1); }
  }
`

// ─── Sleep Screen ─────────────────────────────────────────────────────────────

function SleepScreen({
  onWake,
  isWakingUp,
}: {
  onWake: () => void
  isWakingUp: boolean
}) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  // Stable star positions — generated once to avoid hydration mismatch
  const stars = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      w: i % 6 === 0 ? 2 : 1,
      top: (i * 137.508) % 100,
      left: (i * 97.314) % 100,
      op: 0.15 + (i % 5) * 0.08,
      dur: 2 + (i % 4),
      del: (i % 6) * 0.7,
    }))
  )

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
      setDate(now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }))
    }
    update()
    const id = setInterval(update, 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* Inject keyframes once */}
      <style>{ROBOT_STYLES}</style>

      {/* ── Full-viewport robot face overlay ────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none overflow-hidden',
          'transition-opacity duration-700',
          isWakingUp ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        style={{ background: '#010408' }}
        onClick={onWake}
        onTouchStart={onWake}
        aria-label="Tap to wake Lira"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onWake()}
      >
        {/* ── Circuit-board background grid ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(0.45 0.18 250 / 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(0.45 0.18 250 / 0.18) 1px, transparent 1px)
            `,
            backgroundSize: '38px 38px',
            animation: 'circuitShimmer 4s ease-in-out infinite',
          }}
        />

        {/* ── Ambient glow behind head ── */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '60vw', height: '60vw', maxWidth: 500, maxHeight: 500,
            background: 'radial-gradient(circle, oklch(0.4 0.18 250 / 0.22) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}
        />

        {/* ════════════════════════════════════════════════════
            ROBOT HEAD ASSEMBLY
        ════════════════════════════════════════════════════ */}
        <div
          className="relative flex flex-col items-center"
          style={{ width: 'min(400px, 92vw)', userSelect: 'none' }}
        >
          {/* ── ANTENNAS ─────────────────────────────────────── */}
          <div className="absolute flex items-end justify-center gap-12 pointer-events-none"
            style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', paddingBottom: '0px' }}>
            {/* Left antenna */}
            <div className="flex flex-col items-center" style={{ gap: 0 }}>
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'oklch(0.72 0.28 250)',
                  animation: 'antennaPulse 2s ease-in-out infinite',
                  animationDelay: '0s',
                }}
              />
              <div style={{
                width: 3, height: 36,
                background: 'linear-gradient(to bottom, oklch(0.65 0.22 250), oklch(0.3 0.12 250))',
                borderRadius: 2,
              }} />
              <div style={{
                width: 14, height: 5,
                background: 'oklch(0.35 0.15 250)',
                borderRadius: '3px 3px 0 0',
              }} />
            </div>
            {/* Right antenna */}
            <div className="flex flex-col items-center" style={{ gap: 0 }}>
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'oklch(0.72 0.28 250)',
                  animation: 'antennaPulse 2s ease-in-out infinite',
                  animationDelay: '0.9s',
                }}
              />
              <div style={{
                width: 3, height: 36,
                background: 'linear-gradient(to bottom, oklch(0.65 0.22 250), oklch(0.3 0.12 250))',
                borderRadius: 2,
              }} />
              <div style={{
                width: 14, height: 5,
                background: 'oklch(0.35 0.15 250)',
                borderRadius: '3px 3px 0 0',
              }} />
            </div>
          </div>

          {/* ── FOREHEAD / CROWN PANEL ───────────────────────── */}
          <div
            className="w-full flex items-center justify-between px-4 py-2"
            style={{
              background: 'linear-gradient(180deg, oklch(0.22 0.12 250 / 0.95), oklch(0.17 0.1 250 / 0.9))',
              border: '1.5px solid oklch(0.45 0.18 250 / 0.6)',
              borderBottom: 'none',
              borderRadius: '22px 22px 0 0',
            }}
          >
            {/* Left bolt */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.42 0.14 250)', boxShadow: '0 0 4px oklch(0.5 0.18 250 / 0.5)' }} />
            {/* Header info */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-2">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.65 0.25 140)', animation: 'ledFlow 1.4s ease-in-out infinite' }} />
                <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: 'oklch(0.85 0.12 250)' }}>
                  SPEAK2CAMPUS
                </span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.65 0.25 30)', animation: 'ledFlow 1.4s ease-in-out infinite', animationDelay: '0.7s' }} />
              </div>
              {/* LED status bar */}
              <div className="flex gap-1.5 items-center">
                {[250, 220, 200, 280, 240, 260, 200].map((hue, i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: `oklch(0.65 0.25 ${hue})`,
                    opacity: 0.4 + (i % 3) * 0.2,
                    animation: `ledFlow ${1.2 + i * 0.15}s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`,
                  }} />
                ))}
              </div>
            </div>
            {/* Right bolt */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.42 0.14 250)', boxShadow: '0 0 4px oklch(0.5 0.18 250 / 0.5)' }} />
          </div>

          {/* ── MAIN FACE ROW: Left Ear + Visor + Right Ear ─── */}
          <div className="flex w-full">

            {/* LEFT EAR */}
            <div style={{
              width: 26, flexShrink: 0,
              background: 'linear-gradient(to right, oklch(0.2 0.1 250), oklch(0.26 0.13 250))',
              border: '1.5px solid oklch(0.42 0.16 250 / 0.6)',
              borderRight: 'none', borderTop: 'none', borderBottom: 'none',
              borderRadius: '10px 0 0 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 7, paddingTop: 10, paddingBottom: 10,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.62 0.24 200)', boxShadow: '0 0 8px oklch(0.55 0.22 200)', animation: 'ledFlow 2s ease-in-out infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.42 0.15 250)', opacity: 0.6 }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.42 0.15 250)', opacity: 0.3 }} />
              <div style={{ width: 3, height: 20, borderRadius: 2, background: 'oklch(0.38 0.14 250 / 0.5)' }} />
            </div>

            {/* ── FACE / VISOR ── */}
            <div
              className="relative flex-1 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #050a14 0%, #08111f 55%, #050e1a 100%)',
                border: '1.5px solid oklch(0.45 0.18 250 / 0.55)',
                borderLeft: 'none', borderRight: 'none',
                borderTop: 'none',
                minHeight: 280,
              }}
            >
              {/* Star field inside visor */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {stars.current.map((s, i) => (
                  <span key={i} className="absolute rounded-full bg-white" style={{
                    width: s.w, height: s.w,
                    top: `${s.top}%`, left: `${s.left}%`,
                    opacity: s.op,
                    animation: `pulse ${s.dur}s ease-in-out infinite`,
                    animationDelay: `${s.del}s`,
                  }} />
                ))}
              </div>

              {/* Scan line effect */}
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  height: 2,
                  background: 'linear-gradient(to right, transparent, oklch(0.6 0.2 250 / 0.15), transparent)',
                  animation: 'liRaScan 4s linear infinite',
                }}
              />

              {/* Ambient visor glow */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 50% 40%, oklch(0.35 0.15 250 / 0.12) 0%, transparent 65%)',
              }} />

              {/* ── ROBOT EYES ── */}
              <div className="relative z-10 flex items-center justify-center gap-8 mt-7 mb-3">
                {/* Left Eye */}
                <div className="relative flex items-center justify-center" style={{
                  width: 52, height: 36,
                  background: 'linear-gradient(135deg, #04101e, #081828)',
                  borderRadius: 8,
                  border: '1.5px solid oklch(0.55 0.22 200 / 0.75)',
                  animation: 'liRaEyeGlow 3s ease-in-out infinite',
                  overflow: 'hidden',
                }}>
                  {/* Eyelid overlay that scales to blink */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #04101e, #081828)',
                    transformOrigin: 'top center',
                    animation: 'liraBlink 5s ease-in-out infinite',
                    zIndex: 2,
                  }} />
                  {/* Iris */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'radial-gradient(circle, oklch(0.92 0.35 190) 0%, oklch(0.65 0.3 200) 40%, oklch(0.35 0.2 220) 100%)',
                    boxShadow: '0 0 12px oklch(0.7 0.3 195)',
                    zIndex: 1,
                  }} />
                  {/* Pupil */}
                  <div style={{
                    position: 'absolute', width: 7, height: 7, borderRadius: '50%',
                    background: '#000', zIndex: 3,
                  }} />
                  {/* Eye glint */}
                  <div style={{
                    position: 'absolute', top: 7, right: 10,
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'oklch(0.95 0.05 200 / 0.9)', zIndex: 4,
                  }} />
                </div>

                {/* Nose (mic icon area) */}
                <div className="flex flex-col items-center gap-0.5">
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.45 0.15 250 / 0.7)' }} />
                  <div style={{ width: 2, height: 8, borderRadius: 1, background: 'oklch(0.35 0.12 250 / 0.5)' }} />
                </div>

                {/* Right Eye */}
                <div className="relative flex items-center justify-center" style={{
                  width: 52, height: 36,
                  background: 'linear-gradient(135deg, #04101e, #081828)',
                  borderRadius: 8,
                  border: '1.5px solid oklch(0.55 0.22 200 / 0.75)',
                  animation: 'liRaEyeGlow 3s ease-in-out infinite',
                  animationDelay: '0.3s',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #04101e, #081828)',
                    transformOrigin: 'top center',
                    animation: 'liraBlink2 5s ease-in-out infinite',
                    animationDelay: '0.4s',
                    zIndex: 2,
                  }} />
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'radial-gradient(circle, oklch(0.92 0.35 190) 0%, oklch(0.65 0.3 200) 40%, oklch(0.35 0.2 220) 100%)',
                    boxShadow: '0 0 12px oklch(0.7 0.3 195)',
                    zIndex: 1,
                  }} />
                  <div style={{
                    position: 'absolute', width: 7, height: 7, borderRadius: '50%',
                    background: '#000', zIndex: 3,
                  }} />
                  <div style={{
                    position: 'absolute', top: 7, right: 10,
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'oklch(0.95 0.05 200 / 0.9)', zIndex: 4,
                  }} />
                </div>
              </div>

              {/* ── Clock ── */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="text-4xl font-thin tracking-widest text-white/92"
                  style={{ fontVariantNumeric: 'tabular-nums', textShadow: '0 0 24px oklch(0.65 0.18 250 / 0.6)' }}
                >
                  {time}
                </div>
                <div className="text-xs text-white/45 tracking-wide mt-0.5">{date}</div>
              </div>

              {/* ── LIRA label ── */}
              <div className="relative z-10 flex flex-col items-center gap-1 mt-3 mb-2">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 14px', borderRadius: 20,
                  border: '1px solid oklch(0.5 0.18 250 / 0.4)',
                  background: 'oklch(0.25 0.12 250 / 0.3)',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'oklch(0.65 0.25 140)', animation: 'ledFlow 1.6s ease-in-out infinite' }} />
                  <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: 'oklch(0.72 0.18 250)' }}>
                    LIRA
                  </span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'oklch(0.65 0.25 140)', animation: 'ledFlow 1.6s ease-in-out infinite', animationDelay: '0.8s' }} />
                </div>
                <div className="text-white/35 text-[10px] tracking-wide">Campus Voice Guide</div>
              </div>

              {/* ── Speaker / mouth grille ── */}
              <div className="relative z-10 flex items-end justify-center gap-1 pb-4 mt-1">
                {[2, 5, 8, 11, 9, 14, 11, 9, 8, 5, 2].map((h, i) => (
                  <div key={i} style={{
                    width: 3, height: h,
                    borderRadius: 2,
                    background: `oklch(0.55 0.22 ${240 + i * 4})`,
                    opacity: 0.7,
                    animation: `mouthBar ${0.8 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.07}s`,
                  }} />
                ))}
              </div>
            </div>

            {/* RIGHT EAR */}
            <div style={{
              width: 26, flexShrink: 0,
              background: 'linear-gradient(to left, oklch(0.2 0.1 250), oklch(0.26 0.13 250))',
              border: '1.5px solid oklch(0.42 0.16 250 / 0.6)',
              borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
              borderRadius: '0 10px 10px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 7, paddingTop: 10, paddingBottom: 10,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.62 0.24 200)', boxShadow: '0 0 8px oklch(0.55 0.22 200)', animation: 'ledFlow 2s ease-in-out infinite', animationDelay: '1s' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.42 0.15 250)', opacity: 0.6 }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.42 0.15 250)', opacity: 0.3 }} />
              <div style={{ width: 3, height: 20, borderRadius: 2, background: 'oklch(0.38 0.14 250 / 0.5)' }} />
            </div>
          </div>

          {/* ── CHIN / JAW PANEL ── */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(180deg, oklch(0.18 0.1 250), oklch(0.13 0.07 250))',
            border: '1.5px solid oklch(0.4 0.15 250 / 0.5)',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px',
            padding: '8px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Left chin bolt */}
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'oklch(0.4 0.13 250)', boxShadow: '0 0 4px oklch(0.45 0.15 250 / 0.6)' }} />
            {/* Chin status dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: i === 0 ? 'oklch(0.65 0.25 140)' : 'oklch(0.38 0.12 250)',
                  opacity: i === 0 ? 1 : 0.4,
                  animation: i === 0 ? 'ledFlow 1.8s ease-in-out infinite' : undefined,
                }} />
              ))}
            </div>
            {/* Right chin bolt */}
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'oklch(0.4 0.13 250)', boxShadow: '0 0 4px oklch(0.45 0.15 250 / 0.6)' }} />
          </div>

          {/* ── NECK stub ── */}
          <div style={{
            width: '40%', height: 10,
            background: 'linear-gradient(180deg, oklch(0.18 0.1 250), oklch(0.12 0.06 250))',
            border: '1px solid oklch(0.35 0.12 250 / 0.4)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
          }} />

          {/* ── Wake hint ── */}
          <div
            className="flex flex-col items-center gap-1.5 mt-5"
            style={{ animation: 'bounce 2.5s ease-in-out infinite' }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '1px solid oklch(0.55 0.18 250 / 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.55 0.18 250 / 0.5)' }} />
            </div>
            <span style={{
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'oklch(0.5 0.12 250 / 0.7)',
            }}>
              Tap or say Hi Lira
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Wake Animation Overlay ─────────────────────────────────────────────────

function WakeAnimation({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div
      className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
      style={{ background: "radial-gradient(circle at center, oklch(0.45 0.18 250 / 0.35) 0%, transparent 70%)" }}
    >
      <div
        className="w-32 h-32 rounded-full border-2 border-blue-400/60 animate-ping"
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  )
}

// ─── Alexa-style Lira Status Ring ────────────────────────────────────────────
/**
 * Shows an animated orb + wave bars when Lira is actively listening,
 * processing or speaking. Hidden when SLEEPING or IDLE/WAKE_LISTENING.
 */
function LiraStatusRing({ state }: { state: LiraState }) {
  const isListening = state === 'MANUAL_ACTIVE' || state === 'VOICE_ACTIVE'
  const isSpeaking = state === 'SPEAKING'
  const isProcessing = state === 'PROCESSING'

  if (!isListening && !isSpeaking && !isProcessing) return null

  // Color palette per state
  const orbBg = isSpeaking
    ? 'radial-gradient(circle, oklch(0.62 0.26 145) 0%, oklch(0.42 0.22 145) 100%)'
    : isListening
      ? 'radial-gradient(circle, oklch(0.62 0.22 10) 0%, oklch(0.42 0.18 10) 100%)'
      : 'radial-gradient(circle, oklch(0.68 0.20 55) 0%, oklch(0.50 0.18 55) 100%)'

  const barColor = isSpeaking
    ? 'oklch(0.65 0.26 145)'
    : isListening
      ? 'oklch(0.65 0.22 10)'
      : 'oklch(0.72 0.20 55)'

  const ringColor = isSpeaking
    ? 'oklch(0.60 0.24 145 / 0.55)'
    : 'oklch(0.66 0.22 10 / 0.50)'

  const barHeights = [4, 7, 11, 9, 14, 10, 16, 12, 9, 14, 10, 7, 11, 8, 5]

  return (
    <div
      className="flex items-center justify-center gap-4 py-3 px-4"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* ── Animated orb ── */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Expanding rings (Alexa-style) */}
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute rounded-full" style={{
            width: 44, height: 44,
            border: `1.5px solid ${ringColor}`,
            animation: 'liraRingExpand 1.8s ease-out infinite',
            animationDelay: `${i * 0.6}s`,
          }} />
        ))}
        {/* Core orb */}
        <div className="relative z-10 flex items-center justify-center rounded-full" style={{
          width: 40, height: 40,
          background: orbBg,
          boxShadow: isSpeaking
            ? '0 0 18px oklch(0.55 0.24 145 / 0.55)'
            : isListening
              ? '0 0 18px oklch(0.55 0.2 10 / 0.55)'
              : '0 0 14px oklch(0.62 0.18 55 / 0.45)',
          animation: 'liraOrbPulse 2s ease-in-out infinite',
        }}>
          {isListening
            ? <Mic className="w-4 h-4 text-white" />
            : isSpeaking
              ? <Volume2 className="w-4 h-4 text-white" />
              : <Loader2 className="w-4 h-4 text-white animate-spin" />}
        </div>
      </div>

      {/* ── Wave equalizer bars ── */}
      <div className="flex items-center gap-[3px]" style={{ height: 36 }}>
        {barHeights.map((h, i) => (
          <div key={i} style={{
            width: 3,
            height: (isListening || isSpeaking) ? `${h}px` : '3px',
            borderRadius: 3,
            background: barColor,
            transformOrigin: 'bottom center',
            animation: (isListening || isSpeaking)
              ? `liraBarDance ${0.45 + (i % 5) * 0.13}s ease-in-out infinite`
              : isProcessing ? 'none' : 'none',
            animationDelay: `${i * 0.055}s`,
            opacity: 0.88,
            transition: 'height 0.3s ease',
          }} />
        ))}
      </div>

      {/* ── Status label ── */}
      <span className="text-xs font-medium text-white/70 shrink-0">
        {isListening ? 'Listening…' : isSpeaking ? 'Speaking…' : 'Thinking…'}
      </span>
    </div>
  )
}

// ─── Main VoiceAssistant Component ──────────────────────────────────────────

export function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const contextMemoryRef = useRef<{ query: string; response: string }[]>([])
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const router = useRouter()

  const timetableWizardRef = useRef<{
    step: 'idle' | 'awaiting_dept' | 'awaiting_year'
    dept: string | null
  }>({ step: 'idle', dept: null })

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const addAssistantMessage = useCallback((content: string, extra?: Partial<Message>) => {
    const msg: Message = {
      id: (Date.now() + Math.random()).toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      ...extra,
    }
    setMessages(prev => [...prev, msg])
    return msg
  }, [])

  // ─── Timetable image ─────────────────────────────────────────────────────
  const showTimetableImage = useCallback(async (dept: string, year: string): Promise<string> => {
    const yearLabel = year === '1st' || year.startsWith('1') ? '1st Year' : '2nd Year'
    const deptUpper = dept.toUpperCase()

    const resp = await fetch(
      `/api/timetable-photo?department=${encodeURIComponent(deptUpper)}&year=${encodeURIComponent(yearLabel)}`
    )
    const data = await resp.json()

    if (data && data.file_path) {
      addAssistantMessage(`📅 ${deptUpper} — ${yearLabel} Timetable:`, { imageUrl: data.file_path })
      timetableWizardRef.current = { step: 'idle', dept: null }
      return `Here is the ${deptUpper} ${yearLabel} timetable.`
    } else {
      timetableWizardRef.current = { step: 'idle', dept: null }
      return `No timetable image uploaded yet for ${deptUpper} ${yearLabel}. Please ask an admin to upload it.`
    }
  }, [addAssistantMessage])

  // ─── Wizard button handler ────────────────────────────────────────────────
  const handleWizardButton = useCallback(async (value: string) => {
    const wizard = timetableWizardRef.current

    setMessages(prev => [...prev, {
      id: Date.now().toString(), type: 'user', content: value, timestamp: new Date(),
    }])

    if (wizard.step === 'awaiting_dept') {
      const dept = value
      timetableWizardRef.current = { step: 'awaiting_year', dept }
      addAssistantMessage(`Got it! Now please select your year for ${dept}:`, {
        buttons: [{ label: '1st Year', value: '1st Year' }, { label: '2nd Year', value: '2nd Year' }]
      })
      return
    }

    if (wizard.step === 'awaiting_year') {
      const year = value
      const dept = wizard.dept!
      timetableWizardRef.current = { step: 'idle', dept: null }
      const result = await showTimetableImage(dept, year)
      if (!result.startsWith('Here')) addAssistantMessage(result)
      return
    }
  }, [addAssistantMessage, showTimetableImage])

  // ─── Scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ─── Query pipeline ───────────────────────────────────────────────────────
  const processUserQuery = useCallback(async (query: string): Promise<string> => {
    if (!query.trim()) return ''

    const lq = query.toLowerCase()

    // ── Today's announcements / notices / updates intent ─────────────────────
    // Check ALL announcement/notice/update queries FIRST — before any timetable logic.
    // Conditions:
    //   A) Direct announcement keywords (announcement, notice, notification…)
    //   B) 'today' + update/news/happening context WITHOUT timetable dept
    //   C) 'latest updates', 'any notices', 'college announcements'…
    const hasTimetableAndDept = /\b(timetable|time.?table|class\s+schedule)\b/i.test(lq) && /\b(mca|mba|mcom)\b/i.test(lq)
    const isAnnouncementQuery =
      !hasTimetableAndDept && (
        TODAY_UPDATES_RE.test(lq) ||
        TODAY_CONTEXT_RE.test(lq) ||
        CONTEXT_TODAY_RE.test(lq) ||
        LATEST_UPDATES_RE.test(lq)
      )

    if (isAnnouncementQuery) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: query, timestamp: new Date() },
      ])
      setInputText('')
      try {
        const r = await fetch('/api/today-updates')
        if (r.ok) {
          const data = await r.json()
          const { spoken_response, announcements_count, events_count, date } = data

          // Build a richer display message with counts as context
          let displayMsg = spoken_response
          if (announcements_count > 0 || events_count > 0) {
            displayMsg =
              `📅 Updates for ${date}:\n\n` +
              (data.announcements?.map((a: any, i: number) =>
                `📢 [${a.priority.toUpperCase()}] ${a.title}${a.content ? '\n   ' + a.content : ''}`
              ).join('\n') || '') +
              (data.announcements?.length && data.events?.length ? '\n\n' : '') +
              (data.events?.map((e: any) =>
                `🎉 ${e.name}${e.event_time ? ' · ' + e.event_time : ''}${e.venue ? ' @ ' + e.venue : ''}`
              ).join('\n') || '') +
              `\n\n🔊 ${spoken_response}`
          }

          addAssistantMessage(displayMsg)
          contextMemoryRef.current = [
            ...contextMemoryRef.current.slice(-(CONTEXT_MEMORY_SIZE - 1)),
            { query, response: spoken_response },
          ]
          return spoken_response
        }
      } catch (e) {
        console.warn('[Lira] today-updates fetch error:', e)
      }
      const fallback = "Sorry, I couldn't fetch today's updates right now. Please try again."
      addAssistantMessage(fallback)
      return fallback
    }

    // ── Timetable with dept + year ────────────────────────────────────────────
    const directDept = lq.match(/\b(mca|mba|mcom)\b/i)
    const directYear = lq.match(/\b(1st|first|one)\b|\b(2nd|second|two)\b/i)
    // Timetable requires an explicit 'timetable' keyword OR 'class schedule'.
    // Plain 'schedule' alone is NOT enough — it can mean announcements schedule / event schedule.
    const isTimetableQuery = /\btimetable\b|\btime[\s-]table\b|\bclass\s+schedule\b|\bshow.*timetable\b|\blecture\s+schedule\b/i.test(lq)

    if (isTimetableQuery && directDept && directYear) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: query, timestamp: new Date() }])
      setInputText('')
      const dept = directDept[1].toUpperCase()
      const yearRaw = directYear[1] || directYear[0]
      const year = yearRaw.toLowerCase().startsWith('1') || yearRaw.toLowerCase() === 'first' ? '1st Year' : '2nd Year'
      const result = await showTimetableImage(dept, year)
      if (!result.startsWith('Here')) addAssistantMessage(result)
      return result
    }

    if (isTimetableQuery && directDept && !directYear) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: query, timestamp: new Date() }])
      setInputText('')
      const dept = directDept[1].toUpperCase()
      timetableWizardRef.current = { step: 'awaiting_year', dept }
      addAssistantMessage(`Please select your year for ${dept}:`, {
        buttons: [{ label: '1st Year', value: '1st Year' }, { label: '2nd Year', value: '2nd Year' }]
      })
      return 'Please select year.'
    }

    if (isTimetableQuery) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: query, timestamp: new Date() }])
      setInputText('')
      timetableWizardRef.current = { step: 'awaiting_dept', dept: null }
      addAssistantMessage('Please select your department:', {
        buttons: [{ label: 'MCA', value: 'MCA' }, { label: 'MBA', value: 'MBA' }, { label: 'MCOM', value: 'MCOM' }]
      })
      return 'Please select department.'
    }

    const userMessage: Message = { id: Date.now().toString(), type: "user", content: query, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInputText("")

    let response = ""

    try {
      const kbResp = await fetch("/api/assistant/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          sessionId: sessionIdRef.current,
          contextHistory: contextMemoryRef.current.slice(-CONTEXT_MEMORY_SIZE),
        }),
      })
      if (kbResp.ok) {
        const data = await kbResp.json()
        if (data.success && data.message) {
          response = data.message
          if (data.type === 'redirect' && data.redirect) {
            addAssistantMessage(response)
            // Hard-stop any in-progress speech before navigating away
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel()
            }
            liraFSM.interrupt()
            setTimeout(() => router.push(data.redirect), 1200)
            return response
          }
        }
      }
    } catch (e) {
      console.warn('[Lira] API fallback:', e)
    }

    if (!response) response = await generateLocalResponse(query)

    contextMemoryRef.current = [
      ...contextMemoryRef.current.slice(-(CONTEXT_MEMORY_SIZE - 1)),
      { query, response },
    ]

    addAssistantMessage(response)
    return response
  }, [addAssistantMessage, showTimetableImage])

  // ─── Sarvam-powered FSM hook ──────────────────────────────────────────────
  const {
    state, ui, transcript, speechSupported,
    onTap, onInterrupt, wakeFromTouch, goToSleep, isSleeping, isWakingUp,
    speakText,
  } = useLiraSarvam(processUserQuery)

  // ─── Greet on every wake from sleep ──────────────────────────────────────
  // We hook into liraFSM.onWake DIRECTLY rather than watching `state` —
  // because SLEEPING→IDLE→WAKE_LISTENING happen synchronously and React
  // batches them, so a state useEffect may never see the IDLE transient.
  const greetedThisWakeRef = useRef(false)
  // Live refs so the closure inside useEffect never captures stale values
  const addMsgRef = useRef(addAssistantMessage)
  const speakRef = useRef(speakText)
  useEffect(() => { addMsgRef.current = addAssistantMessage }, [addAssistantMessage])
  useEffect(() => { speakRef.current = speakText }, [speakText])

  useEffect(() => {
    // Wire greeting into the FSM's onWake callback.
    // This fires synchronously inside liraFSM.wake() before any state updates,
    // guaranteeing it always runs on user-initiated wakes.
    const originalOnWake = liraFSM.onWake

    liraFSM.onWake = () => {
      // Run the original wake animation callback first
      originalOnWake?.()

      // Skip greeting if this is a navigation-restore (session already awake)
      if (greetedThisWakeRef.current) return
      greetedThisWakeRef.current = true

      const h = new Date().getHours()
      const salute =
        h >= 5 && h < 12 ? 'Good morning' :
          h >= 12 && h < 17 ? 'Good afternoon' :
            h >= 17 && h < 21 ? 'Good evening' :
              'Hello there'

      const spokenGreeting =
        `${salute}! I'm Lira, the campus voice guide for Seshadripuram College Tumkur. ` +
        `I can help you with faculty information, campus locations, class timetables, ` +
        `today's announcements and events. How can I assist you today?`

      const chatGreeting =
        `${salute}! 👋 I'm **LIRA** — your Campus Voice Guide for Seshadripuram College Tumkur.\n\n` +
        `Here's what I can help you with:\n` +
        `• 🏫 **Locations** — labs, library, canteen, offices\n` +
        `• 👤 **Faculty** — HOD, professors, contact info\n` +
        `• 🗓️ **Timetable** — MCA, MBA, MCOM schedules\n` +
        `• 📢 **Announcements** — today's notices & events\n\n` +
        `_Tap the mic or type your question below!_`

      // Small delay so wake animation starts first, then greet
      setTimeout(() => {
        addMsgRef.current(chatGreeting)
        setTimeout(() => { speakRef.current?.(spokenGreeting) }, 300)
      }, 600)
    }

    // Reset greeting flag whenever Lira goes back to sleep
    // so the NEXT wake gets a fresh greeting
    const originalOnSleep = liraFSM.onSleep
    liraFSM.onSleep = () => {
      originalOnSleep?.()
      greetedThisWakeRef.current = false
    }

    return () => {
      // Restore originals on unmount
      liraFSM.onWake = originalOnWake
      liraFSM.onSleep = originalOnSleep
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Text submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = inputText.trim()
    if (!q) return
    setInputText('')
    // Cancel any in-progress speech IMMEDIATELY so the user hears the new response
    if (speakText) speakText('')
    const response = await processUserQuery(q)
    if (response && speakText) speakText(response)
  }

  // ─── Quick-action submit (also speaks) ────────────────────────────────────
  const handleQuickAction = useCallback(async (q: string) => {
    // Cancel immediately, then speak the new response when ready
    if (speakText) speakText('')
    const response = await processUserQuery(q)
    if (response && speakText) speakText(response)
  }, [processUserQuery, speakText])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-4xl mx-auto h-screen flex flex-col">

        {/* ── Header — hidden during sleep, shown only when awake ──────────── */}
        <header className={cn(
          "sticky top-0 z-30 bg-white/95 border-b border-border px-4 py-3",
          "transition-all duration-500 overflow-hidden",
          isSleeping ? "max-h-0 opacity-0 pointer-events-none py-0 border-0" : "max-h-24 opacity-100"
        )}>
          <div className="flex items-center justify-between gap-3">

            {/* Left: Logo + title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">SPEAK2CAMPUS</h1>
                <p className="text-xs text-muted-foreground">Seshadripuram College Tumkur — Lira</p>
              </div>
            </div>

            {/* Right: college logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-lg flex-shrink-0">
                <img
                  src="/seshadripuram-logo.png"
                  alt="Seshadripuram Educational Trust"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Speech not supported */}
          {!speechSupported && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Mic not available — use Chrome or Edge for voice activation. Text input still works.</span>
            </div>
          )}
        </header>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div
          className="relative flex-1 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/sdcollege-tumakuru.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10" />

          {/* Wake flash animation */}
          <WakeAnimation visible={isWakingUp} />

          <div className="relative z-20 h-full flex flex-col bg-white/5 dark:bg-black/5 rounded-b-lg shadow-xl overflow-hidden">

            {/* Quick-action nav bar — only visible when Lira is awake */}
            {!isSleeping && (
              <div className="relative z-30 bg-muted/30 border-b border-border shrink-0">
                <QuickActions onAction={handleQuickAction} />
              </div>
            )}

            {/* Rest of content — sleep screen sits inside this flex-1 area only */}
            <div className="relative flex-1 flex flex-col overflow-hidden">

              {/* Sleep screen — only covers the chat+input area, NOT QuickActions */}
              {isSleeping && <SleepScreen onWake={wakeFromTouch} isWakingUp={isWakingUp} />}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onButtonClick={handleWizardButton}
                  />
                ))}

                {/* Processing spinner bubble */}
                {ui.showProcessingDots && (
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary shrink-0">
                      <GraduationCap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <Card className="px-4 py-3 bg-muted max-w-[80%]">
                      <ProcessingDots />
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Live Transcript */}
              {transcript && (state === 'MANUAL_ACTIVE' || state === 'VOICE_ACTIVE') && (
                <div className="px-4 py-2 bg-black/40 border-t border-white/20 backdrop-blur-sm">
                  <p className="text-sm text-white italic">🎙️ &quot;{transcript}&quot;</p>
                </div>
              )}

              {/* Alexa-style Lira Status Ring — listening / processing / speaking */}
              <LiraStatusRing state={state} />

              {/* ── Input Bar ──────────────────────────────────────────────── */}
              <div className="sticky bottom-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm border-t border-border px-4 py-3">

                {/* Cancel row */}
                {ui.cancelButtonVisible && (
                  <div className="flex justify-center mb-2">
                    <CancelButton onInterrupt={onInterrupt} />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  <ActivationButton ui={ui} onTap={onTap} onInterrupt={onInterrupt} />

                  <Input
                    id="lira-text-input"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={
                      isSleeping
                        ? 'Tap screen or say "Hi Lira" to wake…'
                        : state === 'MANUAL_ACTIVE' || state === 'VOICE_ACTIVE'
                          ? 'Listening…'
                          : state === 'PROCESSING'
                            ? 'Processing…'
                            : state === 'SPEAKING'
                              ? '⏸️ Type to interrupt Lira…'
                              : 'Type your question or say "Hi Lira"…'
                    }
                    className="flex-1 h-12 text-base placeholder:text-muted-foreground bg-white"
                    disabled={isSleeping || state === 'PROCESSING' || state === 'MANUAL_ACTIVE' || state === 'VOICE_ACTIVE'}
                  />

                  <Button
                    id="lira-send-button"
                    type="submit"
                    size="lg"
                    className="rounded-full w-12 h-12 shrink-0"
                    disabled={!inputText.trim() || isSleeping || state === 'PROCESSING' || state === 'MANUAL_ACTIVE' || state === 'VOICE_ACTIVE'}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>

                {/* Status hint */}
                <p className="text-center text-xs text-muted-foreground mt-2 transition-all duration-300">
                  {isSleeping
                    ? '💤 Lira is sleeping — tap the screen or say "Hi Lira" to wake'
                    : state === 'MANUAL_ACTIVE' ? '🔴 Tap recording — stay silent to submit or tap Stop'
                      : state === 'VOICE_ACTIVE' ? '🔴 Voice recording — stay silent to submit or tap Stop'
                        : state === 'PROCESSING' ? '⚙️ Processing your request…'
                          : state === 'SPEAKING' ? '🔊 Lira is speaking — type below to interrupt with a new question'
                            : state === 'WAKE_LISTENING' ? 'Say your question 🎤 or tap the mic button'
                              : 'Ready — tap mic to speak or type below'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Floating buttons — only visible when Lira is awake */}
      {!isSleeping && (
        <>
          {/* Sleep button — floats above the Founders button */}
          <Button
            id="lira-sleep-floating-button"
            type="button"
            size="icon"
            variant="outline"
            onClick={goToSleep}
            title="Put Lira to sleep"
            className="fixed bottom-44 right-64 z-50 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>

          <FoundersFloatingButton />

          <Link href="/admin/login">
            <Button
              variant="outline"
              size="sm"
              className="fixed bottom-4 right-4 text-xs opacity-50 hover:opacity-100 bg-transparent z-50"
            >
              Admin
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}

// ─── Local data fallback ────────────────────────────────────────────────────

async function generateLocalResponse(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase()
  try {
    const [locations, faculty, events, timetable] = await Promise.all([
      fetchLocations(), fetchFaculty(), fetchEvents(), fetchTimetable(),
    ])

    // Guard: API may return an error object instead of array — always use safe arrays
    const locationList: any[] = Array.isArray(locations) ? locations : []
    const facultyList: any[] = Array.isArray(faculty) ? faculty : []
    const eventList: any[] = Array.isArray(events) ? events : []
    const timetableList: any[] = Array.isArray(timetable) ? timetable : []

    const resolveFacultyName = (t: any) =>
      t.faculty || t.faculty_name ||
      (t.faculty_id
        ? facultyList.find((f: any) => String(f.id) === String(t.faculty_id))?.name
        : ''
      ) || ''

    if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste)/i.test(lowerQuery))
      return "Hello! Welcome to Seshadripuram College Tumkur. I am LIRA, your campus guide. Ask me about locations, faculty, timetable, or events!"

    if (/help|guide|what can|how do|how to use/i.test(lowerQuery))
      return "I can help you with:\n\n1. LOCATIONS — Ask 'Where is the lab?'\n2. FACULTY — Ask 'Who is HOD?'\n3. TIMETABLE — Ask 'Show MCA timetable'\n4. EVENTS — Ask 'Upcoming events?'\n5. ANNOUNCEMENTS — Ask 'Any notices today?' or 'Show announcements'\n6. CLASSROOM — Ask 'MCA 1st Year Classroom'\n\nJust ask naturally!"

    // ── Announcements / Notices fallback ──────────────────────────────────────
    // This is reached only if the primary isAnnouncementQuery path failed (fetch error).
    // Re-check here with the same pattern so generateLocalResponse is a true fallback.
    const _announcementFallback =
      TODAY_UPDATES_RE.test(lowerQuery) ||
      TODAY_CONTEXT_RE.test(lowerQuery) ||
      CONTEXT_TODAY_RE.test(lowerQuery) ||
      LATEST_UPDATES_RE.test(lowerQuery)

    if (_announcementFallback) {
      try {
        const r = await fetch('/api/today-updates')
        if (r.ok) {
          const data = await r.json()
          if (data.spoken_response) {
            let displayMsg = data.spoken_response
            if (data.announcements_count > 0 || data.events_count > 0) {
              displayMsg =
                `📅 Today's Updates (${data.date}):\n\n` +
                (data.announcements?.map((a: any) =>
                  `📢 [${(a.priority || 'info').toUpperCase()}] ${a.title}${a.content ? '\n   ' + a.content : ''}`
                ).join('\n') || '') +
                (data.announcements?.length && data.events?.length ? '\n\n' : '') +
                (data.events?.map((e: any) =>
                  `🎉 ${e.name}${e.event_time ? ' · ' + e.event_time : ''}${e.venue ? ' @ ' + e.venue : ''}`
                ).join('\n') || '') +
                `\n\n🔊 ${data.spoken_response}`
            }
            return displayMsg
          }
        }
      } catch (_e) { /* fall through to FALLBACK_MESSAGE */ }
      return "Sorry, I couldn't fetch today's notices. Please try again."
    }

    // ── Classroom Finder ───────────────────────────────────────────────────
    // Triggers on: "classroom", "class room", "which room", "where is <dept> class"
    if (/classroom|class\s*room|which room|which class|where.*class|mca.*class|mba.*class|mcom.*class/i.test(lowerQuery)) {

      // Extract department: MCA / MBA / MCOM
      const deptMatch = lowerQuery.match(/\b(mca|mba|mcom)\b/i)
      const dept = deptMatch ? deptMatch[1].toUpperCase() : null

      // Extract year: 1st / 2nd — accept many forms
      const yearMatch = lowerQuery.match(/\b(1st|first|1)\b|\b(2nd|second|2)\b/i)
      let year: string | null = null
      if (yearMatch) {
        year = (yearMatch[1] || yearMatch[0]).toLowerCase().startsWith('1') ||
          (yearMatch[1] || yearMatch[0]).toLowerCase() === 'first'
          ? '1st' : '2nd'
      }

      try {
        // Build query params based on what was extracted
        const params = new URLSearchParams()
        if (dept) params.set('department', dept)
        if (year) params.set('year', year)

        const resp = await fetch(`/api/classrooms?${params.toString()}`)
        const data = await resp.json()

        if (!data.found || !data.results || data.results.length === 0) {
          const who = dept && year ? `${dept} ${year} Year` : dept ? dept : 'that combination'
          return `Sorry, no classroom details found for ${who}. Please check the department and year.`
        }

        // dept + year both given → exactly ONE result
        if (dept && year) {
          const r = data.results[0]
          const yearLabel = r.year === '1st' ? '1st Year' : '2nd Year'
          const rooms = r.rooms.length > 0 ? r.rooms.join(', ') : 'Not assigned'

          // Show the distinct rooms used + a day-wise schedule summary
          const days: Record<string, string[]> = {}
          for (const s of r.schedule) {
            const d = s.day || 'Unknown'
            if (!days[d]) days[d] = []
            if (s.room && !days[d].includes(s.room)) days[d].push(s.room)
          }
          const daySummary = Object.entries(days)
            .map(([d, rs]) => `  ${d}: ${rs.join(' / ')}`)
            .join('\n')

          return (
            `🏫 ${r.department} — ${yearLabel} Classrooms:\n\n` +
            `Primary rooms used: ${rooms}\n\n` +
            `Day-wise classrooms:\n${daySummary || '  No schedule data available'}`
          )
        }

        // Only dept given → show all years for that dept
        return (
          `🏫 ${dept} Classrooms by Year:\n\n` +
          data.results.map((r: any) => {
            const yearLabel = r.year === '1st' ? '1st Year' : '2nd Year'
            const rooms = r.rooms.length > 0 ? r.rooms.join(', ') : 'Not assigned'
            return `${yearLabel}: ${rooms}`
          }).join('\n') +
          '\n\nAsk "MCA 1st Year Classroom" for a detailed schedule.'
        )
      } catch (e) {
        console.error('[Lira] classroom finder error:', e)
        return 'Sorry, I could not fetch classroom details right now. Please try again.'
      }
    }

    if (/where|location|find|how.*reach|building|room|floor|lab|library|cafeteria|auditorium|office|cabin|seminar|placement|available|show.*place|all.*place/i.test(lowerQuery)) {

      // ── Step 1: "List all" intent — evaluated FIRST before any keyword matching.
      //    Covers: quick-action "What locations are available?", "Show all locations",
      //            "List places", "What locations are there?", etc.
      const isListAllIntent =
        /all|available|list|show.*location|what.*location|where.*location|campus.*location|places/i.test(lowerQuery) &&
        !/where is|find the|how.*reach|which floor|which building/i.test(lowerQuery)

      if (isListAllIntent) {
        if (locationList.length > 0) {
          return (
            `📍 Campus Locations (${locationList.length} total):\n\n` +
            locationList
              .map((l: any) => `• ${l.name}\n   ${[l.floor, l.building].filter(Boolean).join(', ')}${l.description ? '\n   ' + l.description : ''}`)
              .join('\n\n')
          )
        }
        return "No locations found in the database. Please add locations from the admin panel."
      }

      // ── Step 2: Specific search — use a stop-word list instead of stripping by regex
      //    This preserves words like "lab", "library", "seminar" that the old regex deleted.
      const LOC_STOP_WORDS = new Set(['where', 'is', 'the', 'are', 'how', 'do', 'i', 'find',
        'reach', 'can', 'a', 'an', 'to', 'go', 'get', 'what', 'which', 'please', 'tell', 'me', 'about', 'show'])
      const searchKeywords = lowerQuery
        .replace(/[?.!,]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !LOC_STOP_WORDS.has(w))

      if (searchKeywords.length > 0) {
        const matchedLocations = locationList.filter((loc: any) => {
          const haystack = `${loc.name || ''} ${loc.building || ''} ${loc.floor || ''} ${loc.description || ''}`.toLowerCase()
          return searchKeywords.some(kw => haystack.includes(kw))
        })
        if (matchedLocations.length > 0)
          return (
            `📍 Found ${matchedLocations.length} location${matchedLocations.length > 1 ? 's' : ''}:\n\n` +
            matchedLocations.map((loc: any) =>
              `${loc.name}\n📍 ${[loc.floor, loc.building].filter(Boolean).join(', ')}\n${loc.description || ''}`
            ).join('\n\n')
          )
      }

      // ── Step 3: Nothing specific matched — show all as a helpful fallback
      if (locationList.length > 0) {
        return (
          `I couldn't find a specific match. Here are all ${locationList.length} campus locations:\n\n` +
          locationList.map((l: any) => `• ${l.name} — ${[l.floor, l.building].filter(Boolean).join(', ')}`).join('\n')
        )
      }
      return "I couldn't find that location. Try asking about labs, library, cafeteria, seminar hall, or auditorium."
    }

    if (/faculty|professor|prof|teacher|hod|head|department|dr|specialist|who|tell.*about|members|staff|list/i.test(lowerQuery)) {
      const context = processQuery(query)
      if (!context.department)
        return "Which department?\n\n• MCA\n• MBA\n• MCOM\n\nExample: 'Show MBA faculty'"
      const deptFaculty = facultyList.filter((f: any) => (f.department || f.dept_name || '').toUpperCase() === context.department)
      if (/hod|head.*department/i.test(lowerQuery)) {
        const hod = deptFaculty.filter((f: any) => /hod|head/i.test(f.designation))
        if (hod.length > 0) return `${context.department} HOD:\n\n` + hod.map((f: any) => `${f.name}\n${f.designation} • ${f.specialization}\n✉️ ${f.email}`).join('\n\n')
      }
      if (deptFaculty.length > 0)
        return `${context.department} Faculty:\n\n` + deptFaculty.map((f: any) => `${f.name}\n${f.designation} • ${f.specialization}\n✉️ ${f.email}\n🏢 ${f.cabin}`).join('\n\n')
      return `No faculty found for ${context.department}.`
    }

    if (/timetable|time.?table|time-table|class\s+schedule|show.*timetable|lecture.*schedule|subject.*schedule/i.test(lowerQuery)) {
      const context = processQuery(query)
      if (!context.department)
        return "Which department's timetable?\n\n• MCA\n• MBA\n• MCOM"
      const deptTimetable = timetableList.filter((t: any) => (t.department || '').toUpperCase() === context.department)
      let selectedDay = context.day
      if (/today/i.test(lowerQuery)) {
        const d = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        selectedDay = d === 'sunday' ? 'monday' : d
      } else if (/tomorrow/i.test(lowerQuery)) {
        const t2 = new Date(); t2.setDate(t2.getDate() + 1)
        const d2 = t2.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        selectedDay = d2 === 'sunday' ? 'monday' : d2
      }
      if (selectedDay) {
        const dayClasses = deptTimetable.filter((t: any) => (t.day_of_week || t.day || '').toLowerCase() === selectedDay)
        if (dayClasses.length > 0) {
          const dayCapital = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
          return `${context.department} - ${dayCapital}:\n\n` +
            dayClasses.map((t: any) => {
              const time = t.start_time ? `${t.start_time} - ${t.end_time}` : (t.time || '')
              return `${time}\n📚 ${t.subject}\n👨‍🏫 ${resolveFacultyName(t) || 'TBA'}\n🏢 ${t.classroom || t.room}`
            }).join("\n\n")
        }
        return `No classes for ${context.department} on ${selectedDay}.`
      }
      return `${context.department} timetable available. Ask about a specific day, e.g. 'MCA Monday schedule'.`
    }

    if (/event|activity|coming|upcoming|workshop|seminar|program|hackathon|competition/i.test(lowerQuery)) {
      if (eventList.length > 0)
        return "Upcoming Events:\n\n" + eventList.slice(0, 5).map((e: any) => {
          const d = new Date(e.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })
          const time = e.event_time ? ` · ${e.event_time}` : ''
          return `${e.name}${time}\n📅 ${d}\n📍 ${e.venue}\n${e.description}`
        }).join("\n\n")
      return "No upcoming events scheduled."
    }

    return FALLBACK_MESSAGE
  } catch (error) {
    console.error('[Lira] generateLocalResponse error:', error)
    return FALLBACK_MESSAGE
  }
}
