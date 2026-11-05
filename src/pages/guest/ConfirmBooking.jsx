// frontend/src/pages/guest/ConfirmBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { pendingBookingStorage } from "../../lib/pendingBooking";
import { bookingService } from "../../services/booking.service";

export default function ConfirmBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get booking data from router state or sessionStorage
    let booking = location.state;
    if (!booking && location.state?.selectedRoom) {
      booking = location.state;
    }

    if (!booking || !booking.selectedRoom) {
      setError("No room selected. Please go back and select a room.");
      setTimeout(() => navigate("/rooms"), 2000);
      return;
    }

    setRoom(booking.selectedRoom);
    setSearchParams(booking.searchParams || {});
  }, [location, navigate]);

  const calculateDays = () => {
    if (!searchParams?.checkIn || !searchParams?.checkOut) return 0;
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const getTotalPrice = () => {
    if (!room || !searchParams?.totalPrice) return 0;
    return searchParams.totalPrice || room.base_price * calculateDays();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !phone) {
        throw new Error("Email and phone are required");
      }

      // Create pending reservation
      const response = await bookingService.createPendingReservation({
        room_id: room.id,
        check_in_date: searchParams.checkIn,
        check_out_date: searchParams.checkOut,
        total_price: getTotalPrice(),
        email,
        phone,
        first_name: firstName,
        last_name: lastName,
        number_of_guests: searchParams.guestsCount || 1,
      });

      // Save pending booking details for prefilling registration/login
      pendingBookingStorage.set({
        reservation_id: response.reservation_id,
        reservation_ref: response.reservation_ref,
        email,
        phone,
        first_name: firstName,
        last_name: lastName,
        room,
        searchParams,
      });

      // Check if email is registered
      try {
        await api.post("/api/auth/checkEmail.php", { email });
        // Email exists - go to login
        navigate("/login", {
          state: {
            email,
            message: "Please login to confirm your booking",
          },
        });
      } catch (err) {
        // Email doesn't exist - go to register
        navigate("/register", {
          state: {
            message: "Please register to confirm your booking",
          },
        });
      }
    } catch (err) {
      setError(err.message || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}>
      <h2>Confirm Your Booking</h2>

      <div style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "20px" }}>
        <h3>Room Details</h3>
        <p>
          <strong>Room:</strong> {room.room_number} ({room.room_type})
        </p>
        <p>
          <strong>Check-in:</strong> {searchParams?.checkIn}
        </p>
        <p>
          <strong>Check-out:</strong> {searchParams?.checkOut}
        </p>
        <p>
          <strong>Number of Guests:</strong> {searchParams?.guestsCount || 1}
        </p>
        <p>
          <strong>Number of Days:</strong> {calculateDays()}
        </p>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          <strong>Total Price:</strong> ${getTotalPrice().toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <h3>Your Information</h3>

        <div style={{ marginBottom: "15px" }}>
          <label>
            First Name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              placeholder="First Name (optional)"
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Last Name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              placeholder="Last Name (optional)"
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Email *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              placeholder="email@example.com"
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Phone *
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              placeholder="+1 (555) 123-4567"
              required
            />
          </label>
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "15px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Processing..." : "Confirm & Book Now"}
        </button>
      </form>
    </div>
  );
}
