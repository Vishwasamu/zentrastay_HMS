// Utilities for managing pending bookings in localStorage

export const pendingBookingStorage = {
  key: "zs_pending_booking",

  // Store pending booking details
  set: (booking) => {
    if (!booking) {
      localStorage.removeItem(pendingBookingStorage.key);
      return;
    }
    localStorage.setItem(
      pendingBookingStorage.key,
      JSON.stringify({
        ...booking,
        savedAt: new Date().toISOString(),
      })
    );
  },

  // Retrieve pending booking
  get: () => {
    const data = localStorage.getItem(pendingBookingStorage.key);
    return data ? JSON.parse(data) : null;
  },

  // Clear pending booking
  clear: () => {
    localStorage.removeItem(pendingBookingStorage.key);
  },

  // Check if pending booking exists
  exists: () => {
    return localStorage.getItem(pendingBookingStorage.key) !== null;
  },
};

// Session storage for router state (survives page refresh)
export const bookingState = {
  key: "zs_booking_state",

  set: (state) => {
    sessionStorage.setItem(bookingState.key, JSON.stringify(state));
  },

  get: () => {
    const data = sessionStorage.getItem(bookingState.key);
    return data ? JSON.parse(data) : null;
  },

  clear: () => {
    sessionStorage.removeItem(bookingState.key);
  },
};

// Legacy functions for backward compatibility
export function savePendingBooking(data) {
  pendingBookingStorage.set(data);
}

export function getPendingBooking() {
  return pendingBookingStorage.get();
}

export function clearPendingBooking() {
  pendingBookingStorage.clear();
}
