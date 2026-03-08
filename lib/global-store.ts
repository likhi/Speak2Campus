// Global persistent in-memory data store
// This data persists across API requests within the same server instance

export interface Location {
  id: number;
  name: string;
  floor: string;
  building: string;
  description: string;
}

export interface Faculty {
  id: number;
  name: string;
  designation: string;
  department: string;
  specialization: string;
  email: string;
  cabin: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  venue: string;
}

export interface Timetable {
  id: number;
  day: string;
  time: string;
  subject: string;
  faculty: string;
  room: string;
}

class GlobalStore {
  private locations: Map<number, Location> = new Map([
    [1, {
      id: 1,
      name: 'Computer Lab',
      floor: '2nd Floor',
      building: 'Building A',
      description: 'Main computer lab for MCA students',
    }],
    [2, {
      id: 2,
      name: 'Library',
      floor: '1st Floor',
      building: 'Main Block',
      description: 'Central library',
    }],
  ]);

  private faculty: Map<number, Faculty> = new Map([
    [1, {
      id: 1,
      name: 'Dr. Ramesh Kumar',
      designation: 'Associate Professor',
      department: 'MCA',
      specialization: 'Database Management',
      email: 'ramesh@seshadripuram.edu',
      cabin: 'Room 101',
    }],
  ]);

  private events: Map<number, Event> = new Map();

  private timetable: Map<number, Timetable> = new Map([
    [1, {
      id: 1,
      day: 'Monday',
      time: '10:00',
      subject: 'Database Design',
      faculty: 'Dr. Ramesh Kumar',
      room: 'Lab-1',
    }],
  ]);

  private nextLocationId: number = 3;
  private nextFacultyId: number = 2;
  private nextEventId: number = 1;
  private nextTimetableId: number = 2;

  // Locations
  getLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  addLocation(data: Omit<Location, 'id'>): Location {
    const id = this.nextLocationId++;
    const location: Location = { ...data, id };
    this.locations.set(id, location);
    return location;
  }

  deleteLocation(id: number): boolean {
    return this.locations.delete(id);
  }

  // Faculty
  getFaculty(): Faculty[] {
    return Array.from(this.faculty.values());
  }

  addFaculty(data: Omit<Faculty, 'id'>): Faculty {
    const id = this.nextFacultyId++;
    const faculty: Faculty = { ...data, id };
    this.faculty.set(id, faculty);
    return faculty;
  }

  deleteFaculty(id: number): boolean {
    return this.faculty.delete(id);
  }

  // Events
  getEvents(): Event[] {
    return Array.from(this.events.values());
  }

  addEvent(data: Omit<Event, 'id'>): Event {
    const id = this.nextEventId++;
    const event: Event = { ...data, id };
    this.events.set(id, event);
    return event;
  }

  deleteEvent(id: number): boolean {
    return this.events.delete(id);
  }

  // Timetable
  getTimetable(day?: string): Timetable[] {
    let entries = Array.from(this.timetable.values());
    if (day) {
      entries = entries.filter(entry => entry.day === day);
    }
    return entries;
  }

  addTimetable(data: Omit<Timetable, 'id'>): Timetable {
    const id = this.nextTimetableId++;
    const entry: Timetable = { ...data, id };
    this.timetable.set(id, entry);
    return entry;
  }

  deleteTimetable(id: number): boolean {
    return this.timetable.delete(id);
  }
}

// Export singleton instance
export const store = new GlobalStore();
