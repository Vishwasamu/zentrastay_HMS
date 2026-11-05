import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function MyBookings() {
  const nav = useNavigate();
  const { user, authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      nav("/guest/login", { replace: true });
      return;
    }

    const load = async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await api.get("/guest/my-bookings");
        setItems(res?.reservations || []);
      } catch (e) {
        setErr(e?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, nav]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Bookings</h1>
        <p style={styles.subtitle}>Manage your reservations</p>
      </div>

      {err && <div style={styles.alertErr}>{err}</div>}

      {items.length === 0 ? (
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#94a3b8", margin: 0 }}>
            No bookings yet. <a href="/available-rooms" style={styles.link}>Browse available rooms</a>
          </p>
        </div>
      ) : (
        <div style={styles.bookingsList}>
          {items.map((booking) => (
            <div key={booking.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.bookingTitle}>
                    {booking.room_type} - Room #{booking.room_number}
                  </h3>
                  <p style={styles.bookingRef}>Booking Ref: {booking.reservation_ref || `#${booking.id}`}</p>
                </div>
                <div style={{...styles.badge, background: getStatusColor(booking.status)}}>
                  {booking.status}
                </div>
              </div>

              <div style={styles.bookingGrid}>
                <div style={styles.bookingItem}>
                  <span style={styles.label}>Check-in</span>
                  <span style={styles.value}>
                    📅 {booking.check_in_date}
                  </span>
                </div>
                <div style={styles.bookingItem}>
                  <span style={styles.label}>Check-out</span>
                  <span style={styles.value}>
                    📅 {booking.check_out_date}
                  </span>
                </div>
                <div style={styles.bookingItem}>
                  <span style={styles.label}>Guests</span>
                  <span style={styles.value}>
                    👥 {booking.number_of_guests}
                  </span>
                </div>
                <div style={styles.bookingItem}>
                  <span style={styles.label}>Total Price</span>
                  <span style={styles.value}>
                    💰 LKR {Number(booking.total_price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {booking.special_requests && (
                <div style={styles.specialRequests}>
                  <span style={styles.label}>Special Requests</span>
                  <p style={styles.requestText}>{booking.special_requests}</p>
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.createdAt}>
                  Booked on {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed" || s === "paid") return "#10b981";
  if (s === "pending") return "#f59e0b";
  if (s === "cancelled" || s === "canceled") return "#ef4444";
  return "#6366f1";
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#f8fafc",
    padding: 24,
  },
  header: {
    maxWidth: 1200,
    margin: "0 auto 24px",
  },
  title: {
    margin: "0 0 6px",
    fontSize: 32,
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 14,
  },
  alertErr: {
    maxWidth: 1200,
    margin: "0 auto 16px",
    padding: 14,
    borderRadius: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fecaca",
  },
  bookingsList: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
  },
  card: {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 18,
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  bookingTitle: {
    margin: "0 0 4px",
    fontSize: 18,
    fontWeight: 700,
  },
  bookingRef: {
    margin: 0,
    fontSize: 12,
    color: "#94a3b8",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  bookingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginBottom: 14,
  },
  bookingItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: 500,
    color: "#e2e8f0",
  },
  specialRequests: {
    padding: 12,
    borderRadius: 10,
    background: "rgba(30,41,59,0.4)",
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  requestText: {
    margin: "8px 0 0",
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  cardFooter: {
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    textAlign: "right",
  },
  createdAt: {
    fontSize: 12,
    color: "#94a3b8",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 600,
  },
};
