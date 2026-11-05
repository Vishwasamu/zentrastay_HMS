import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDayAfterTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchForm, setSearchForm] = useState({
    check_in_date: getTomorrowDate(),
    check_out_date: getDayAfterTomorrow(),
    guests: 1,
    room_type: "any",
  });

  useEffect(() => {
    const load = async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await api.get("/rooms/list");
        setRooms(res?.rooms || res?.data?.rooms || []);
      } catch (e) {
        setErr(e?.message || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = () => {
    if (!searchForm.check_in_date || !searchForm.check_out_date) return;

    navigate("/available-rooms", {
      state: {
        checkIn: searchForm.check_in_date,
        checkOut: searchForm.check_out_date,
        guests: searchForm.guests,
        roomType: searchForm.room_type, // "any" or "standard" etc.
      },
    });
  };

  const handleTodayClick = () => {
    const today = getTodayDate();
    const tomorrow = getTomorrowDate();
    setSearchForm((p) => ({ ...p, check_in_date: today, check_out_date: tomorrow }));
  };

  const handleTomorrowClick = () => {
    const t = getTomorrowDate();
    const d2 = getDayAfterTomorrow();
    setSearchForm((p) => ({ ...p, check_in_date: t, check_out_date: d2 }));
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.navbar}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏨</span>
            <span style={styles.logoText}>ZentraStay</span>
          </div>
          <div style={styles.navLinks}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/available-rooms" style={styles.navLink}>Rooms</Link>
            <Link to="/bookings" style={styles.navLink}>My Bookings</Link>
            <Link to="/guest/login" style={styles.navLink}>Sign In</Link>
          </div>
        </nav>

        <div style={styles.heroContent}>
          <h2 style={styles.experienceText}>Experience</h2>
          <h1 style={styles.luxuryText}>Unparalleled Luxury</h1>
          <div style={styles.divider}></div>
        </div>
      </header>

      <section style={styles.searchSection}>
        <div style={styles.searchCard}>
          <div style={styles.searchHeader}>
            <h3 style={styles.searchTitle}>PLAN YOUR STAY</h3>
            <h2 style={styles.searchSubtitle}>Find Your Perfect Stay</h2>
          </div>

          <div style={styles.searchGrid}>
            <div style={styles.searchField}>
              <label style={styles.searchLabel}>CHECK-IN</label>
              <input
                type="date"
                style={styles.dateInput}
                value={searchForm.check_in_date}
                min={getTodayDate()}
                onChange={(e) =>
                  setSearchForm((p) => ({
                    ...p,
                    check_in_date: e.target.value,
                    check_out_date:
                      p.check_out_date && p.check_out_date <= e.target.value ? "" : p.check_out_date,
                  }))
                }
              />
            </div>

            <div style={styles.searchField}>
              <label style={styles.searchLabel}>CHECK-OUT</label>
              <input
                type="date"
                style={styles.dateInput}
                value={searchForm.check_out_date}
                min={searchForm.check_in_date || getTodayDate()}
                onChange={(e) => setSearchForm((p) => ({ ...p, check_out_date: e.target.value }))}
              />
            </div>

            <div style={styles.searchField}>
              <label style={styles.searchLabel}>GUESTS</label>
              <select
                style={styles.selectInput}
                value={searchForm.guests}
                onChange={(e) => setSearchForm((p) => ({ ...p, guests: parseInt(e.target.value, 10) }))}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.searchField}>
              <label style={styles.searchLabel}>ROOM TYPE</label>
              <select
                style={styles.selectInput}
                value={searchForm.room_type}
                onChange={(e) => setSearchForm((p) => ({ ...p, room_type: e.target.value }))}
              >
                <option value="any">Any Room</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="executive">Executive</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>

          <div style={styles.quickDateButtons}>
            <button style={styles.dateButton} onClick={handleTodayClick}>TODAY</button>
            <button style={styles.dateButton} onClick={handleTomorrowClick}>TOMORROW</button>
          </div>

          <button style={styles.bookNowButton} onClick={handleSearch}>
            Book Now
          </button>
        </div>
      </section>

      <section style={styles.roomsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Rooms</h2>
          <Link to="/available-rooms" style={styles.viewAllLink}>View All Rooms →</Link>
        </div>

        {loading && <div style={styles.loadingText}>Loading rooms...</div>}
        {err && <div style={styles.errorText}>{err}</div>}

        {!loading && !err && (
          <div style={styles.roomsGrid}>
            {rooms.slice(0, 6).map((room) => (
              <div key={room.id} style={styles.roomCard}>
                <div style={styles.roomImage}>
                  <span style={{ fontSize: 50, opacity: 0.6 }}>🏨</span>
                </div>

                <div style={styles.roomContent}>
                  <div style={styles.roomHeader}>
                    <h3 style={styles.roomType}>{room.room_type}</h3>
                    <span style={styles.roomPrice}>
                      LKR {Number(room.base_price || 0).toLocaleString()}
                      <span style={styles.priceUnit}>/night</span>
                    </span>
                  </div>

                  <p style={styles.roomNumber}>
                    Room: <strong>{room.room_number}</strong>
                  </p>

                  <div style={styles.roomFeatures}>
                    <span style={styles.feature}>👥 {room.capacity || 2} Guests</span>
                    <span style={styles.feature}>🛏️ {room.beds || "Bed"}</span>
                  </div>

                  <button
                    style={styles.bookRoomButton}
                    onClick={() =>
                      navigate("/available-rooms", {
                        state: {
                          checkIn: searchForm.check_in_date,
                          checkOut: searchForm.check_out_date,
                          guests: searchForm.guests,
                          roomType: String(room.room_type || "").toLowerCase(),
                        },
                      })
                    }
                  >
                    View Availability
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <span style={styles.logoIcon}>🏨</span>
            <span style={styles.footerLogoText}>ZentraStay</span>
          </div>
          <p style={{ margin: 0, color: "#999" }}>Luxury Hotels & Resorts</p>
          <p style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
            © {new Date().getFullYear()} ZentraStay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#e8e1e1", color: "#ffffff" },

  header: {
    background:
      "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    padding: "20px 40px",
  },

  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 80 },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 32 },
  logoText: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 2,
    background: "linear-gradient(90deg,#D4AF37 0%, #FFD700 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  navLinks: { display: "flex", gap: 24 },
  navLink: { color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 500 },

  heroContent: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  experienceText: { fontSize: 18, letterSpacing: 4, color: "#D4AF37", margin: "0 0 12px", textTransform: "uppercase" },
  luxuryText: {
    fontSize: 72,
    fontWeight: 700,
    margin: "0 0 24px",
    background: "linear-gradient(90deg,#FFFFFF 0%, #D4AF37 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  divider: { width: 100, height: 2, backgroundColor: "#D4AF37" },

  searchSection: { padding: 40, display: "flex", justifyContent: "center" },
  searchCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 40,
    width: "100%",
    maxWidth: 900,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    border: "1px solid #333",
  },
  searchHeader: { textAlign: "center", marginBottom: 32 },
  searchTitle: { fontSize: 14, letterSpacing: 4, color: "#D4AF37", margin: "0 0 8px", textTransform: "uppercase" },
  searchSubtitle: { fontSize: 32, fontWeight: 600, margin: 0, color: "#fff" },

  searchGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 },
  searchField: {},
  searchLabel: { display: "block", fontSize: 12, letterSpacing: 2, color: "#999", marginBottom: 8 },

  dateInput: {
    width: "100%",
    padding: 16,
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    color: "#ffffff",
    cursor: "pointer",
  },

  selectInput: {
    width: "100%",
    padding: 16,
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    color: "#ffffff",
    cursor: "pointer",
  },

  quickDateButtons: { display: "flex", gap: 16, marginBottom: 32, justifyContent: "center" },
  dateButton: { padding: "12px 24px", backgroundColor: "transparent", border: "1px solid #444", borderRadius: 8, color: "#999", cursor: "pointer" },
  bookNowButton: { width: "100%", padding: 20, backgroundColor: "#D4AF37", border: "none", borderRadius: 8, fontSize: 18, fontWeight: 600, cursor: "pointer" },

  roomsSection: { padding: "80px 40px", backgroundColor: "#0a0a0a" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 },
  sectionTitle: { fontSize: 32, margin: 0 },
  viewAllLink: { color: "#D4AF37", textDecoration: "none" },

  loadingText: { color: "#ccc" },
  errorText: { color: "#ffb4b4" },

  roomsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 },
  roomCard: { backgroundColor: "#1a1a1a", borderRadius: 16, overflow: "hidden", border: "1px solid #333" },
  roomImage: { height: 200, backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
  roomContent: { padding: 24 },

  roomHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  roomType: { fontSize: 20, margin: 0 },
  roomPrice: { fontSize: 22, fontWeight: 700, color: "#D4AF37" },
  priceUnit: { fontSize: 12, color: "#999", marginLeft: 4 },

  roomNumber: { fontSize: 14, color: "#999", margin: "0 0 16px" },
  roomFeatures: { display: "flex", gap: 16, marginBottom: 20 },
  feature: { color: "#ccc", fontSize: 14 },

  bookRoomButton: { width: "100%", padding: 12, borderRadius: 8, border: "1px solid #D4AF37", background: "transparent", color: "#D4AF37", cursor: "pointer" },

  footer: { backgroundColor: "#02054d", padding: 40 },
  footerContent: { display: "flex", flexDirection: "column", alignItems: "center" },
  footerLogo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  footerLogoText: { fontSize: 24, fontWeight: 700, color: "#D4AF37", letterSpacing: 2 },
};
