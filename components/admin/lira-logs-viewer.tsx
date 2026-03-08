'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Search, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface LogEntry {
    id: number
    query: string
    matched_answer_id: number | null
    matched_intent_id: number | null
    intent_name: string | null
    confidence: number
    state: string
    response_text: string | null
    session_id: string | null
    created_at: string
}

export function LiraLogsViewer() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all')
    const [searchInput, setSearchInput] = useState('')
    const LIMIT = 20

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
                ...(search && { search }),
                ...(filter !== 'all' && { matched: filter === 'matched' ? 'true' : 'false' }),
            })
            const r = await fetch(`/api/lira/logs?${params}`)
            const d = await r.json()
            if (d.success) { setLogs(d.logs); setTotal(d.total) }
        } catch { /* silent */ }
        setLoading(false)
    }, [page, search, filter])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    const handleSearch = () => {
        setSearch(searchInput)
        setPage(1)
    }

    const isMatched = (log: LogEntry) =>
        log.matched_answer_id !== null || log.matched_intent_id !== null

    const totalPages = Math.ceil(total / LIMIT)

    const formatTime = (ts: string) => {
        try {
            return new Date(ts).toLocaleString('en-IN', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        } catch { return ts }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-1 gap-2">
                    <Input
                        placeholder="Search queries..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={handleSearch}>
                        <Search className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex gap-1">
                    {(['all', 'matched', 'unmatched'] as const).map(f => (
                        <Button
                            key={f}
                            size="sm"
                            variant={filter === f ? 'default' : 'outline'}
                            onClick={() => { setFilter(f); setPage(1) }}
                            className="capitalize text-xs"
                        >
                            {f}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="text-sm text-muted-foreground">{total} log{total !== 1 ? 's' : ''} found</div>

            {/* Log entries */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading logs...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    No logs yet. Interact with LIRA to generate logs.
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => (
                        <Card key={log.id} className="border border-border">
                            <CardContent className="py-3 px-4">
                                <div className="flex items-start gap-3">
                                    {/* Status icon */}
                                    <div className="mt-0.5 shrink-0">
                                        {isMatched(log)
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            : <XCircle className="w-4 h-4 text-red-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <span className="font-medium text-sm truncate max-w-xs">"{log.query}"</span>
                                            {log.intent_name && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                    {log.intent_name}
                                                </Badge>
                                            )}
                                            {log.confidence > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    {Math.round(log.confidence * 100)}% conf
                                                </span>
                                            )}
                                        </div>
                                        {log.response_text && (
                                            <p className="text-xs text-muted-foreground truncate mb-0.5 max-w-lg">
                                                ↳ {log.response_text}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(log.created_at)}
                                            {log.session_id && (
                                                <span className="font-mono opacity-50">
                                                    {log.session_id.slice(0, 12)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                        variant="outline" size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >← Prev</Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline" size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >Next →</Button>
                </div>
            )}
        </div>
    )
}
