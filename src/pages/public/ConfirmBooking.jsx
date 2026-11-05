import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function GuestConfirmBooking() {
  const nav = useNavigate();
  const location = useLocation();

  const selectedRoom = location.state?.selectedRoom || null;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [booking, setBooking] = useState({
    room_id: selectedRoom?.id ?? null,
    check_in_date: location.state?.searchParams?.checkIn || "",
    check_out_date: location.state?.searchParams?.checkOut || "",
    adults: 2,
    children: 0,
    email: location.state?.bookingPrefill?.email || "",
    special_requests: "",
  });

  useEffect(() => {
    if (!selectedRoom) setErr("No room selected. Please go back and select a room.");
  }, [selectedRoom]);

  const nights = useMemo(() => {
    if (!booking.check_in_date || !booking.check_out_date) return 0;
    const a = new Date(booking.check_in_date);
    const b = new Date(booking.check_out_date);
    const diff = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [booking.check_in_date, booking.check_out_date]);

  const total = useMemo(() => {
    const price = Number(selectedRoom?.base_price ?? 0);
    return nights * price;
  }, [nights, selectedRoom]);

  const totalGuests = useMemo(() => {
    const a = Number(booking.adults || 0);
    const c = Number(booking.children || 0);
    return a + c;
  }, [booking.adults, booking.children]);

  const isValidEmail = (v) => {
    const s = String(v || "").trim();
    return s.length >= 5 && s.includes("@") && s.includes(".");
  };

  const confirmBooking = async () => {
    setErr("");
    setOk("");

    if (!selectedRoom?.id) return setErr("Room not selected");
    if (!booking.check_in_date || !booking.check_out_date) return setErr("Please select check-in and check-out dates");
    if (nights <= 0) return setErr("Check-out date must be after check-in date");
    if (Number(booking.adults || 0) <= 0) return setErr("Adults must be at least 1");
    if (!isValidEmail(booking.email)) return setErr("Please enter a valid email address");

    setLoading(true);
    try {
      const payload = {
        room_id: selectedRoom.id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        number_of_guests: totalGuests,
        total_price: Number(total || 0),
        special_requests: booking.special_requests || "",
        guest_email: String(booking.email || "").trim(),
      };

      // First, check if email exists
      try {
        await api.post("/auth/check-email", { email: payload.guest_email });
        // Email exists - user is registered, go to login
        setOk("Account found. Redirecting to Login...");
        nav("/guest/login", {
          state: {
            email: payload.guest_email,
            bookingData: { room: selectedRoom, booking: payload },
            from: "/confirm-booking",
          },
        });
      } catch (checkErr) {
        // Email doesn't exist or other error - proceed with booking and registration
        if (checkErr.message && checkErr.message.includes("not found")) {
          // Email not registered - create booking and go to registration
          const res = await api.post("/confirm-booking.php", payload);

          const token = res?.registration_token || res?.token || "";
          const prefillEmail = res?.prefill?.email || payload.guest_email;

          if (!token) throw new Error("Registration token not received");

          setOk("Booking confirmed. Redirecting to Guest Registration...");

          nav("/guest/register", {
            state: {
              token,
              prefill: { email: prefillEmail },
              bookingData: { room: selectedRoom, booking: payload },
              from: "/confirm-booking",
            },
          });
        } else {
          throw checkErr;
        }
      }
    } catch (e) {
      setErr(e?.message || "Booking confirm failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <Link to="/available-rooms" style={styles.backLink}>← Back to Rooms</Link>
          <div>
            <h1 style={styles.title}>Confirm Your Booking</h1>
            <p style={styles.subtitle}>Review details and confirm your reservation</p>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        {err && <div style={styles.alertErr}>{err}</div>}
        {ok && <div style={styles.alertOk}>{ok}</div>}

        {!selectedRoom ? (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>No Room Selected</h3>
            <p style={{ opacity: 0.85 }}>Please go back and choose a room to continue.</p>
            <Link to="/available-rooms" style={styles.btnPrimary}>Browse Available Rooms</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.leftCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Room Details</h3>
                <div style={styles.roomBox}>
                  <div style={styles.roomTop}>
                    <div>
                      <div style={styles.roomType}>{selectedRoom.room_type}</div>
                      <div style={styles.roomNum}>Room {selectedRoom.room_number}</div>
                    </div>
                    <div style={styles.badge}>
                      USD {Number(selectedRoom.base_price || 0).toFixed(2)}/night
                    </div>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.meta}>Capacity: {selectedRoom.capacity ?? 2}</span>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Booking Summary</h3>
                <div style={styles.summaryGrid}>
                  <div>
                    <div style={styles.sumLabel}>Check-in</div>
                    <div style={styles.sumValue}>{booking.check_in_date || "-"}</div>
                  </div>
                  <div>
                    <div style={styles.sumLabel}>Check-out</div>
                    <div style={styles.sumValue}>{booking.check_out_date || "-"}</div>
                  </div>
                  <div>
                    <div style={styles.sumLabel}>Nights</div>
                    <div style={styles.sumValue}>{nights}</div>
                  </div>
                  <div>
                    <div style={styles.sumLabel}>Guests</div>
                    <div style={styles.sumValue}>{totalGuests}</div>
                  </div>
                </div>

                <div style={styles.totalBox}>
                  <div style={{ opacity: 0.85 }}>Total Amount</div>
                  <div style={styles.totalValue}>LKR {Number(total || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div style={styles.rightCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Booking Details</h3>

                <div style={styles.formGrid}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={styles.label}>Email Address</div>
                    <input
                      type="email"
                      value={booking.email}
                      onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                      style={styles.input}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <div style={styles.label}>Check-in Date</div>
                    <input
                      type="date"
                      value={booking.check_in_date}
                      onChange={(e) => setBooking({ ...booking, check_in_date: e.target.value })}
                      style={styles.input}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  </div>

                  <div>
                    <div style={styles.label}>Check-out Date</div>
                    <input
                      type="date"
                      value={booking.check_out_date}
                      onChange={(e) => setBooking({ ...booking, check_out_date: e.target.value })}
                      style={styles.input}
                      min={booking.check_in_date || new Date().toISOString().slice(0, 10)}
                    />
                  </div>

                  <div>
                    <div style={styles.label}>Adults</div>
                    <input
                      type="number"
                      min="1"
                      max={selectedRoom.capacity ?? 10}
                      value={booking.adults}
                      onChange={(e) => setBooking({ ...booking, adults: Number(e.target.value) })}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <div style={styles.label}>Children</div>
                    <input
                      type="number"
                      min="0"
                      value={booking.children}
                      onChange={(e) => setBooking({ ...booking, children: Number(e.target.value) })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={styles.label}>Special Requests (Optional)</div>
                  <textarea
                    value={booking.special_requests}
                    onChange={(e) => setBooking({ ...booking, special_requests: e.target.value })}
                    style={styles.textarea}
                    placeholder="Any special requests..."
                    rows={4}
                  />
                </div>

                <div style={{ marginTop: 18 }}>
                  <button onClick={confirmBooking} style={styles.btnPrimaryFull} disabled={loading}>
                    {loading ? "Processing..." : "Confirm & Book Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f8fafc" },
  header: { padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.75)", backdropFilter: "blur(10px)" },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 10 },
  backLink: { color: "#94a3b8", textDecoration: "none", fontSize: 14, width: "fit-content" },
  title: { margin: "0 0 4px", fontSize: 30, fontWeight: 800, color: "#e2e8f0" },
  subtitle: { margin: 0, color: "#94a3b8" },
  main: { maxWidth: 1200, margin: "24px auto", padding: "0 24px" },
  alertErr: { padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fecaca", marginBottom: 16 },
  alertOk: { padding: 14, borderRadius: 12, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#bbf7d0", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 18 },
  leftCol: { display: "flex", flexDirection: "column", gap: 18 },
  rightCol: { display: "flex", flexDirection: "column", gap: 18 },
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 18, backdropFilter: "blur(10px)" },
  cardTitle: { margin: "0 0 14px", fontSize: 18 },
  roomBox: { background: "rgba(30,41,59,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 },
  roomTop: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  roomType: { fontSize: 20, fontWeight: 800 },
  roomNum: { fontSize: 13, color: "#94a3b8", marginTop: 3 },
  badge: { background: "linear-gradient(135deg,#3b82f6 0%, #8b5cf6 100%)", color: "#fff", padding: "6px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13, height: "fit-content" },
  metaRow: { marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" },
  meta: { fontSize: 13, color: "#cbd5e1" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  sumLabel: { fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  sumValue: { fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginTop: 4 },
  totalBox: { marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(30,41,59,0.35)" },
  totalValue: { fontSize: 20, fontWeight: 900, color: "#e2e8f0" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  label: { fontSize: 13, color: "#e2e8f0", marginBottom: 6, opacity: 0.9 },
  input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(30,41,59,0.55)", color: "#f8fafc", outline: "none" },
  textarea: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(30,41,59,0.55)", color: "#f8fafc", outline: "none", resize: "vertical", minHeight: 110 },
  btnPrimary: { display: "inline-block", background: "linear-gradient(135deg,#3b82f6 0%, #8b5cf6 100%)", color: "#fff", textDecoration: "none", padding: "12px 16px", borderRadius: 10, fontWeight: 800 },
  btnPrimaryFull: { width: "100%", padding: "14px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg,#3b82f6 0%, #8b5cf6 100%)" },
};
