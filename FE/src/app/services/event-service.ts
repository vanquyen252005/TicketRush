import apiClient from "../api-client";
import { Event } from "../data/utils";

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>("/api/events");
    return response.data;
  },

  getEventById: async (id: string | number): Promise<Event> => {
    const response = await apiClient.get<Event>(`/api/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    const response = await apiClient.post<Event>("/api/admin/events/create", eventData);
    return response.data;
  },

  updateEvent: async (id: string | number, eventData: Partial<Event>): Promise<Event> => {
    const response = await apiClient.put<Event>(`/api/admin/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/api/admin/events/${id}`);
  },
};
