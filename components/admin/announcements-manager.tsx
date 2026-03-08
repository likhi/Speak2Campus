'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Bell, BellOff, Plus, Megaphone, CalendarDays, AlertTriangle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'high' | 'medium' | 'low'

interface Announcement {
    id: number
    title: string
    content: string
    announcement_date: string
    priority: Priority
    active_status: number
    created_at: string
}

// ─── Priority config ──────────────────────────────────────────────────────────

const P_CONFIG: Record<Priority, { label: string; emoji: string; badge: string; dot: string }> = {
    high: { label: 'High', emoji: '🔴', badge: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500' },
    medium: { label: 'Medium', emoji: '🟡', badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-500' },
    low: { label: 'Low', emoji: '🟢', badge: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500' },
}

// ─── Helper — client local date "YYYY-MM-DD" ──────────────────────────────────
function todayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Add Announcement Form ────────────────────────────────────────────────────

function AddAnnouncementForm({ onAdded }: { onAdded: () => void }) {
    const [form, setForm] = useState({
        title: '',
        content: '',
        announcement_date: todayStr(),
        priority: 'medium' as Priority,
        active_status: true,
    })
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState('')

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setMsg('')
        try {
            const r = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, active_status: form.active_status ? 1 : 0 }),
            })
            const data = await r.json()
            if (!r.ok) throw new Error(data.error || 'Failed to add')
            setMsg('✅ Announcement added successfully!')
            setForm({ title: '', content: '', announcement_date: todayStr(), priority: 'medium', active_status: true })
            onAdded()
            setTimeout(() => setMsg(''), 3500)
        } catch (err: any) {
            setMsg('❌ ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Card className="overflow-hidden">
            {/* Colourful header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-white font-bold text-base leading-tight">Add Announcement</h2>
                    <p className="text-white/60 text-xs">Publish an announcement visible to Lira</p>
                </div>
            </div>

            <CardContent className="pt-5 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Title <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="e.g., Internal exams start from Monday"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Message / Details</label>
                        <Textarea
                            placeholder="Optional — extra details for the announcement"
                            value={form.content}
                            onChange={e => set('content', e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Date + Priority row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                <CalendarDays className="inline w-3.5 h-3.5 mr-1 opacity-60" />
                                Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                value={form.announcement_date}
                                onChange={e => set('announcement_date', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                <AlertTriangle className="inline w-3.5 h-3.5 mr-1 opacity-60" />
                                Priority
                            </label>
                            <select
                                value={form.priority}
                                onChange={e => set('priority', e.target.value as Priority)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="high">🔴 High</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="low">🟢 Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Active status toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-muted/30">
                        <div>
                            <p className="text-sm font-medium">Active / Publish Now</p>
                            <p className="text-xs text-muted-foreground">Inactive announcements are stored but not shown by Lira</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set('active_status', !form.active_status)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${form.active_status ? 'bg-violet-600' : 'bg-gray-300'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.active_status ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>

                    {/* Feedback */}
                    {msg && (
                        <div className={`text-sm rounded-xl px-4 py-2.5 font-medium ${msg.startsWith('✅')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {msg}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={busy}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3"
                    >
                        {busy ? 'Publishing…' : <><Plus className="w-4 h-4 mr-1.5" />Publish Announcement</>}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({
    item,
    onToggle,
    onDelete,
}: {
    item: Announcement
    onToggle: (id: number, newStatus: number) => void
    onDelete: (id: number) => void
}) {
    const pCfg = P_CONFIG[item.priority] ?? P_CONFIG.medium
    const isActive = item.active_status === 1
    const isToday = item.announcement_date === todayStr()

    return (
        <div className={`relative rounded-xl border p-4 transition-all duration-200 ${isActive ? 'bg-white shadow-sm' : 'bg-muted/30 opacity-70'} ${isToday ? 'border-violet-300 ring-1 ring-violet-200' : 'border-border'}`}>
            {/* Today badge */}
            {isToday && (
                <span className="absolute top-3 right-12 text-[10px] font-bold tracking-wide bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">
                    TODAY
                </span>
            )}

            <div className="flex items-start gap-3">
                {/* Priority dot */}
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${pCfg.dot}`} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground truncate">{item.title}</h3>
                        <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${pCfg.badge}`}>
                            {pCfg.emoji} {pCfg.label}
                        </span>
                    </div>

                    {item.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                    )}

                    <p className="text-[11px] text-muted-foreground mt-1.5">
                        📅 {item.announcement_date} &nbsp;·&nbsp;
                        <span className={isActive ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                            {isActive ? '● Active' : '○ Inactive'}
                        </span>
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-1 flex-shrink-0">
                    <button
                        title={isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => onToggle(item.id, isActive ? 0 : 1)}
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        {isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                        title="Delete"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Announcements Manager ───────────────────────────────────────────────

export default function AnnouncementsManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [filterDate, setFilterDate] = useState('')
    const [key, setKey] = useState(0)

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true)
        try {
            const url = filterDate ? `/api/announcements?date=${filterDate}` : '/api/announcements'
            const r = await fetch(url)
            if (r.ok) setAnnouncements(await r.json())
        } catch { /* silent */ }
        finally { setLoading(false) }
    }, [filterDate])

    useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements, key])

    const handleToggle = async (id: number, newStatus: number) => {
        try {
            await fetch(`/api/announcements?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active_status: newStatus }),
            })
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active_status: newStatus } : a))
        } catch { /* silent */ }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this announcement?')) return
        try {
            await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
            setAnnouncements(prev => prev.filter(a => a.id !== id))
        } catch { /* silent */ }
    }

    const todayCount = announcements.filter(a => a.announcement_date === todayStr() && a.active_status === 1).length

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* ── Left: Add Form ── */}
            <AddAnnouncementForm onAdded={() => setKey(k => k + 1)} />

            {/* ── Right: List ── */}
            <Card className="overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center gap-3">
                    <Bell className="w-5 h-5 text-violet-300" />
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-base leading-tight">All Announcements</h2>
                        <p className="text-slate-400 text-xs">{todayCount} active today</p>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-muted/20">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Filter by date:</label>
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="h-8 text-xs"
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="p-5 space-y-3 max-h-[560px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Loading…
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12">
                            <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No announcements yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Add one using the form on the left</p>
                        </div>
                    ) : (
                        announcements.map(item => (
                            <AnnouncementCard
                                key={item.id}
                                item={item}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
