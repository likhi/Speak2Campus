'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FacultyFormProps {
  onDataAdded: () => void;
}

interface Department {
  id: string;
  name: string;
}

export default function FacultyForm({ onDataAdded }: FacultyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department_id: '',
    specialization: '',
    experience: '',
    email: '',
    cabin: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type)) {
      setError('Only JPG, JPEG and PNG images are allowed');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError('File size must be 2MB or less');
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.department_id) {
        throw new Error('Please select a department');
      }
      if (!file) {
        throw new Error('Profile photo is required');
      }

      // Use FormData for multipart upload
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('designation', formData.designation);
      payload.append('department_id', formData.department_id);
      payload.append('specialization', formData.specialization);
      payload.append('experience', formData.experience);
      payload.append('email', formData.email);
      payload.append('cabin', formData.cabin);
      if (file) payload.append('profile_photo', file);

      const response = await fetch('/api/faculty', {
        method: 'POST',
        body: payload,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add faculty');
      }

      setSuccess('Faculty member added successfully!');
      setFormData({
        name: '',
        designation: '',
        department_id: '',
        specialization: '',
        experience: '',
        email: '',
        cabin: '',
      });
      setFile(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      onDataAdded();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Add Faculty</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="profile_photo">Profile Photo</Label>
          <input
            id="profile_photo"
            name="profile_photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="mt-1 w-full"
          />

          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover shadow-sm" />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g., Associate Professor"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="department_id">Department</Label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="e.g., Database Management"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="experience">Experience (Years)</Label>
          <Input
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g., 10 years in Academia, 5 years in Industry"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@seshadripuram.edu"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="cabin">Cabin/Office</Label>
          <Input
            id="cabin"
            name="cabin"
            value={formData.cabin}
            onChange={handleChange}
            placeholder="e.g., Room 101"
            className="mt-1"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-600 text-sm p-2 rounded">
            {success}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Faculty'}
        </Button>
      </form>
    </Card>
  );
}
