'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TimetableEntry {
  id: number;
  day: string;
  time: string;
  start_time?: string;
  end_time?: string;
  subject: string;
  faculty: string;
  room: string;
  classroom?: string;
  year: string;
}

interface TimetableListProps {
  refreshTrigger?: number;
}

export default function TimetableList({ refreshTrigger }: TimetableListProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch('/api/timetable');
        if (response.ok) {
          const data = await response.json();
          setTimetable(data);
        }
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const response = await fetch(`/api/timetable/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTimetable((prev) => prev.filter((entry) => entry.id !== id));
        }
      } catch (error) {
        console.error('Error deleting timetable entry:', error);
      }
    }
  };

  if (loading) {
    return <Card className="p-6">Loading timetable...</Card>;
  }

  // Group by year, then by day
  const groupedByYear = timetable.reduce(
    (acc, entry) => {
      const year = entry.year || 'Unknown Year';
      if (!acc[year]) acc[year] = {};
      if (!acc[year][entry.day]) acc[year][entry.day] = [];
      acc[year][entry.day].push(entry);
      return acc;
    },
    {} as Record<string, Record<string, TimetableEntry[]>>
  );

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Class Timetable</h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {Object.keys(groupedByYear).length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No classes added yet</p>
        ) : (
          Object.entries(groupedByYear).map(([year, days]) => (
            <div key={year}>
              <h2 className="text-lg font-bold text-foreground mb-4">{year} Timetable</h2>
              {Object.entries(days).map(([day, entries]) => (
                <div key={day}>
                  <h3 className="font-semibold text-foreground mb-2">{day}</h3>
                  <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start justify-between p-2 bg-muted/50 rounded border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{entry.start_time ? `${entry.start_time} - ${entry.end_time || ''}` : entry.time}</p>
                          <p className="text-xs text-foreground">{entry.subject}</p>
                          <p className="text-xs text-muted-foreground">{entry.faculty || 'Faculty TBA'}</p>
                          {(entry.classroom || entry.room) && (
                            <p className="text-xs text-muted-foreground">{entry.classroom || entry.room}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="ml-2"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
