'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Pencil, X, Check, Loader2 } from 'lucide-react';

interface Faculty {
  id: number;
  name: string;
  designation: string;
  department: string;
  department_id?: number;
  specialization: string;
  experience: string;
  email: string;
  cabin: string;
  profile_photo?: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface EditState {
  name: string;
  designation: string;
  department_id: string;
  specialization: string;
  experience: string;
  email: string;
  cabin: string;
}

export default function FacultyList() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/faculty');
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const response = await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        setFaculty(prev => prev.filter(f => f.id !== id));
      } else {
        alert(`Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ── Start editing ─────────────────────────────────────────────────────────
  const startEdit = (f: Faculty) => {
    setEditingId(f.id);
    setSaveError('');
    setEditState({
      name: f.name,
      designation: f.designation,
      department_id: String(f.department_id ?? ''),
      specialization: f.specialization ?? '',
      experience: f.experience ?? '',
      email: f.email ?? '',
      cabin: f.cabin ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
    setSaveError('');
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const saveEdit = async (id: number) => {
    if (!editState) return;
    setSaving(true);
    setSaveError('');
    try {
      const response = await fetch(`/api/faculty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editState.name,
          designation: editState.designation,
          department_id: editState.department_id || undefined,
          specialization: editState.specialization,
          experience: editState.experience,
          email: editState.email,
          cabin: editState.cabin,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update');

      // Resolve department name from local departments list for immediate UI update
      const dept = departments.find(d => String(d.id) === editState.department_id);

      // Update local state so UI reflects changes immediately
      setFaculty(prev => prev.map(f => {
        if (f.id !== id) return f;
        return {
          ...f,
          name: editState.name,
          designation: editState.designation,
          department: dept?.name ?? f.department,
          department_id: dept ? Number(dept.id) : f.department_id,
          specialization: editState.specialization,
          experience: editState.experience,
          email: editState.email,
          cabin: editState.cabin,
        };
      }));
      cancelEdit();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card className="p-6">Loading faculty...</Card>;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Faculty Members</h2>
      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
        {faculty.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No faculty members added yet</p>
        ) : (
          faculty.map(f =>
            editingId === f.id && editState ? (
              /* ── Edit Mode ─────────────────────────────────────────── */
              <div
                key={f.id}
                className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-300 dark:border-blue-700 space-y-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    ✏️ Editing: {f.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 px-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={editState.name}
                      onChange={e => setEditState(s => s && { ...s, name: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Designation</Label>
                    <Input
                      value={editState.designation}
                      onChange={e => setEditState(s => s && { ...s, designation: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Department</Label>
                    <select
                      value={editState.department_id}
                      onChange={e => setEditState(s => s && { ...s, department_id: e.target.value })}
                      className="w-full mt-1 h-8 text-sm px-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Select department</option>
                      {departments.map(d => (
                        <option key={d.id} value={String(d.id)}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Specialization</Label>
                    <Input
                      value={editState.specialization}
                      onChange={e => setEditState(s => s && { ...s, specialization: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Experience</Label>
                    <Input
                      value={editState.experience}
                      onChange={e => setEditState(s => s && { ...s, experience: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={editState.email}
                      onChange={e => setEditState(s => s && { ...s, email: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cabin / Office</Label>
                    <Input
                      value={editState.cabin}
                      onChange={e => setEditState(s => s && { ...s, cabin: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>

                {saveError && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1">{saveError}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => saveEdit(f.id)}
                    disabled={saving}
                    className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ── View Mode ─────────────────────────────────────────── */
              <div
                key={f.id}
                className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {f.profile_photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.profile_photo}
                        alt={f.name}
                        className="w-[56px] h-[56px] rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {f.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{f.name}</h3>
                    <p className="text-xs text-muted-foreground">{f.designation} • {f.department}</p>
                    {f.specialization && <p className="text-xs text-muted-foreground truncate">{f.specialization}</p>}
                    {f.experience && <p className="text-xs text-muted-foreground">Exp: {f.experience}</p>}
                    {f.email && <p className="text-xs text-muted-foreground">{f.email}</p>}
                    {f.cabin && <p className="text-xs text-muted-foreground">Cabin: {f.cabin}</p>}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 ml-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(f)}
                    title="Edit faculty"
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(f.id)}
                    title="Delete faculty"
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </Card>
  );
}
