import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { pendingBookingStorage } from "../../lib/pendingBooking";

export default function GuestRegister() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get pending booking from localStorage
  const pendingBooking = pendingBookingStorage.get();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    first_name: pendingBooking?.first_name || "",
    last_name: pendingBooking?.last_name || "",
    email: pendingBooking?.email || location.state?.email || "",
    phone: pendingBooking?.phone || "",
    password: "",
    confirmPassword: "",
  });

  const valid = useMemo(() => {
    const emailOk = String(form.email || "").includes("@") && String(form.email || "").includes(".");
    const passOk = String(form.password || "").length >= 6;
    const match = form.password === form.confirmPassword;
    return form.first_name.trim() && emailOk && passOk && match;
  }, [form]);

  const submit = async () => {
    setErr("");
    setOk("");
    if (!valid) return setErr("Please check all fields. Password must be at least 6 characters and match.");

    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      };

      const res = await api.post("/api/auth/register.php", payload);

      setOk("Account created successfully!");

      // Store token
      if (res?.token) {
        localStorage.setItem("zs_token", res.token);
        localStorage.setItem("auth_token", res.token);
      }

      // Clear pending booking and login
      if (res?.token) {
        login({ token: res.token, user: res.user });
      }

      // Redirect to dashboard
      setTimeout(() => {
        pendingBookingStorage.clear();
        nav("/guest/dashboard", {
          replace: true,
          state: { newRegistration: true },
        });
      }, 1000);
    } catch (e) {
      setErr(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>← Home</Link>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Guest Registration</h1>
        <p style={styles.subtitle}>Create your account to access your booking.</p>

        {err && <div style={styles.alertErr}>{err}</div>}
        {ok && <div style={styles.alertOk}>{ok}</div>}

        {pendingBooking?.room && (
          <div style={styles.bookingSummary}>
            <h3 style={styles.summaryTitle}>📋 Your Booking Summary</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Room Type</span>
                <span style={styles.summaryValue}>{pendingBooking.room.room_type}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Room Number</span>
                <span style={styles.summaryValue}>#{pendingBooking.room.room_number}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Check-in</span>
                <span style={styles.summaryValue}>{pendingBooking.searchParams?.checkIn}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Check-out</span>
                <span style={styles.summaryValue}>{pendingBooking.searchParams?.checkOut}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Guests</span>
                <span style={styles.summaryValue}>{pendingBooking.searchParams?.guestsCount || 1}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Price</span>
                <span style={styles.summaryValue}>${Number(pendingBooking.searchParams?.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div style={styles.form}>
          <h3 style={styles.sectionTitle}>Account Information</h3>

          <div style={styles.row2}>
            <input style={styles.input} placeholder="First Name" value={form.first_name} onChange={set("first_name")} />
            <input style={styles.input} placeholder="Last Name" value={form.last_name} onChange={set("last_name")} />
          </div>

          <input style={styles.input} type="email" placeholder="Email" value={form.email} onChange={set("email")} />
          <input style={styles.input} type="tel" placeholder="Phone" value={form.phone} onChange={set("phone")} />

          <input style={styles.input} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set("password")} />
          <input style={styles.input} type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={set("confirmPassword")} />

          <button style={styles.btn} onClick={submit} disabled={loading || !valid}>
            {loading ? "Creating Account..." : "Create Account & Confirm Booking"}
          </button>

          <p style={styles.loginLink}>
            Already have an account? <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none" }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%, #1e293b 100%)", display:"flex", flexDirection:"column", alignItems:"center", padding:24, color:"#fff" },
  header: { width:"100%", maxWidth:720, marginBottom:14 },
  backLink: { color:"#94a3b8", textDecoration:"none", fontSize:14 },
  card: { width:"100%", maxWidth:720, background:"rgba(15,23,42,0.6)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, padding:22, backdropFilter:"blur(10px)" },
  title: { margin:"0 0 6px", fontSize:30, fontWeight:900 },
  subtitle: { margin:"0 0 18px", color:"#94a3b8" },
  bookingSummary: { padding:16, borderRadius:12, background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.3)", marginBottom:18 },
  summaryTitle: { margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#e2e8f0" },
  summaryGrid: { display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12 },
  summaryItem: { display:"flex", flexDirection:"column", gap:4 },
  summaryLabel: { fontSize:11, textTransform:"uppercase", color:"#94a3b8", letterSpacing:0.5 },
  summaryValue: { fontSize:13, fontWeight:600, color:"#f1f5f9" },
  alertErr: { padding:12, borderRadius:12, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.35)", color:"#fecaca", marginBottom:14 },
  alertOk: { padding:12, borderRadius:12, background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.35)", color:"#bbf7d0", marginBottom:14 },
  form: { display:"flex", flexDirection:"column", gap:12 },
  sectionTitle: { margin:"18px 0 6px", fontSize:16, opacity:0.9 },
  label: { fontSize: 12, color: "#cbd5e1", marginBottom: 6 },
  row2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  input: { width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(30,41,59,0.55)", color:"#f8fafc", outline:"none" },
  textarea: { width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(30,41,59,0.55)", color:"#f8fafc", outline:"none", resize:"vertical" },
  btn: { marginTop:10, width:"100%", padding:"14px 16px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:900, color:"#fff", background:"linear-gradient(135deg,#3b82f6 0%, #8b5cf6 100%)", opacity: 1 },
  loginLink: { fontSize:12, textAlign:"center", color:"#94a3b8", marginTop:16 },
};
