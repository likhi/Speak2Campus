'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  onSaved: () => void
  editItem?: any
  onCancel?: () => void
}

export default function KnowledgeForm({ onSaved, editItem, onCancel }: Props) {

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [keywords, setKeywords] = useState('')
  const [department, setDepartment] = useState('General')
  const [responseType, setResponseType] = useState('text')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Unique IDs for accessibility
  const reactId = React.useId();
  const questionId = `question-${reactId}`;
  const answerId = `answer-${reactId}`;
  const keywordsId = `keywords-${reactId}`;
  const departmentId = `department-${reactId}`;
  const responseTypeId = `responseType-${reactId}`;
  const redirectUrlId = `redirectUrl-${reactId}`;

  useEffect(() => {
    if (editItem) {
      setQuestion(editItem.question || '')
      setAnswer(editItem.answer || '')
      setKeywords(editItem.keywords || '')
      setDepartment(editItem.department || 'General')
      setResponseType(editItem.response_type || 'text')
      setRedirectUrl(editItem.redirect_url || '')
    }
  }, [editItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!question.trim()) {
      setError('Question is required')
      return
    }
    if (!keywords.trim()) {
      setError('Provide at least one keyword')
      return
    }

    if (responseType === 'text') {
      if (!answer.trim()) {
        setError('Answer is required for text response')
        return
      }
    } else if (responseType === 'redirect') {
      if (!redirectUrl.trim()) {
        setError('Redirect URL is required')
        return
      }
      // Validate redirect URL format
      if (!redirectUrl.startsWith('/') && !redirectUrl.includes('://')) {
        setError('Redirect URL must be an internal route (start with /) or a valid URL')
        return
      }
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const payload = {
        question: question.trim(),
        answer: responseType === 'text' ? answer.trim() : '',
        keywords: keywords.trim(),
        department,
        response_type: responseType,
        redirect_url: responseType === 'redirect' ? redirectUrl.trim() : ''
      }

      let res
      if (editItem && editItem.id) {
        res = await fetch(`/api/knowledge/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch('/api/knowledge/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      setSuccess('Saved successfully')
      setQuestion('')
      setAnswer('')
      setKeywords('')
      setDepartment('General')
      setResponseType('text')
      setRedirectUrl('')
      onSaved()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{editItem ? 'Edit Entry' : 'Add Knowledge'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">

        <div>
          <Label htmlFor={questionId}>Question</Label>
          <Input id={questionId} value={question} onChange={(e) => setQuestion(e.target.value)} required className="mt-1" />
        </div>

        <div>
          <Label htmlFor={keywordsId}>Keywords (comma separated)</Label>
          <Input id={keywordsId} value={keywords} onChange={(e) => setKeywords(e.target.value)} required className="mt-1" />
        </div>

        <div>
          <Label htmlFor={departmentId}>Department</Label>
          <select id={departmentId} value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background">
            <option value="General">General</option>
            <option value="MCA">MCA</option>
            <option value="MBA">MBA</option>
            <option value="MCOM">MCOM</option>
          </select>
        </div>

        <div>
          <Label htmlFor={responseTypeId}>Response Type</Label>
          <select id={responseTypeId} value={responseType} onChange={(e) => setResponseType(e.target.value)} className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background">
            <option value="text">Text Response</option>
            <option value="redirect">Redirect to Page</option>
          </select>
        </div>

        {responseType === 'text' && (
          <div>
            <Label htmlFor={answerId}>Answer</Label>
            <Textarea id={answerId} value={answer} onChange={(e) => setAnswer(e.target.value)} required className="mt-1" />
          </div>
        )}

        {responseType === 'redirect' && (
          <div>
            <Label htmlFor={redirectUrlId}>Redirect URL (e.g., /faculty?dept=MCA)</Label>
            <Input id={redirectUrlId} value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} required className="mt-1" placeholder="/faculty" />
          </div>
        )}

        {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-2 rounded">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-600 text-sm p-2 rounded">{success}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Card>
  )
}
