'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimetableFormProps {
  onDataAdded: () => void;
}

export default function TimetableForm({ onDataAdded }: TimetableFormProps) {
  const [formData, setFormData] = useState({
    day: '',
    start_time: '',
    end_time: '',
    subject: '',
    faculty: '',
    room: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [facultyList, setFacultyList] = useState<{id: number, name: string}[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch('/api/faculty');
        if (response.ok) {
          const data = await response.json();
          setFacultyList(data);
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
      }
    };

    fetchFaculty();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayChange = (value: string) => {
    setFormData((prev) => ({ ...prev, day: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Prepare payload: combine start/end into `time` for backward compatibility
      const payload: any = { ...formData };
      if ((formData as any).start_time && (formData as any).end_time) {
        payload.time = `${(formData as any).start_time}-${(formData as any).end_time}`;
      }

      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to add timetable entry';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Use the raw response text if it's not JSON
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Success - entry was added
      setSuccess('Class added successfully!');
      setFormData({ day: '', start_time: '', end_time: '', subject: '', faculty: '', room: '', year: '' });

      // Small delay to ensure success message is visible before triggering refresh
      setTimeout(() => {
        onDataAdded();
      }, 100);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Add Class</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="day">Day</Label>
          <Select value={formData.day} onValueChange={handleDayChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={formData.year} onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st Year">1st Year</SelectItem>
              <SelectItem value="2nd Year">2nd Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Data Structures"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="faculty">Faculty Name</Label>
          <Select value={formData.faculty} onValueChange={(value) => setFormData((prev) => ({ ...prev, faculty: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              {facultyList.map((faculty) => (
                <SelectItem key={faculty.id} value={faculty.name}>
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="room">Room/Lab</Label>
          <Input
            id="room"
            name="room"
            value={formData.room}
            onChange={handleChange}
            placeholder="e.g., Lab-1"
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
          {loading ? 'Adding...' : 'Add Class'}
        </Button>
      </form>
    </Card>
  );
}
