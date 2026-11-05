// frontend/src/services/booking.service.js
import { api } from "../lib/api";

export const bookingService = {
  // Create pending reservation (no auth needed)
  createPendingReservation: (data) =>
    api.post("/api/reservations/create_pending.php", data),

  // Get guest profile with reservations
  getGuestProfile: () =>
    api.get("/api/guest/profile.php"),

  // Fetch single reservation details
  getReservation: (reservationId) =>
    api.get(`/api/reservations/${reservationId}`),

  // Update reservation status (guest - limited)
  updateReservation: (reservationId, updates) =>
    api.put(`/api/reservations/${reservationId}`, updates),
};

// Admin booking endpoints
export const adminBookingService = {
  // List all reservations
  listReservations: (status = "") => {
    const url = status 
      ? `/api/admin/reservations/list.php?status=${encodeURIComponent(status)}`
      : `/api/admin/reservations/list.php`;
    return api.get(url);
  },

  // Update reservation status (admin)
  updateReservationStatus: (reservationId, status) =>
    api.post("/api/admin/reservations/update_status.php", {
      reservation_id: reservationId,
      status,
    }),

  // Get reservation details
  getReservationDetails: (reservationId) =>
    api.get(`/api/admin/reservations/${reservationId}`),
};
