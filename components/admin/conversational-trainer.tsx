'use client'

import React, { useState, useEffect, useRef } from 'react'

// ─── Internal route options ────────────────────────────────────────────────
const INTERNAL_ROUTES = [
    { label: 'Home', value: '/' },
    { label: 'Faculty Directory', value: '/faculty' },
    { label: 'Events', value: '/events' },
    { label: 'Timetable', value: '/timetable' },
    { label: 'Gallery', value: '/gallery' },
    { label: 'Virtual Tour', value: '/virtual-tour' },
    { label: 'Founders', value: '/founders' },
    { label: 'Locations', value: '/locations' },
    { label: 'About', value: '/about' },
]

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'to', 'of', 'in', 'on', 'at', 'for',
    'with', 'about', 'by', 'from', 'what', 'where', 'when', 'who', 'how',
    'tell', 'me', 'please', 'hi', 'hello', 'hey',
])

function autoKeywords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 8)
}

// ─── Types ─────────────────────────────────────────────────────────────────
type ActionType = 'text' | 'redirect'
type MatchMode = 'contains' | 'exact'

interface TrainerState {
    intent: string
    variations: string[]
    actionType: ActionType
    message: string
    redirectUrl: string
    keywords: string[]
    matchMode: MatchMode
    priority: number
    department: string
}

const DEFAULT_STATE: TrainerState = {
    intent: '',
    variations: [],
    actionType: 'text',
    message: '',
    redirectUrl: '/',
    keywords: [],
    matchMode: 'contains',
    priority: 5,
    department: 'General',
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function QuestionBubble({ text, onRemove, index }: { text: string; onRemove: () => void; index: number }) {
    const isMain = index === 0
    return (
        <div className="flex items-start gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
        ${isMain ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {isMain ? 'Q' : index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <div className={`inline-block max-w-full px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm shadow-sm
          ${isMain
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {text}
                    {isMain && <span className="ml-2 text-xs opacity-70 font-medium">primary</span>}
                </div>
            </div>
            {!isMain && (
                <button
                    onClick={onRemove}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-xs transition-colors"
                    title="Remove variation"
                >✕</button>
            )}
        </div>
    )
}

function KeywordTag({ kw, onRemove }: { kw: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
            #{kw}
            <button onClick={onRemove} className="hover:text-red-500 transition-colors ml-0.5">✕</button>
        </span>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ConversationalTrainer({ onSaved }: { onSaved?: () => void }) {
    const [form, setForm] = useState<TrainerState>(DEFAULT_STATE)
    const [variationInput, setVariationInput] = useState('')
    const [keywordInput, setKeywordInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [dupWarning, setDupWarning] = useState('')
    const [testInput, setTestInput] = useState('')
    const [testResult, setTestResult] = useState<string | null>(null)
    const [testRunning, setTestRunning] = useState(false)
    const variationRef = useRef<HTMLInputElement>(null)

    // auto-generate keywords when intent changes
    useEffect(() => {
        if (form.intent) {
            const generated = autoKeywords(form.intent)
            setForm(f => ({ ...f, keywords: generated }))
        }
    }, [form.intent])

    // duplicate detection
    useEffect(() => {
        if (!form.intent.trim()) { setDupWarning(''); return }
        const t = setTimeout(async () => {
            try {
                const res = await fetch('/api/knowledge/route')
                if (!res.ok) return
                const data = await res.json()
                const found = Array.isArray(data) && data.some((d: any) =>
                    (d.intent || d.question || '').toLowerCase().trim() === form.intent.toLowerCase().trim()
                )
                setDupWarning(found ? '⚠️ An entry with this intent already exists.' : '')
            } catch { /* ignore */ }
        }, 600)
        return () => clearTimeout(t)
    }, [form.intent])

    const update = (patch: Partial<TrainerState>) => setForm(f => ({ ...f, ...patch }))

    const addVariation = () => {
        const v = variationInput.trim()
        if (!v || form.variations.includes(v)) return
        update({ variations: [...form.variations, v] })
        setVariationInput('')
        variationRef.current?.focus()
    }

    const removeVariation = (i: number) =>
        update({ variations: form.variations.filter((_, idx) => idx !== i) })

    const addKeyword = () => {
        const k = keywordInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!k || form.keywords.includes(k)) return
        update({ keywords: [...form.keywords, k] })
        setKeywordInput('')
    }

    const removeKeyword = (k: string) =>
        update({ keywords: form.keywords.filter(x => x !== k) })

    // Live simulation
    function simulate() {
        if (!form.intent) return '—'
        const response = form.actionType === 'text'
            ? (form.message || '…')
            : `↗ Redirecting you to ${INTERNAL_ROUTES.find(r => r.value === form.redirectUrl)?.label ?? form.redirectUrl}`
        return response
    }

    // Test before save
    const handleTest = async () => {
        if (!testInput.trim()) return
        setTestRunning(true)
        setTestResult(null)
        try {
            const res = await fetch('/api/assistant/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: testInput.trim() })
            })
            const data = await res.json()
            setTestResult(data.message || 'No response')
        } catch {
            setTestResult('Error testing query')
        } finally {
            setTestRunning(false)
        }
    }

    // Submit
    const handleSave = async () => {
        setError('')
        setSuccess('')

        if (!form.intent.trim()) { setError('Primary trigger question is required.'); return }
        if (form.actionType === 'text' && !form.message.trim()) { setError('Response message is required for Text action.'); return }
        if (form.actionType === 'redirect' && !form.redirectUrl) { setError('Please select a redirect page.'); return }
        if (form.keywords.length === 0) { setError('At least one keyword is required.'); return }

        setLoading(true)
        try {
            const token = localStorage.getItem('adminToken') || ''
            const payload = {
                intent: form.intent.trim(),
                variations: form.variations,
                department: form.department,
                action_type: form.actionType,
                action_config: form.actionType === 'text'
                    ? { message: form.message.trim() }
                    : { url: form.redirectUrl },
                keywords: form.keywords,
                match_mode: form.matchMode,
                priority: form.priority,
            }
            const res = await fetch('/api/knowledge/train', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || data.message || 'Failed to save')

            setSuccess('✅ Training entry saved! The assistant now knows this.')
            setForm(DEFAULT_STATE)
            setTestInput('')
            setTestResult(null)
            onSaved?.()
            setTimeout(() => setSuccess(''), 4000)
        } catch (e: any) {
            setError(e.message || 'Unexpected error')
        } finally {
            setLoading(false)
        }
    }

    const previewQuestion = form.intent || 'Your trigger question...'
    const previewAnswer = simulate()

    return (
        <div className="font-sans">
            {/* ── Header banner ─────────────────────────────────────────────── */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow">🧠</div>
                    <div>
                        <h2 className="text-white font-bold text-lg leading-tight">Conversation-Based Training Builder</h2>
                        <p className="text-white/75 text-xs">Teach the assistant through a natural chat interface</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        <span className="text-white text-xs font-medium">Live</span>
                    </div>
                </div>
            </div>

            {/* ── Two-Panel Layout ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* ════ LEFT PANEL — Training Chat Area ════ */}
                <div className="flex flex-col gap-4">
                    {/* Primary question */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">💬</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Primary Trigger Question</h3>
                        </div>
                        <div className="relative">
                            <input
                                className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder-slate-400
                  ${dupWarning ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'}`}
                                placeholder="e.g. Tell me about MCA course"
                                value={form.intent}
                                onChange={e => update({ intent: e.target.value })}
                            />
                        </div>
                        {dupWarning && (
                            <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">{dupWarning}</p>
                        )}
                    </div>

                    {/* Chat bubbles */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🗂️</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Question Variations</h3>
                            <span className="ml-auto text-xs text-slate-400">{form.variations.length} added</span>
                        </div>

                        {/* Bubble stack */}
                        <div className="space-y-3 mb-4 min-h-[60px]">
                            {form.intent && (
                                <QuestionBubble text={form.intent} onRemove={() => { }} index={0} />
                            )}
                            {form.variations.map((v, i) => (
                                <QuestionBubble key={i} text={v} onRemove={() => removeVariation(i)} index={i + 1} />
                            ))}
                            {!form.intent && form.variations.length === 0 && (
                                <p className="text-xs text-slate-400 italic text-center py-4">
                                    Enter a primary question above to see it appear here as a chat bubble
                                </p>
                            )}
                        </div>

                        {/* Add variation input */}
                        <div className="flex gap-2">
                            <input
                                ref={variationRef}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-slate-400 transition-all"
                                placeholder="e.g. What is MCA?"
                                value={variationInput}
                                onChange={e => setVariationInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariation())}
                            />
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm whitespace-nowrap"
                                onClick={addVariation}
                            >+ Add</button>
                        </div>
                    </div>

                    {/* Advanced settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">⚙️</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Advanced Settings</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Match Mode */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Match Mode</label>
                                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                                    {(['contains', 'exact'] as MatchMode[]).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => update({ matchMode: m })}
                                            className={`flex-1 py-2 text-xs font-medium capitalize transition-all
                        ${form.matchMode === m
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                        >{m}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    Priority
                                    <span className="ml-2 text-indigo-600 font-bold">({form.priority})</span>
                                </label>
                                <input
                                    type="range" min={1} max={10} step={1}
                                    value={form.priority}
                                    onChange={e => update({ priority: Number(e.target.value) })}
                                    className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-slate-200 to-indigo-400 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                                    <span>Low</span><span>High</span>
                                </div>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
                            <select
                                value={form.department}
                                onChange={e => update({ department: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                            >
                                {['General', 'MCA', 'MBA', 'MCOM', 'BCA', 'BBA'].map(d => (
                                    <option key={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Keywords */}
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                Keywords
                                <span className="ml-2 text-slate-400 font-normal">(auto-generated · editable)</span>
                            </label>
                            <div className="flex flex-wrap gap-1.5 p-3 min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 mb-2">
                                {form.keywords.map(k => (
                                    <KeywordTag key={k} kw={k} onRemove={() => removeKeyword(k)} />
                                ))}
                                {form.keywords.length === 0 && (
                                    <span className="text-xs text-slate-400 italic">Keywords auto-generate from the question</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 placeholder-slate-400"
                                    placeholder="Add custom keyword…"
                                    value={keywordInput}
                                    onChange={e => setKeywordInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                />
                                <button
                                    onClick={addKeyword}
                                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                >Add</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ════ RIGHT PANEL — Action Configuration ════ */}
                <div className="flex flex-col gap-4">
                    {/* Action type selector */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🎯</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Assistant Action</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {[
                                { type: 'text' as ActionType, icon: '📝', label: 'Text Response', desc: 'Reply with a message' },
                                { type: 'redirect' as ActionType, icon: '🔗', label: 'Redirect to Page', desc: 'Navigate to a route' },
                            ].map(({ type, icon, label, desc }) => (
                                <button
                                    key={type}
                                    onClick={() => update({ actionType: type })}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center
                    ${form.actionType === type
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                                >
                                    <span className="text-2xl">{icon}</span>
                                    <div>
                                        <div className={`font-semibold text-sm ${form.actionType === type ? 'text-indigo-700' : 'text-slate-700'}`}>{label}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                                    </div>
                                    {form.actionType === type && (
                                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Text Response */}
                        {form.actionType === 'text' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-medium text-slate-600 mb-2">Assistant Reply Message</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none placeholder-slate-400 leading-relaxed"
                                    rows={5}
                                    placeholder="Type how the assistant should respond…&#10;&#10;e.g. MCA (Master of Computer Applications) is a 2-year postgraduate program offered at Seshadripuram College…"
                                    value={form.message}
                                    onChange={e => update({ message: e.target.value })}
                                />
                                {form.message && (
                                    <div className="flex justify-end mt-1">
                                        <span className="text-xs text-slate-400">{form.message.length} chars</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Redirect */}
                        {form.actionType === 'redirect' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-medium text-slate-600 mb-2">Internal Page</label>
                                <div className="grid gap-2">
                                    {INTERNAL_ROUTES.map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => update({ redirectUrl: r.value })}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all
                        ${form.redirectUrl === r.value
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300'}`}
                                        >
                                            <span>{r.label}</span>
                                            <span className="text-xs opacity-60 font-mono">{r.value}</span>
                                            {form.redirectUrl === r.value && <span className="text-indigo-500">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Live Preview ─────────────────────────────────────────────── */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            </div>
                            <span className="text-slate-400 text-xs font-medium ml-1">Live Preview</span>
                        </div>

                        <div className="space-y-3">
                            {/* User bubble */}
                            <div className="flex justify-end">
                                <div className="max-w-[80%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow">
                                    {previewQuestion}
                                </div>
                            </div>

                            {/* Assistant bubble */}
                            <div className="flex items-start gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow flex-shrink-0">L</div>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm shadow
                  ${form.actionType === 'redirect'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white text-slate-800'}`}>
                                    {previewAnswer}
                                    {form.actionType === 'redirect' && form.redirectUrl && (
                                        <div className="mt-1 text-xs opacity-80 font-mono">→ {form.redirectUrl}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Test Simulator ────────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🧪</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Test Before Save</h3>
                        </div>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-slate-400 transition-all"
                                placeholder="Type a user question to test current knowledge…"
                                value={testInput}
                                onChange={e => setTestInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleTest()}
                            />
                            <button
                                onClick={handleTest}
                                disabled={testRunning || !testInput}
                                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-all"
                            >{testRunning ? '…' : 'Test'}</button>
                        </div>
                        {testResult !== null && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 animate-in fade-in duration-200">
                                <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1 block">Current Response</span>
                                {testResult}
                            </div>
                        )}
                    </div>

                    {/* ── Save Section ──────────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        {error && (
                            <div className="mb-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in duration-200">
                                <span className="text-base">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="mb-3 flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-in fade-in duration-200">
                                <span className="text-base">🎉</span>
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-200 hover:shadow-xl disabled:opacity-50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading
                                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Saving Training Entry…</span>
                                : '🚀 Save Training Entry'}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-2">
                            The assistant will immediately learn this after saving
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
