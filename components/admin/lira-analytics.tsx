'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, MessageSquare, CheckCircle2, XCircle, TrendingUp, Zap, Target } from 'lucide-react'

interface Stats {
    totalQueries: number
    matchedQueries: number
    unmatchedQueries: number
    matchRate: number
    avgConfidence: number
    topIntents: { intent_name: string; count: number }[]
    queriesByHour: { hour: string; count: number }[]
    queriesByDay: { day: string; count: number }[]
    topUnmatched: { query: string; count: number }[]
    recentActivity: { query: string; confidence: number; created_at: string; session_id: string }[]
}

function StatCard({
    icon: Icon, label, value, sub, color
}: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold leading-tight">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function MiniBar({ label, count, max }: { label: string; count: number; max: number }) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-32 truncate" title={label}>{label}</span>
            <div className="flex-1 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium w-6 text-right">{count}</span>
        </div>
    )
}

function HourChart({ data }: { data: { hour: string; count: number }[] }) {
    if (!data || data.length === 0) return (
        <p className="text-xs text-muted-foreground text-center py-4">No data yet for the last 24 hours.</p>
    )
    const max = Math.max(...data.map(d => d.count), 1)
    return (
        <div className="flex items-end gap-1 h-24 pt-2">
            {Array.from({ length: 24 }, (_, i) => {
                const h = String(i).padStart(2, '0')
                const entry = data.find(d => d.hour === h)
                const count = entry?.count || 0
                const pct = (count / max) * 100
                return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                            className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                            style={{ height: `${Math.max(pct, count > 0 ? 8 : 1)}%` }}
                        />
                        {count > 0 && (
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-foreground text-background px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {h}:00 — {count}
                            </span>
                        )}
                    </div>
                )
            })}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] text-muted-foreground pointer-events-none">
                <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
        </div>
    )
}

export function LiraAnalytics() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            const r = await fetch('/api/lira/stats')
            const d = await r.json()
            if (d.success) setStats(d.stats)
        } catch { /* silent */ }
        setLoading(false)
    }, [])

    useEffect(() => { fetchStats() }, [fetchStats])

    if (loading) return <div className="text-center py-12 text-muted-foreground text-sm">Loading analytics...</div>
    if (!stats) return <div className="text-center py-12 text-muted-foreground text-sm">Failed to load analytics.</div>

    const topIntentMax = stats.topIntents.length > 0 ? Math.max(...stats.topIntents.map(i => i.count), 1) : 1
    const topUnmatchedMax = stats.topUnmatched.length > 0 ? Math.max(...stats.topUnmatched.map(u => u.count), 1) : 1

    const formatTime = (ts: string) => {
        try {
            return new Date(ts).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        } catch { return ts }
    }

    return (
        <div className="space-y-6">
            {/* Refresh */}
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchStats}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard icon={MessageSquare} label="Total Queries" value={stats.totalQueries} color="bg-blue-500" />
                <StatCard
                    icon={CheckCircle2} label="Matched"
                    value={stats.matchedQueries}
                    sub={`${stats.matchRate}% match rate`}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={XCircle} label="Unmatched"
                    value={stats.unmatchedQueries}
                    sub="need training"
                    color="bg-red-400"
                />
                <StatCard
                    icon={TrendingUp} label="Match Rate"
                    value={`${stats.matchRate}%`}
                    color="bg-indigo-500"
                />
                <StatCard
                    icon={Target} label="Avg Confidence"
                    value={`${stats.avgConfidence}%`}
                    color="bg-amber-500"
                />
                <StatCard
                    icon={Zap} label="Top Intents"
                    value={stats.topIntents.length}
                    sub="intent types matched"
                    color="bg-purple-500"
                />
            </div>

            {/* Two-column section */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Top Intents */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Top Matched Intents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {stats.topIntents.length === 0
                            ? <p className="text-xs text-muted-foreground">No matched intents yet.</p>
                            : stats.topIntents.map((item, i) => (
                                <MiniBar key={i} label={item.intent_name} count={item.count} max={topIntentMax} />
                            ))
                        }
                    </CardContent>
                </Card>

                {/* Top Unmatched */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Top Unmatched Queries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {stats.topUnmatched.length === 0
                            ? <p className="text-xs text-muted-foreground">No unmatched queries yet. Great coverage!</p>
                            : stats.topUnmatched.map((item, i) => (
                                <MiniBar key={i} label={item.query} count={item.count} max={topUnmatchedMax} />
                            ))
                        }
                    </CardContent>
                </Card>
            </div>

            {/* Hourly chart */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Activity — Last 24 Hours</CardTitle>
                </CardHeader>
                <CardContent className="relative pb-5">
                    <HourChart data={stats.queriesByHour} />
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.recentActivity.length === 0
                        ? <p className="text-xs text-muted-foreground">No recent activity.</p>
                        : <div className="space-y-2">
                            {stats.recentActivity.map((a, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-border last:border-0">
                                    <span className="text-muted-foreground w-4 text-xs">{i + 1}</span>
                                    <span className="flex-1 truncate">"{a.query}"</span>
                                    {a.confidence > 0 && (
                                        <span className="text-xs text-emerald-600 font-medium">{Math.round(a.confidence * 100)}%</span>
                                    )}
                                    <span className="text-xs text-muted-foreground shrink-0">{formatTime(a.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    }
                </CardContent>
            </Card>
        </div>
    )
}
