import { apiFetch } from "../api-client";
import { Event } from "../data/mock-data";

type BackendEventStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "CANCELLED";
type FrontendEventStatus = Event["status"];

export interface BackendEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl: string | null;
  startTime: string;
  endTime: string | null;
  status: BackendEventStatus;
}

export interface EventPayload {
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  startTime: string;
  endTime: string | null;
  status: BackendEventStatus;
}

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";

function mapStatus(status: BackendEventStatus): Event["status"] {
  switch (status) {
    case "PUBLISHED":
      return "SELLING";
    case "SOLD_OUT":
      return "SOLD_OUT";
    case "CANCELLED":
      return "COMPLETED";
    case "DRAFT":
    default:
      return "COMING_SOON";
  }
}

export function mapBackendEvent(event: BackendEvent): Event {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    start_time: event.startTime,
    end_time: event.endTime ?? event.startTime,
    status: mapStatus(event.status),
    image: event.imageUrl || DEFAULT_EVENT_IMAGE,
    category: "Su kien",
  };
}

export function mapFrontendStatusToBackend(status: FrontendEventStatus): BackendEventStatus {
  switch (status) {
    case "SELLING":
      return "PUBLISHED";
    case "SOLD_OUT":
      return "SOLD_OUT";
    case "COMPLETED":
      return "CANCELLED";
    case "DRAFT":
    case "COMING_SOON":
    default:
      return "DRAFT";
  }
}

function normalizeDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

export function buildEventPayload(eventData: Partial<Event>): EventPayload {
  return {
    name: eventData.name?.trim() ?? "",
    description: eventData.description?.trim() ?? "",
    location: eventData.location?.trim() ?? "",
    imageUrl: eventData.image?.trim() ?? "",
    startTime: normalizeDateTime(eventData.start_time ?? ""),
    endTime: eventData.end_time?.trim()
      ? normalizeDateTime(eventData.end_time)
      : null,
    status: mapFrontendStatusToBackend(eventData.status ?? "COMING_SOON"),
  };
}

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const events = await apiFetch<BackendEvent[]>("/api/admin/events");
    return events.map(mapBackendEvent);
  },

  getEventById: async (id: string | number): Promise<Event> => {
    const event = await apiFetch<BackendEvent>(`/api/admin/events/${id}`);
    return mapBackendEvent(event);
  },

  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    const event = await apiFetch<BackendEvent>("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(buildEventPayload(eventData)),
    });
    return mapBackendEvent(event);
  },

  updateEvent: async (
    id: string | number,
    eventData: Partial<Event>,
  ): Promise<Event> => {
    const event = await apiFetch<BackendEvent>(`/api/admin/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(buildEventPayload(eventData)),
    });
    return mapBackendEvent(event);
  },

  deleteEvent: async (id: string | number): Promise<void> => {
    return apiFetch<void>(`/api/admin/events/${id}`, {
      method: "DELETE",
    });
  },
};
