import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";

export default function AdminLayout() {
  const nav = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  const logout = () => {
    auth?.logout?.();
    nav("/guest/login");
  };

  const [openNoti, setOpenNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notiErr, setNotiErr] = useState("");
  const [loadingNoti, setLoadingNoti] = useState(false);

  const pollRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !Number(n.is_read)).length,
    [notifications]
  );

  const fmtTime = (createdAt) => {
    if (!createdAt) return "";
    const dt = new Date(createdAt.replace(" ", "T"));
    if (Number.isNaN(dt.getTime())) return createdAt;

    const now = new Date();
    const diff = Math.floor((now - dt) / 1000);

    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;

    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;

    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return dt.toLocaleString();
  };

  const loadNotifications = async (silent = false) => {
    if (!silent) setLoadingNoti(true);
    setNotiErr("");
    try {
      const res = await api.get("/api/notifications/list.php?role=admin");
      const list = res?.data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (e) {
      setNotiErr(e?.message || "Failed to load notifications");
    } finally {
      if (!silent) setLoadingNoti(false);
    }
  };

  const markRead = async (id) => {
    const nid = Number(id);
    if (!nid) return;

    setNotifications((prev) =>
      prev.map((n) => (Number(n.id) === nid ? { ...n, is_read: 1 } : n))
    );

    try {
      await api.post("/api/notifications/read.php", { id: nid });
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (Number(n.id) === nid ? { ...n, is_read: 0 } : n))
      );
    }
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !Number(n.is_read)).map((n) => Number(n.id));
    if (ids.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));

    try {
      await api.post("/api/notifications/read_all.php", { role: "admin" });
    } catch {
      await loadNotifications(true);
    }
  };

  useEffect(() => {
    loadNotifications();

    pollRef.current = setInterval(() => {
      loadNotifications(true);
    }, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!openNoti) return;
    loadNotifications(true);
  }, [openNoti]);

  return (
    <div style={wrap}>
      <aside style={sidebar}>
        <div style={brand}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>ZentraStay</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Admin Panel</div>
        </div>

        <nav style={navWrap}>
          <SideLink to="/admin" label="Dashboard" />
          <SideLink to="/admin/rooms" label="Rooms" />
          <SideLink to="/admin/users" label="Users" />
          <SideLink to="/admin/create" label="Create Room" />
          <SideLink to="/admin/Availability" label="AdminAvailability" />
          <SideLink to="/admin/reservations" label="Reservations" />
          <SideLink to="/admin/chat" label="Message" />
          <SideLink to="/admin/issues" label="Issues" />
          <SideLink to="/admin/reports" label="Reports" />
          <SideLink to="/available-rooms" label="Guest Rooms Page" />
          <SideLink to="/settings" label="Settings" />
        </nav>

        <div style={sideFooter}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Logged as: <b>{user?.email || "Admin"}</b>
          </div>
          <button onClick={logout} style={btnDanger}>
            Logout
          </button>
        </div>
      </aside>

      <main style={main}>
        <header style={topbar}>
          <div>
            <div style={{ fontWeight: 800 }}>Admin</div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>
              {user?.email ? `Welcome, ${user.email}` : "Welcome"}
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => setOpenNoti((s) => !s)}
              style={bellBtn}
              aria-label="Notifications"
              title="Notifications"
            >
              <span style={bellIcon}>🔔</span>
              {unreadCount > 0 && (
                <span style={badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>

            {openNoti && (
              <div style={notiPanel}>
                <div style={notiHeader}>
                  <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                    Notifications
                    {loadingNoti ? <span style={{ fontSize: 12, opacity: 0.7 }}>Loading...</span> : null}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={markAllRead}
                      style={notiSmallBtn}
                      title="Mark all as read"
                    >
                      ✓✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenNoti(false)}
                      style={notiClose}
                      aria-label="Close"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {notiErr ? (
                  <div style={{ padding: 10, fontSize: 13, color: "#fecaca" }}>
                    {notiErr}
                  </div>
                ) : null}

                <div style={notiList}>
                  {notifications.length === 0 ? (
                    <div style={{ opacity: 0.75, fontSize: 13, padding: 10 }}>No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => {
                      const isRead = Number(n.is_read) === 1;
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => markRead(n.id)}
                          style={{
                            ...notiItemBtn,
                            opacity: isRead ? 0.78 : 1,
                          }}
                          title={isRead ? "Read" : "Mark as read"}
                        >
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            {!isRead && <span style={dot} />}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.25 }}>
                                {n.title}
                              </div>
                              <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
                                {fmtTime(n.created_at)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div style={notiFooter}>
                  <NavLink to="/admin/reports" style={notiLink} onClick={() => setOpenNoti(false)}>
                    View all
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </header>

        <div style={content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SideLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      style={({ isActive }) => ({
        ...sideLink,
        background: isActive ? "rgba(79,70,229,0.18)" : "transparent",
        borderColor: isActive ? "rgba(79,70,229,0.55)" : "transparent",
      })}
    >
      {label}
    </NavLink>
  );
}

const wrap = {
  minHeight: "100vh",
  width: "100%",
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  background: "#0b1220",
  color: "#e5e7eb",
  overflow: "visible",
};

const sidebar = {
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
  alignSelf: "start",
  borderRight: "1px solid #1f2937",
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const brand = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 14,
};

const navWrap = {
  display: "grid",
  gap: 10,
};

const sideLink = {
  textDecoration: "none",
  color: "#e5e7eb",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid transparent",
  background: "transparent",
};

const sideFooter = {
  marginTop: "auto",
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 14,
  display: "grid",
  gap: 10,
};

const btnDanger = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
};

const main = { display: "flex", flexDirection: "column", minWidth: 0 };

const topbar = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  height: 56,
  borderBottom: "1px solid #1f2937",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  background: "#0b1220",
};

const content = { padding: 16, minWidth: 0 };

const bellBtn = {
  position: "relative",
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "1px solid #1f2937",
  background: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};

const bellIcon = { fontSize: 16, lineHeight: 1 };

const badge = {
  position: "absolute",
  top: -6,
  right: -6,
  minWidth: 18,
  height: 18,
  padding: "0 6px",
  borderRadius: 999,
  background: "#ef4444",
  color: "#fff",
  fontSize: 11,
  fontWeight: 900,
  display: "grid",
  placeItems: "center",
  border: "2px solid #0b1220",
};

const notiPanel = {
  position: "absolute",
  top: 46,
  right: 0,
  width: 340,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  zIndex: 50,
};

const notiHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid #1f2937",
};

const notiClose = {
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
  borderRadius: 10,
  width: 32,
  height: 32,
  cursor: "pointer",
};

const notiSmallBtn = {
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
  borderRadius: 10,
  width: 36,
  height: 32,
  cursor: "pointer",
  fontWeight: 900,
};

const notiList = { maxHeight: 340, overflowY: "auto" };

const notiItemBtn = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  border: 0,
  borderBottom: "1px solid #1f2937",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const dot = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "#22c55e",
  display: "inline-block",
  marginTop: 4,
  flex: "0 0 auto",
};

const notiFooter = { padding: 10 };

const notiLink = {
  display: "block",
  textDecoration: "none",
  textAlign: "center",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(79,70,229,0.55)",
  background: "rgba(79,70,229,0.18)",
  color: "#e5e7eb",
  fontWeight: 800,
};
