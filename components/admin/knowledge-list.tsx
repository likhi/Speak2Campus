'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import KnowledgeForm from './knowledge-form'
import { Trash2, Edit2 } from 'lucide-react'

export default function KnowledgeList() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [editing, setEditing] = useState<any | null>(null)

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/knowledge')
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching knowledge entries', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      fetchEntries()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const filtered = entries.filter(e => {
    if (departmentFilter !== 'All' && (e.department || 'General') !== departmentFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (e.question || '').toLowerCase().includes(q) || (e.keywords || '').toLowerCase().includes(q) || (e.answer || '').toLowerCase().includes(q) || (e.redirect_url || '').toLowerCase().includes(q)
  })

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Train Assistant</h3>
        <div className="flex gap-2">
          <Label className="hidden md:block">Department</Label>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-2 py-1 border rounded-md bg-background">
            <option value="All">All</option>
            <option value="General">General</option>
            <option value="MCA">MCA</option>
            <option value="MBA">MBA</option>
            <option value="MCOM">MCOM</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Input placeholder="Search question, answer, keywords or URL" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <KnowledgeForm onSaved={fetchEntries} editItem={editing} onCancel={() => setEditing(null)} />
        </div>

        <div>
          {loading ? <div>Loading...</div> : (
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-muted-foreground">No entries found</div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2">Question</th>
                        <th className="py-2">Keywords</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Dept</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(e => (
                        <tr key={e.id} className="border-t">
                          <td className="py-2 align-top max-w-xs truncate">{e.question}</td>
                          <td className="py-2 align-top text-xs">{e.keywords?.split(',').slice(0, 2).join(', ')}</td>
                          <td className="py-2 align-top">
                            <span className={`px-2 py-1 text-xs rounded ${e.response_type === 'redirect' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {e.response_type === 'redirect' ? '🔗 Redirect' : '📝 Text'}
                            </span>
                          </td>
                          <td className="py-2 align-top">{e.department || 'General'}</td>
                          <td className="py-2 align-top">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditing(e)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
