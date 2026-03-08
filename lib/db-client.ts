// Client-side database utilities for fetching college data

export async function fetchLocations() {
  try {
    const response = await fetch("/api/locations");
    if (!response.ok) throw new Error("Failed to fetch locations");
    return await response.json();
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function fetchFaculty() {
  try {
    const response = await fetch("/api/faculty");
    if (!response.ok) throw new Error("Failed to fetch faculty");
    return await response.json();
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return [];
  }
}

export async function fetchEvents() {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) throw new Error("Failed to fetch events");
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function fetchTimetable(day?: string) {
  try {
    const url = day ? `/api/timetable?day=${day}` : "/api/timetable";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch timetable");
    return await response.json();
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return [];
  }
}

export async function addLocation(location: {
  name: string;
  floor: string;
  building: string;
  description: string;
}) {
  try {
    const response = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP ${response.status}`;
      console.error("[v0] Location API error:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[v0] Location added successfully");
    return data;
  } catch (error) {
    console.error("[v0] Error adding location:", error);
    throw error;
  }
}

export async function addFaculty(faculty: {
  name: string;
  designation: string;
  specialization: string;
  email: string;
  cabin: string;
}) {
  try {
    const response = await fetch("/api/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faculty),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP ${response.status}`;
      console.error("[v0] Faculty API error:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[v0] Faculty added successfully");
    return data;
  } catch (error) {
    console.error("[v0] Error adding faculty:", error);
    throw error;
  }
}

export async function addEvent(event: {
  name: string;
  date: string;
  event_time?: string;
  description: string;
  venue: string;
}) {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP ${response.status}`;
      console.error("[v0] Event API error:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[v0] Event added successfully");
    return data;
  } catch (error) {
    console.error("[v0] Error adding event:", error);
    throw error;
  }
}

export async function addTimetableEntry(entry: {
  day_of_week: string;
  time: string;
  subject: string;
  faculty_id: string;
  room: string;
}) {
  try {
    const response = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP ${response.status}`;
      console.error("[v0] Timetable API error:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[v0] Timetable entry added successfully");
    return data;
  } catch (error) {
    console.error("[v0] Error adding timetable entry:", error);
    throw error;
  }
}

export async function fetchTodayUpdates() {
  try {
    const response = await fetch("/api/today-updates");
    if (!response.ok) throw new Error("Failed to fetch today's updates");
    return await response.json();
  } catch (error) {
    console.error("Error fetching today's updates:", error);
    return null;
  }
}
