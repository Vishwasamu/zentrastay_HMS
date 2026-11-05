import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestLayout() {
  const nav = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  const logout = () => {
    auth?.logout?.();
    nav("/guest/login");
  };

  return (
    <div style={wrap}>
      <aside style={sidebar}>
        <div style={brand}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>ZentraStay</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Guest Panel</div>
        </div>

        <nav style={navWrap}>
          <SideLink to="/guest/dashboard" label="Dashboard" />
          <SideLink to="/guest/profile" label="My Profile" />
          <SideLink to="/guest/my-bookings" label="My Bookings" />
          <SideLink to="/guest/chat" label="Live Chat" />
          <SideLink to="/guest/issues" label="Report Issue" />
          <SideLink to="/guest/help" label="Help Center" />

          <div style={divider} />

          <SideLink to="/available-rooms" label="Book a Room" />
          <SideLink to="/" label="Go to Home" />
        </nav>

        <div style={sideFooter}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Logged as: <b>{user?.email || "Guest"}</b>
          </div>
          <button onClick={logout} style={btnDanger}>
            Logout
          </button>
        </div>
      </aside>

      <main style={main}>
        <header style={topbar}>
          <div style={{ fontWeight: 800 }}>Guest</div>
          <div style={{ opacity: 0.85, fontSize: 13 }}>
            {user?.email ? `Welcome, ${user.email}` : "Welcome"}
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
      end={to === "/guest"}
      style={({ isActive }) => ({
        ...sideLink,
        background: isActive ? "rgba(34,197,94,0.18)" : "transparent",
        borderColor: isActive ? "rgba(34,197,94,0.55)" : "transparent",
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

const divider = {
  height: 1,
  background: "#1f2937",
  margin: "6px 4px",
  opacity: 0.9,
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
