import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const nav = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await api.post("/auth/login", form);

      const user = data.user;
      const token = data.token;

      if (!user || !token) throw new Error("Login response invalid");

      if (user.role !== "ADMIN") {
        throw new Error("Access denied: Admin only");
      }

      auth.login({ token, user });
      nav("/admin", { replace: true });
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>ZentraStay</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>Admin Login</div>
        </div>

        <h2 style={{ margin: "0 0 6px" }}>Welcome Back</h2>
        <p style={{ margin: "0 0 14px", opacity: 0.75, fontSize: 13 }}>
          Sign in to manage rooms, reservations, and operations.
        </p>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={label}>Email</div>
            <input
              style={input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <div style={label}>Password</div>
            <input
              style={input}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {err && <div style={errorBox}>{err}</div>}

          <button type="submit" style={btnPrimary} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          <Link to="/" style={{ color: "#646cff" }}>← Back to Home</Link>
          <Link to="/guest/login" style={{ color: "#646cff" }}>Guest Login</Link>
        </div>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "#0b1220",
};

const card = {
  width: "100%",
  maxWidth: 460,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 18,
  color: "#e5e7eb",
};

const label = { fontSize: 12, opacity: 0.85, marginBottom: 6 };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  outline: "none",
};

const btnPrimary = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #4f46e5",
  background: "#4f46e5",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  marginTop: 4,
};

const errorBox = {
  padding: 10,
  borderRadius: 12,
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  fontSize: 13,
};
