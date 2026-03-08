'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, RefreshCw, BookOpen, ExternalLink, MessageSquare, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface TrainingEntry {
    id: number
    intent: string
    question?: string
    variations: string
    action_type: string
    action_config: string
    keywords: string
    match_mode: string
    priority: number
    department: string
    created_at: string
}

function parseJson(str: string, fallback: any = {}) {
    try { return JSON.parse(str) } catch { return fallback }
}

function timeAgo(dateStr: string) {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export function TrainingHistory({ refreshTrigger }: { refreshTrigger?: number }) {
    const [entries, setEntries] = useState<TrainingEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [error, setError] = useState('')

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const r = await fetch('/api/knowledge/train')
            if (!r.ok) throw new Error('Failed to load')
            const data = await r.json()
            setEntries(Array.isArray(data) ? data : [])
        } catch (e: any) {
            setError(e.message || 'Could not load training history')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchEntries() }, [fetchEntries, refreshTrigger])

    const handleDelete = async (id: number, intent: string) => {
        if (!confirm(`Delete training entry:\n"${intent}"?\n\nLira will no longer respond to this.`)) return
        setDeletingId(id)
        try {
            const token = localStorage.getItem('adminToken') || ''
            const r = await fetch(`/api/knowledge/train?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.error || 'Delete failed')
            setEntries(prev => prev.filter(e => e.id !== id))
            if (expandedId === id) setExpandedId(null)
        } catch (e: any) {
            alert('❌ ' + (e.message || 'Delete failed'))
        } finally {
            setDeletingId(null)
        }
    }

    const filtered = entries.filter(e => {
        const s = search.toLowerCase()
        const intent = (e.intent || e.question || '').toLowerCase()
        const cfg = parseJson(e.action_config)
        const answer = (cfg.message || cfg.url || '').toLowerCase()
        return !s || intent.includes(s) || answer.includes(s) || (e.keywords || '').toLowerCase().includes(s)
    })

    // ── action badge styling
    const actionBadge = (type: string) => {
        if (type === 'redirect') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', label: '↗ Redirect' }
        return { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)', label: '💬 Text' }
    }

    return (
        <div style={styles.root}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.headerIcon}>
                        <BookOpen size={16} />
                    </div>
                    <div>
                        <h3 style={styles.headerTitle}>Training History</h3>
                        <p style={styles.headerSub}>
                            {loading ? 'Loading…' : `${entries.length} trained ${entries.length === 1 ? 'entry' : 'entries'}`}
                        </p>
                    </div>
                </div>
                <button style={styles.refreshBtn} onClick={fetchEntries} disabled={loading} title="Refresh">
                    <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </button>
            </div>

            {/* Search */}
            <div style={styles.searchWrap}>
                <Search size={14} style={styles.searchIcon} />
                <input
                    style={styles.searchInput}
                    placeholder="Search by trigger, response or keyword…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button style={styles.searchClear} onClick={() => setSearch('')}>✕</button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={styles.errorBox}>⚠️ {error}</div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div style={styles.listWrap}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ ...styles.skeletonRow, opacity: 1 - (i - 1) * 0.25 }} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div style={styles.empty}>
                    <div style={styles.emptyIcon}>🧠</div>
                    <p style={styles.emptyText}>
                        {search ? 'No entries match your search.' : 'No training data yet. Save your first entry above!'}
                    </p>
                </div>
            )}

            {/* Entry list */}
            {!loading && filtered.length > 0 && (
                <div style={styles.listWrap}>
                    {filtered.map((entry) => {
                        const intent = entry.intent || entry.question || '—'
                        const cfg = parseJson(entry.action_config)
                        const badge = actionBadge(entry.action_type)
                        const variations: string[] = parseJson(entry.variations, [])
                        const keywords = (entry.keywords || '').split(',').filter(Boolean)
                        const isExpanded = expandedId === entry.id
                        const isDeleting = deletingId === entry.id

                        return (
                            <div key={entry.id} style={styles.card}>
                                {/* Top row */}
                                <div style={styles.cardTop}>
                                    <div style={styles.cardMain}>
                                        {/* Action type badge */}
                                        <span style={{ ...styles.badge, background: badge.bg, color: badge.color, borderColor: badge.border }}>
                                            {badge.label}
                                        </span>

                                        {/* Intent / question */}
                                        <p style={styles.intentText}>{intent}</p>

                                        {/* Response preview */}
                                        <p style={styles.responseText}>
                                            {entry.action_type === 'redirect'
                                                ? `→ ${cfg.url || '/'}`
                                                : (cfg.message || '').slice(0, 100) + ((cfg.message || '').length > 100 ? '…' : '')
                                            }
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div style={styles.cardActions}>
                                        <span style={styles.timeAgo}>{timeAgo(entry.created_at)}</span>
                                        <button
                                            style={styles.expandBtn}
                                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                            title={isExpanded ? 'Collapse' : 'View details'}
                                        >
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <button
                                            style={{ ...styles.deleteBtn, opacity: isDeleting ? 0.5 : 1 }}
                                            onClick={() => handleDelete(entry.id, intent)}
                                            disabled={isDeleting}
                                            title="Delete this training entry"
                                        >
                                            {isDeleting ? '…' : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div style={styles.details}>
                                        <div style={styles.detailDivider} />

                                        {/* Full response */}
                                        <div style={styles.detailSection}>
                                            <span style={styles.detailLabel}>
                                                {entry.action_type === 'redirect' ? <ExternalLink size={12} /> : <MessageSquare size={12} />}
                                                {entry.action_type === 'redirect' ? 'Redirect URL' : 'Full Response'}
                                            </span>
                                            <p style={styles.detailValue}>
                                                {entry.action_type === 'redirect' ? cfg.url : cfg.message || '—'}
                                            </p>
                                        </div>

                                        {/* Variations */}
                                        {variations.length > 0 && (
                                            <div style={styles.detailSection}>
                                                <span style={styles.detailLabel}>📝 Variations ({variations.length})</span>
                                                <div style={styles.chipRow}>
                                                    {variations.map((v, i) => (
                                                        <span key={i} style={styles.varChip}>{v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Keywords + meta */}
                                        <div style={styles.metaRow}>
                                            <div style={styles.detailSection}>
                                                <span style={styles.detailLabel}>🏷 Keywords</span>
                                                <div style={styles.chipRow}>
                                                    {keywords.length > 0
                                                        ? keywords.map((k, i) => <span key={i} style={styles.kwChip}>#{k}</span>)
                                                        : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>none</span>
                                                    }
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>Department</span>
                                                    <span style={styles.metaVal}>{entry.department || 'General'}</span>
                                                </div>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>Match</span>
                                                    <span style={styles.metaVal}>{entry.match_mode || 'contains'}</span>
                                                </div>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>Priority</span>
                                                    <span style={styles.metaVal}>{entry.priority ?? 5}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            <style>{`
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>
        </div>
    )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    root: {
        background: 'linear-gradient(135deg, #0f0f1a 0%, #0d1035 100%)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        marginTop: 24,
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    headerIcon: {
        width: 34, height: 34, borderRadius: 10,
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
    },
    headerTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' },
    headerSub: { margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 },
    refreshBtn: {
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center',
    },
    searchWrap: {
        position: 'relative' as const,
        margin: '12px 16px',
        display: 'flex', alignItems: 'center',
    },
    searchIcon: { position: 'absolute' as const, left: 12, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' as const },
    searchInput: {
        width: '100%', padding: '9px 36px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 10, color: '#fff', fontSize: '0.82rem',
        outline: 'none',
    },
    searchClear: {
        position: 'absolute' as const, right: 10,
        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)',
        cursor: 'pointer', fontSize: '0.75rem',
    },
    errorBox: {
        margin: '0 16px 12px', padding: '10px 14px',
        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10, color: '#fca5a5', fontSize: '0.8rem',
    },
    listWrap: { padding: '0 16px 16px', display: 'flex', flexDirection: 'column' as const, gap: 10 },
    card: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
    },
    cardTop: {
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
    },
    cardMain: { flex: 1, minWidth: 0 },
    badge: {
        display: 'inline-block',
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        padding: '2px 8px', borderRadius: 20,
        border: '1px solid',
        marginBottom: 6,
    },
    intentText: {
        margin: '0 0 4px', fontSize: '0.88rem', fontWeight: 600, color: '#fff',
        whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
    },
    responseText: {
        margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
        whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
    },
    cardActions: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
    timeAgo: { fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' as const },
    expandBtn: {
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center',
    },
    deleteBtn: {
        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
        color: '#f87171', display: 'flex', alignItems: 'center',
        transition: 'all 0.2s',
    },
    details: { padding: '0 16px 14px' },
    detailDivider: { height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 },
    detailSection: { marginBottom: 10 },
    detailLabel: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' as const, marginBottom: 5,
    },
    detailValue: {
        margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)',
        lineHeight: 1.55,
        background: 'rgba(255,255,255,0.04)', borderRadius: 8,
        padding: '8px 12px',
    },
    chipRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
    varChip: {
        fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20,
        background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)',
        color: '#a5b4fc',
    },
    kwChip: {
        fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20,
        background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
        color: '#6ee7b7',
    },
    metaRow: { display: 'flex', gap: 20, flexWrap: 'wrap' as const, alignItems: 'flex-start', marginTop: 4 },
    metaItem: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
    metaLabel: { fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
    metaVal: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 },
    skeletonRow: {
        height: 72, borderRadius: 14,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
    },
    empty: { padding: '40px 20px', textAlign: 'center' as const },
    emptyIcon: { fontSize: '2.5rem', marginBottom: 12 },
    emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: 0 },
}
