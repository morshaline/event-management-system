import { apiClient } from "./apiClient";

export const eventService = {
  listEvents: (participantId) => {
    const query = participantId ? `?participantId=${participantId}` : "";
    return apiClient.get(`/api/events${query}`);
  },
  listOrganizerEvents: (organizerId) =>
    apiClient.get(`/api/organizers/${organizerId}/events`),
  listParticipantRegistrations: (participantId) =>
    apiClient.get(`/api/participants/${participantId}/registrations`),
  createEvent: (payload) => apiClient.post("/api/events", payload),
  updateEvent: (eventId, payload) => apiClient.put(`/api/events/${eventId}`, payload),
  deleteEvent: (eventId, organizerId) =>
    apiClient.delete(`/api/events/${eventId}?organizerId=${organizerId}`),
  registerForEvent: (eventId, participantId) =>
    apiClient.post(`/api/events/${eventId}/register`, { participantId }),
  unregisterFromEvent: (eventId, participantId) =>
    apiClient.delete(`/api/events/${eventId}/register/${participantId}`),
};
