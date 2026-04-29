import apiClient from "../api-client";
import { Event, SeatLayoutRequest } from "../types";

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

  saveSeatLayout: async (id: string | number, layout: SeatLayoutRequest): Promise<Event> => {
    const response = await apiClient.put<Event>(`/api/admin/events/${id}/seat-layout`, layout);
    return response.data;
  },

  deleteEvent: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/api/admin/events/${id}`);
  },

  /**
   * Upload a local image file to the server.
   * Returns the public URL of the uploaded image (e.g. "/uploads/uuid.jpg").
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>("/api/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  },
};
