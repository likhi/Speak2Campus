'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventsFormProps {
  onDataAdded: () => void;
}

export default function EventsForm({ onDataAdded }: EventsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add event');
      }

      setSuccess('Event added successfully!');
      setFormData({ name: '', date: '', venue: '', description: '' });
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
      <h2 className="text-xl font-semibold text-foreground mb-4">Add Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Annual Symposium"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g., Auditorium"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Event details..."
            className="mt-1 resize-none"
            rows={3}
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
          {loading ? 'Adding...' : 'Add Event'}
        </Button>
      </form>
    </Card>
  );
}
