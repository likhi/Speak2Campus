'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  date: string;
  venue: string;
  description: string;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEvents((prev) => prev.filter((event) => event.id !== id));
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (loading) {
    return <Card className="p-6">Loading events...</Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Events</h2>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No events added yet</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{event.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {event.date} • {event.venue}
                </p>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(event.id)}
                className="ml-2"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
