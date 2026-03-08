'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  floor: string;
  building: string;
  description: string;
}

export default function LocationsList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        const response = await fetch(`/api/locations?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setLocations((prev) => prev.filter((loc) => loc.id !== id));
        }
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  if (loading) {
    return <Card className="p-6">Loading locations...</Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Locations</h2>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {locations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No locations added yet</p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{location.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {location.building}, {location.floor}
                </p>
                {location.description && (
                  <p className="text-xs text-muted-foreground mt-1">{location.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(location.id)}
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
