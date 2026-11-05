import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function GuestProfile() {
  const nav = useNavigate();
  const { user, logout, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
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
        const res = await api.get("/api/guest/profile.php");
        setData(res);
      } catch (e) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, nav]);

  const handleLogout = () => {
    logout();
    nav("/", { replace: true });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile || {};
  const reservations = data?.reservations || [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>My Profile</h1>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {err && <div style={styles.alertErr}>{err}</div>}

      <div style={styles.grid}>
        {/* Account Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 Account Information</h2>
          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user?.email || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Phone</span>
              <span style={styles.value}>{profile?.phone || "-"}</span>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Personal Details</h2>
          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Date of Birth</span>
              <span style={styles.value}>{profile?.date_of_birth || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Nationality</span>
              <span style={styles.value}>{profile?.nationality || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>ID Type</span>
              <span style={styles.value}>{profile?.id_type || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Address</span>
              <span style={styles.value}>{profile?.address || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>City</span>
              <span style={styles.value}>{profile?.city || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Country</span>
              <span style={styles.value}>{profile?.country || "-"}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🆘 Emergency Contact</h2>
          <div style={styles.infoGroup}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Name</span>
              <span style={styles.value}>{profile?.emergency_contact_name || "-"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Phone</span>
              <span style={styles.value}>{profile?.emergency_contact_phone || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📅 Recent Reservations</h2>
        {reservations.length === 0 ? (
          <p style={{ color: "#94a3b8", margin: 0 }}>No reservations yet.</p>
        ) : (
          <div style={styles.reservationsList}>
            {reservations.slice(0, 5).map((res, i) => (
              <div key={i} style={styles.reservationItem}>
                <div style={styles.resHeader}>
                  <span style={styles.resRoom}>
                    {res.room_type} - Room #{res.room_number}
                  </span>
                  <span style={{...styles.badge, background: res.status === 'confirmed' ? '#10b981' : '#f59e0b'}}>
                    {res.status}
                  </span>
                </div>
                <div style={styles.resDetails}>
                  <span>📅 {res.check_in_date} to {res.check_out_date}</span>
                  <span>👥 {res.number_of_guests} guest(s)</span>
                  <span>💰 LKR {Number(res.total_price || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  logoutBtn: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid rgba(239,68,68,0.5)",
    background: "rgba(239,68,68,0.1)",
    color: "#fecaca",
    fontWeight: 600,
    cursor: "pointer",
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
  grid: {
    maxWidth: 1200,
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: 18,
  },
  card: {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 18,
    backdropFilter: "blur(10px)",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    fontWeight: 700,
  },
  infoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  infoItem: {
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
  reservationsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  reservationItem: {
    padding: 12,
    borderRadius: 10,
    background: "rgba(30,41,59,0.4)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  resHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resRoom: {
    fontWeight: 600,
    fontSize: 14,
  },
  badge: {
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    color: "#fff",
    textTransform: "capitalize",
  },
  resDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    color: "#cbd5e1",
  },
};
