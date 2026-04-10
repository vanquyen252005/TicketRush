import { apiFetch } from "../api-client";
import { Event } from "../data/mock-data";

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    return apiFetch<Event[]>("/api/events");
  },

  getEventById: async (id: string | number): Promise<Event> => {
    return apiFetch<Event>(`/api/events/${id}`);
  },

  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    return apiFetch<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  updateEvent: async (id: string | number, eventData: Partial<Event>): Promise<Event> => {
    return apiFetch<Event>(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },

  deleteEvent: async (id: string | number): Promise<void> => {
    return apiFetch<void>(`/api/events/${id}`, {
      method: "DELETE",
    });
  },
};
