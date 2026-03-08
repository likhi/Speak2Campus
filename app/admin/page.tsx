'use client'

import React, { useState, useEffect, useRef } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addLocation, addEvent } from '@/lib/db-client'
import { GalleryManager } from '@/components/admin/gallery-manager'
import { VirtualTourManager } from '@/components/admin/virtual-tour-manager'
import { LiraAdminPanel } from '@/components/admin/lira-admin-panel'
import LocationsList from '@/components/admin/locations-list'
import FacultyList from '@/components/admin/faculty-list'
import EventsList from '@/components/admin/events-list'
import FacultyForm from '@/components/admin/faculty-form'
import AnnouncementsManager from '@/components/admin/announcements-manager'

// ─── Timetable Photo Upload Manager ──────────────────────────────────────────
const DEPTS = ['MCA', 'MBA', 'MCOM'] as const
const YEARS = ['1st Year', '2nd Year'] as const
type Dept = typeof DEPTS[number]
type Year = typeof YEARS[number]

interface TimetablePhoto { department: string; year: string; file_path: string; uploaded_at: string }

function DeptYearUploadCard({ dept, year }: { dept: Dept; year: Year }) {
  const [photo, setPhoto] = useState<TimetablePhoto | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/timetable-photo?department=${encodeURIComponent(dept)}&year=${encodeURIComponent(year)}`)
      .then(r => r.json())
      .then(d => setPhoto(d || null))
      .catch(() => { })
  }, [])

  const upload = async (file: File) => {
    setUploading(true); setMsg('')
    const fd = new FormData()
    fd.append('department', dept)
    fd.append('year', year)
    fd.append('file', file)
    try {
      const r = await fetch('/api/timetable-photo', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Upload failed')
      setPhoto({ department: dept, year, file_path: d.file_path, uploaded_at: new Date().toISOString() })
      setMsg('✅ Uploaded successfully!')
    } catch (e: any) {
      setMsg('❌ ' + e.message)
    } finally {
      setUploading(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) upload(e.target.files[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    if (e.dataTransfer.files?.[0]) upload(e.dataTransfer.files[0])
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${dept} ${year} timetable photo?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/timetable-photo?department=${encodeURIComponent(dept)}&year=${encodeURIComponent(year)}`, { method: 'DELETE' })
      setPhoto(null); setMsg('🗑️ Deleted.')
    } catch { setMsg('❌ Delete failed') }
    finally { setDeleting(false); setTimeout(() => setMsg(''), 3000) }
  }

  const DEPT_COLORS: Record<string, string> = {
    MCA: 'from-indigo-500 to-purple-600',
    MBA: 'from-orange-500 to-rose-500',
    MCOM: 'from-emerald-500 to-teal-600',
  }
  const DEPT_ICONS: Record<string, string> = { MCA: '💻', MBA: '📊', MCOM: '📒' }
  const yearColor = year === '1st Year' ? 'ring-2 ring-blue-300' : 'ring-2 ring-green-300'
  const headerGrad = DEPT_COLORS[dept] || 'from-slate-500 to-slate-700'

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${headerGrad} px-5 py-3 flex items-center gap-3`}>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
          {DEPT_ICONS[dept]}
        </div>
        <div>
          <h3 className="text-white font-bold text-sm leading-tight">{dept} — {year}</h3>
          <p className="text-white/70 text-xs">{photo ? 'Uploaded · hover to replace/delete' : 'No photo yet'}</p>
        </div>
        {photo && (
          <span className="ml-auto text-xs bg-white/20 text-white rounded-full px-2.5 py-0.5 font-medium">✓ Active</span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Preview */}
        {photo ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
            <img
              src={photo.file_path}
              alt={`${year} Timetable`}
              className="w-full max-h-[340px] object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 bg-white text-slate-800 rounded-xl text-sm font-semibold shadow hover:bg-slate-100 transition"
              >🔄 Replace</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold shadow hover:bg-red-700 transition disabled:opacity-50"
              >{deleting ? 'Deleting…' : '🗑️ Delete'}</button>
            </div>
          </div>
        ) : (
          /* Drop zone */
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-all
              ${isDragOver
                ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
          >
            <span className="text-4xl">{uploading ? '⏳' : '📤'}</span>
            <div className="text-center">
              <p className="font-semibold text-slate-700 text-sm">
                {uploading ? 'Uploading…' : 'Drop photo here or click to browse'}
              </p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · max 10 MB</p>
            </div>
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />

        {/* Status message */}
        {msg && (
          <div className={`text-sm rounded-xl px-4 py-2.5 font-medium ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : msg.startsWith('🗑️') ? 'bg-slate-50 text-slate-600 border border-slate-200'
              : 'bg-red-50 text-red-700 border border-red-200'
            }`}>{msg}</div>
        )}

        {/* Upload button (visible when no photo) */}
        {!photo && !uploading && (
          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${headerGrad} text-white font-semibold text-sm shadow hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]`}
          >
            📤 Upload {dept} {year} Timetable
          </button>
        )}
      </div>
    </div>
  )
}

function TimetablePhotoManager() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-5 flex items-center gap-4">
        <span className="text-3xl">🗓️</span>
        <div>
          <h2 className="text-white font-bold text-lg">Timetable Photo Manager</h2>
          <p className="text-slate-400 text-xs">Upload 1 photo per department per year. Students see them via the assistant.</p>
        </div>
      </div>
      {DEPTS.map(dept => (
        <div key={dept}>
          <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-5 rounded bg-primary"></span>
            {dept} Department
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {YEARS.map(y => <DeptYearUploadCard key={y} dept={dept} year={y} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('locations')
  const [loading, setLoading] = useState(false)

  // Refresh keys — increment to trigger list re-fetch after an add
  const [locationsKey, setLocationsKey] = useState(0)
  const [facultyKey, setFacultyKey] = useState(0)
  const [eventsKey, setEventsKey] = useState(0)
  const [announcementsKey, setAnnouncementsKey] = useState(0)

  // Location form state
  const [locationForm, setLocationForm] = useState({
    name: '',
    floor: '',
    building: '',
    description: '',
  })


  // Event form state
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    event_time: '',
    description: '',
    venue: '',
  })



  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addLocation(locationForm)
      alert('Location added successfully!')
      setLocationForm({ name: '', floor: '', building: '', description: '' })
      setLocationsKey(k => k + 1)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add location'
      alert(`Error: ${errorMsg}`)
      console.error('[v0] Location error:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addEvent(eventForm)
      alert('Event added successfully!')
      setEventForm({ name: '', date: '', event_time: '', description: '', venue: '' })
      setEventsKey(k => k + 1)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add event'
      alert(`Error: ${errorMsg}`)
      console.error('[v0] Event error:', error)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage Seshadripuram College Data</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="announcements">📢 Notices</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="tour">Tour</TabsTrigger>
            <TabsTrigger value="lira" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white data-[state=active]:text-white data-[state=active]:from-indigo-600 data-[state=active]:to-purple-700 rounded-sm font-semibold">
              ⚡ Lira AI
            </TabsTrigger>
          </TabsList>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Add Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Location</CardTitle>
                  <CardDescription>Add a new location to the campus</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddLocation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location Name</label>
                      <Input
                        placeholder="e.g., MCA Lab 1"
                        value={locationForm.name}
                        onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Floor</label>
                        <Input
                          placeholder="e.g., 2nd Floor"
                          value={locationForm.floor}
                          onChange={(e) => setLocationForm({ ...locationForm, floor: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Building</label>
                        <Input
                          placeholder="e.g., Tech Block"
                          value={locationForm.building}
                          onChange={(e) => setLocationForm({ ...locationForm, building: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        placeholder="Description of the location"
                        value={locationForm.description}
                        onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Adding...' : 'Add Location'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              {/* Right: Live List */}
              <LocationsList key={locationsKey} />
            </div>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Add Form */}
              <FacultyForm onDataAdded={() => setFacultyKey(k => k + 1)} />
              {/* Right: Live List */}
              <FacultyList key={facultyKey} />
            </div>
          </TabsContent>

          {/* Timetable Tab */}
          <TabsContent value="timetable">
            <TimetablePhotoManager />
          </TabsContent>


          {/* Events Tab */}
          <TabsContent value="events">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Add Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Event</CardTitle>
                  <CardDescription>Add an upcoming college event</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Name</label>
                      <Input
                        placeholder="e.g., Annual Symposium"
                        value={eventForm.name}
                        onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <Input
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Time <span className="text-muted-foreground text-xs">(optional)</span></label>
                        <Input
                          type="time"
                          value={eventForm.event_time}
                          onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                          placeholder="e.g. 10:00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Venue</label>
                        <Input
                          placeholder="Location"
                          value={eventForm.venue}
                          onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        placeholder="Event description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Adding...' : 'Add Event'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              {/* Right: Live List */}
              <EventsList key={eventsKey} />
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <AnnouncementsManager key={announcementsKey} />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Manage Gallery</CardTitle>
                <CardDescription>Upload and manage campus images</CardDescription>
              </CardHeader>
              <CardContent>
                <GalleryManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Virtual Tour Tab */}
          <TabsContent value="tour">
            <Card>
              <CardHeader>
                <CardTitle>Manage Virtual Tour</CardTitle>
                <CardDescription>Upload and manage campus virtual tour video</CardDescription>
              </CardHeader>
              <CardContent>
                <VirtualTourManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lira AI Tab */}
          <TabsContent value="lira">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lira AI Voice Assistant</CardTitle>
                <CardDescription>Configure intents, view interaction logs, and monitor assistant analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <LiraAdminPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
