import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const nav = useNavigate();
  const auth = useAuth();
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Guard: redirect if not authenticated or not admin
  useEffect(() => {
    if (auth?.authLoading) return; // Wait for auth to load
    
    if (!auth?.user) {
      nav("/admin/login", { replace: true });
      return;
    }
    if (String(auth.user.role || "").toUpperCase() !== "ADMIN") {
      nav("/", { replace: true });
      return;
    }
  }, [auth?.user, auth?.authLoading, nav]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [roomsRes, reservationsRes] = await Promise.all([
        api.get("/rooms/list").catch(() => ({ rooms: [] })),
        api.get("/admin/reservations/list").catch(() => ({ reservations: [] })),
      ]);
      setRooms(roomsRes.rooms || []);
      setReservations(reservationsRes.reservations || []);
    } catch (e) {
      setErr(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.authLoading) return; // Wait for auth to load
    if (!auth?.user) return; // Wait for user to be set
    load();
  }, [auth?.authLoading, auth?.user]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === "available").length;
    const booked = rooms.filter((r) => r.status === "booked").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    const avgPrice =
      total === 0
        ? 0
        : rooms.reduce((sum, r) => sum + Number(r.base_price || 0), 0) / total;

    return { total, available, booked, maintenance, avgPrice };
  }, [rooms]);

  const priceBuckets = useMemo(() => {
    const buckets = [
      { label: "$0-50", min: 0, max: 50, count: 0 },
      { label: "$51-100", min: 51, max: 100, count: 0 },
      { label: "$101-200", min: 101, max: 200, count: 0 },
      { label: "$201-400", min: 201, max: 400, count: 0 },
      { label: "$401+", min: 401, max: Infinity, count: 0 },
    ];
    for (const r of rooms) {
      const p = Number(r.base_price || 0);
      const b = buckets.find((x) => p >= x.min && p <= x.max);
      if (b) b.count += 1;
    }
    return buckets;
  }, [rooms]);

  const typeCounts = useMemo(() => {
    const map = new Map();
    for (const r of rooms) {
      const t = String(r.room_type || "Unknown");
      map.set(t, (map.get(t) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rooms]);

  const maxTypeCount = useMemo(() => {
    return Math.max(1, ...typeCounts.map((x) => x.count));
  }, [typeCounts]);

  const statusChart = useMemo(() => {
    const total = Math.max(1, rooms.length);
    const items = [
      { label: "Available", value: rooms.filter((r) => r.status === "available").length, key: "available" },
      { label: "Booked", value: rooms.filter((r) => r.status === "booked").length, key: "booked" },
      { label: "Maintenance", value: rooms.filter((r) => r.status === "maintenance").length, key: "maintenance" },
    ];
    return { total, items };
  }, [rooms]);

  return (
    <div style={{ padding: 20 }}>
      {auth?.authLoading ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.8 }}>
          <div style={{ fontSize: 16 }}>Verifying authentication...</div>
        </div>
      ) : !auth?.user ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.8 }}>
          <div style={{ fontSize: 16, marginBottom: 20 }}>Not authenticated</div>
          <button onClick={() => nav("/admin/login")} style={btnPrimary}>
            Go to Admin Login
          </button>
        </div>
      ) : (
        <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            Overview of rooms and quick admin actions.
          </p>
        </div>
        <button onClick={load} style={btn}>
          Refresh
        </button>
      </div>

      {err && <div style={errorBox}>{err}</div>}

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard title="Total Rooms" value={loading ? "..." : rooms.length} hint="All room records" />
        <StatCard title="Available" value={loading ? "..." : rooms.filter((r) => r.status === "available").length} hint="Ready for booking" />
        <StatCard title="Booked" value={loading ? "..." : rooms.filter((r) => r.status === "booked").length} hint="Currently reserved" />
        <StatCard title="Maintenance" value={loading ? "..." : rooms.filter((r) => r.status === "maintenance").length} hint="Out of service" />
        <StatCard title="Total Reservations" value={loading ? "..." : reservations.length} hint="All bookings" />
        <StatCard title="Pending Reservations" value={loading ? "..." : reservations.filter((r) => r.status === "pending").length} hint="Awaiting confirmation" />
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Quick Actions</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <Link to="/admin/rooms" style={{ textDecoration: "none" }}>
              <button style={btnPrimaryWide}>Manage Rooms</button>
            </Link>

            <Link to="/available-rooms" style={{ textDecoration: "none" }}>
              <button style={btnWide}>View Guest Room Listing</button>
            </Link>

            <Link to="/guest/login" style={{ textDecoration: "none" }}>
              <button style={btnWide}>Go to Guest Login</button>
            </Link>
          </div>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Add reservations/invoices later by enabling those backend routes.
          </p>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Recent Rooms</h3>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={th}>Room</th>
                  <th style={th}>Type</th>
                  <th style={th}>Price</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  rooms.slice(0, 6).map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={td}>
                        <b>{r.room_number}</b>
                      </td>
                      <td style={td}>{r.room_type}</td>
                      <td style={td}>${Number(r.base_price).toFixed(2)}</td>
                      <td style={td}>
                        <span style={pill(r.status)}>{r.status}</span>
                      </td>
                    </tr>
                  ))}

                {loading && (
                  <tr>
                    <td colSpan={4} style={{ padding: 10, opacity: 0.8 }}>
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 10, opacity: 0.8 }}>
                      No rooms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10 }}>
            <Link to="/admin/rooms" style={{ color: "#4f46e5" }}>
              Open Rooms Management →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>All Reservations</h3>
        <div style={card}>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#111827" }}>
                  <th style={th}>Ref #</th>
                  <th style={th}>Guest Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Room</th>
                  <th style={th}>Check-In</th>
                  <th style={th}>Check-Out</th>
                  <th style={th}>Guests</th>
                  <th style={th}>Total</th>
                  <th style={th}>Status</th>
                  <th style={th}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  reservations.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={td}>
                        <b>{r.reservation_ref || `#${r.id}`}</b>
                      </td>
                      <td style={td}>{r.guest_name || "N/A"}</td>
                      <td style={td}>{r.email || "N/A"}</td>
                      <td style={td}>{r.room_number || "N/A"}</td>
                      <td style={td}>{r.check_in_date || "N/A"}</td>
                      <td style={td}>{r.check_out_date || "N/A"}</td>
                      <td style={td}>{r.number_of_guests}</td>
                      <td style={td}>${Number(r.total_price || 0).toFixed(2)}</td>
                      <td style={td}>
                        <span style={pill(r.status)}>{r.status}</span>
                      </td>
                      <td style={td}>
                        <span style={pill(r.payment_status)}>{r.payment_status}</span>
                      </td>
                    </tr>
                  ))}

                {loading && (
                  <tr>
                    <td colSpan={10} style={{ padding: 10, opacity: 0.8, textAlign: "center" }}>
                      Loading reservations...
                    </td>
                  </tr>
                )}

                {!loading && reservations.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: 10, opacity: 0.8, textAlign: "center" }}>
                      No reservations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Room Status (Chart)</h3>

          {loading ? (
            <div style={{ padding: 10, opacity: 0.8 }}>Loading...</div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: 10, opacity: 0.8 }}>No data.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "Available", value: rooms.filter((r) => r.status === "available").length, key: "available" },
                { label: "Booked", value: rooms.filter((r) => r.status === "booked").length, key: "booked" },
                { label: "Maintenance", value: rooms.filter((r) => r.status === "maintenance").length, key: "maintenance" },
              ].map((it) => (
                <div key={it.key} style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{it.label}</div>
                    <div style={{ opacity: 0.8 }}>
                      {it.value} / {rooms.length}
                    </div>
                  </div>
                  <div style={barTrack}>
                    <div
                      style={{
                        ...barFill(it.key),
                        width: `${Math.round((it.value / Math.max(1, rooms.length)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Rooms by Type (Chart)</h3>

          {loading ? (
            <div style={{ padding: 10, opacity: 0.8 }}>Loading...</div>
          ) : typeCounts.length === 0 ? (
            <div style={{ padding: 10, opacity: 0.8 }}>No data.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {typeCounts.map((t) => (
                <div key={t.type} style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{t.type}</div>
                    <div style={{ opacity: 0.8 }}>{t.count}</div>
                  </div>
                  <div style={barTrack}>
                    <div
                      style={{
                        ...barFill("type"),
                        width: `${Math.round((t.count / maxTypeCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Price Distribution (Chart)</h3>

          {loading ? (
            <div style={{ padding: 10, opacity: 0.8 }}>Loading...</div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: 10, opacity: 0.8 }}>No data.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {priceBuckets.map((b) => (
                <div key={b.label} style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{b.label}</div>
                    <div style={{ opacity: 0.8 }}>{b.count}</div>
                  </div>
                  <div style={barTrack}>
                    <div
                      style={{
                        ...barFill("price"),
                        width: `${rooms.length ? Math.round((b.count / rooms.length) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, hint }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>{hint}</div>
    </div>
  );
}

const card = {
  background: "#0b1220",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 14,
  color: "#e5e7eb",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
};

const btnWide = {
  ...btn,
  width: "100%",
};

const btnPrimaryWide = {
  ...btnWide,
  border: "1px solid #4f46e5",
  background: "#4f46e5",
  color: "#fff",
};

const btnPrimary = {
  ...btn,
  border: "1px solid #4f46e5",
  background: "#4f46e5",
  color: "#fff",
};

const th = { padding: 10, fontSize: 12, opacity: 0.85 };
const td = { padding: 10, fontSize: 13 };

const pill = (s) => ({
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #374151",
  background:
    s === "available"
      ? "rgba(16,185,129,0.15)"
      : s === "booked"
      ? "rgba(59,130,246,0.15)"
      : "rgba(245,158,11,0.15)",
});

const errorBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
};

const barTrack = {
  width: "100%",
  height: 12,
  borderRadius: 999,
  border: "1px solid #1f2937",
  background: "#111827",
  overflow: "hidden",
};

const barFill = (k) => ({
  height: "100%",
  borderRadius: 999,
  background:
    k === "available"
      ? "rgba(16,185,129,0.85)"
      : k === "booked"
      ? "rgba(59,130,246,0.85)"
      : k === "maintenance"
      ? "rgba(245,158,11,0.85)"
      : k === "price"
      ? "rgba(236,72,153,0.85)"
      : "rgba(79,70,229,0.85)",
});
