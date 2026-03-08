'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown,
    ToggleLeft, ToggleRight, RefreshCw, Zap
} from 'lucide-react'

interface Intent {
    id: number
    intent_name: string
    variations: string
    keywords: string
    action_type: 'text' | 'redirect' | 'system'
    action_config: string
    priority: number
    is_active: number
    created_at: string
    updated_at: string
}

const ACTION_COLORS: Record<string, string> = {
    text: 'bg-blue-100 text-blue-800',
    redirect: 'bg-purple-100 text-purple-800',
    system: 'bg-orange-100 text-orange-800',
}

interface FormState {
    intent_name: string
    variations: string
    keywords: string
    action_type: 'text' | 'redirect' | 'system'
    action_config_message: string
    action_config_url: string
    action_config_action: string
    priority: number
}

const emptyForm: FormState = {
    intent_name: '',
    variations: '',
    keywords: '',
    action_type: 'text',
    action_config_message: '',
    action_config_url: '',
    action_config_action: '',
    priority: 0,
}

export function LiraIntentManager() {
    const [intents, setIntents] = useState<Intent[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<FormState>({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const fetchIntents = useCallback(async () => {
        setLoading(true)
        try {
            const r = await fetch('/api/lira/intents?limit=100')
            const d = await r.json()
            if (d.success) { setIntents(d.intents); setTotal(d.total) }
        } catch { /* silent */ }
        setLoading(false)
    }, [])

    useEffect(() => { fetchIntents() }, [fetchIntents])

    const buildActionConfig = (f: FormState) => {
        if (f.action_type === 'text') return { message: f.action_config_message }
        if (f.action_type === 'redirect') return { url: f.action_config_url, message: f.action_config_message || `Redirecting you to ${f.action_config_url}` }
        if (f.action_type === 'system') return { action: f.action_config_action, message: f.action_config_message }
        return {}
    }

    const openCreate = () => {
        setEditingId(null)
        setForm({ ...emptyForm })
        setError('')
        setShowForm(true)
    }

    const openEdit = (intent: Intent) => {
        let cfg: any = {}
        try { cfg = JSON.parse(intent.action_config) } catch { /* skip */ }
        let variations: string[] = []
        try { variations = JSON.parse(intent.variations) } catch { /* skip */ }
        setForm({
            intent_name: intent.intent_name,
            variations: variations.join(', '),
            keywords: intent.keywords,
            action_type: intent.action_type as 'text' | 'redirect' | 'system',
            action_config_message: cfg.message || '',
            action_config_url: cfg.url || '',
            action_config_action: cfg.action || '',
            priority: intent.priority,
        })
        setEditingId(intent.id)
        setError('')
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.intent_name.trim()) { setError('Intent name is required.'); return }
        setSaving(true); setError('')
        try {
            const variationsArr = form.variations.split(',').map(v => v.trim()).filter(Boolean)
            const payload = {
                intent_name: form.intent_name.trim(),
                variations: variationsArr,
                keywords: form.keywords,
                action_type: form.action_type,
                action_config: buildActionConfig(form),
                priority: parseInt(String(form.priority)) || 0,
            }
            const url = editingId ? `/api/lira/intents/${editingId}` : '/api/lira/intents'
            const method = editingId ? 'PATCH' : 'POST'
            const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const d = await r.json()
            if (d.success) {
                setShowForm(false)
                setEditingId(null)
                await fetchIntents()
            } else {
                setError(d.error || 'Failed to save.')
            }
        } catch { setError('Network error.') }
        setSaving(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this intent?')) return
        setDeletingId(id)
        try {
            await fetch(`/api/lira/intents/${id}`, { method: 'DELETE' })
            await fetchIntents()
        } catch { /* silent */ }
        setDeletingId(null)
    }

    const handleToggle = async (intent: Intent) => {
        try {
            await fetch(`/api/lira/intents/${intent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: intent.is_active ? 0 : 1 })
            })
            await fetchIntents()
        } catch { /* silent */ }
    }

    const f = form

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{total} intent{total !== 1 ? 's' : ''} configured</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchIntents}><RefreshCw className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> New Intent</Button>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <Card className="border-2 border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            {editingId ? 'Edit Intent' : 'Create New Intent'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium mb-1 block">Intent Name *</label>
                                <Input
                                    placeholder="e.g., greeting"
                                    value={f.intent_name}
                                    onChange={e => setForm(p => ({ ...p, intent_name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Priority (higher = checked first)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={f.priority}
                                    onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Variations (comma-separated phrases)</label>
                            <Input
                                placeholder="hi, hello, hey there, good morning"
                                value={f.variations}
                                onChange={e => setForm(p => ({ ...p, variations: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Keywords (comma-separated)</label>
                            <Input
                                placeholder="hi, hello, hey, morning"
                                value={f.keywords}
                                onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Action Type</label>
                            <select
                                value={f.action_type}
                                onChange={e => setForm(p => ({ ...p, action_type: e.target.value as any }))}
                                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                            >
                                <option value="text">text — Speak a text response</option>
                                <option value="redirect">redirect — Navigate to a page</option>
                                <option value="system">system — Execute system action</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">
                                {f.action_type === 'text' ? 'Response Message' :
                                    f.action_type === 'redirect' ? 'Spoken Message (before redirect)' :
                                        'Spoken Message (optional)'}
                            </label>
                            <Textarea
                                placeholder={
                                    f.action_type === 'text' ? 'What Lira will say...' :
                                        f.action_type === 'redirect' ? 'Redirecting you to the gallery.' :
                                            'Optional confirmation message...'
                                }
                                value={f.action_config_message}
                                onChange={e => setForm(p => ({ ...p, action_config_message: e.target.value }))}
                                rows={2}
                            />
                        </div>
                        {f.action_type === 'redirect' && (
                            <div>
                                <label className="text-xs font-medium mb-1 block">Redirect URL</label>
                                <Input
                                    placeholder="/gallery or https://..."
                                    value={f.action_config_url}
                                    onChange={e => setForm(p => ({ ...p, action_config_url: e.target.value }))}
                                />
                            </div>
                        )}
                        {f.action_type === 'system' && (
                            <div>
                                <label className="text-xs font-medium mb-1 block">System Action</label>
                                <Input
                                    placeholder="e.g., stop_tts"
                                    value={f.action_config_action}
                                    onChange={e => setForm(p => ({ ...p, action_config_action: e.target.value }))}
                                />
                            </div>
                        )}
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <div className="flex gap-2 pt-1">
                            <Button onClick={handleSave} disabled={saving} size="sm">
                                <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save Intent'}
                            </Button>
                            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }} size="sm">
                                <X className="w-4 h-4 mr-1" />Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Intents List */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading intents...</div>
            ) : intents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No intents yet. Create your first one!</div>
            ) : (
                <div className="space-y-2">
                    {intents.map(intent => {
                        let cfg: any = {}
                        try { cfg = JSON.parse(intent.action_config) } catch { /* skip */ }
                        let variations: string[] = []
                        try { variations = JSON.parse(intent.variations) } catch { /* skip */ }
                        return (
                            <Card key={intent.id} className={`transition-all ${!intent.is_active ? 'opacity-50' : ''}`}>
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-semibold text-sm">#{intent.id} {intent.intent_name}</span>
                                                <Badge variant="outline" className={`text-xs ${ACTION_COLORS[intent.action_type]}`}>
                                                    {intent.action_type}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">priority: {intent.priority}</span>
                                                {!intent.is_active && <Badge variant="outline" className="text-xs bg-gray-100">inactive</Badge>}
                                            </div>
                                            {variations.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {variations.slice(0, 4).map((v, i) => (
                                                        <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">"{v}"</span>
                                                    ))}
                                                    {variations.length > 4 && <span className="text-xs text-muted-foreground">+{variations.length - 4} more</span>}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground truncate">
                                                {intent.action_type === 'redirect' ? `→ ${cfg.url}` : cfg.message || cfg.action || ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost" size="sm"
                                                onClick={() => handleToggle(intent)}
                                                title={intent.is_active ? 'Deactivate' : 'Activate'}
                                                className="h-8 w-8 p-0"
                                            >
                                                {intent.is_active
                                                    ? <ToggleRight className="w-4 h-4 text-emerald-600" />
                                                    : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(intent)} className="h-8 w-8 p-0">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="sm"
                                                onClick={() => handleDelete(intent.id)}
                                                disabled={deletingId === intent.id}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
