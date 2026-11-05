import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminStaffLayout() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/guest/login" replace />;

  const role = user.role; // "ADMIN" | "STAFF" | "FRONTDESK" | "HOUSEKEEPING" | "MANAGER"

  const menu = getMenuByRole(role);

  return (
    <div style={wrap}>
      <aside style={sidebar}>
        <div style={brand}>
          ZentraStay <span style={{ opacity: 0.75, fontSize: 12 }}>({role})</span>
        </div>

        <nav style={{ marginTop: 12 }}>
          {menu.map((m) =>
            m.type === "group" ? (
              <div key={m.title} style={{ marginTop: 10 }}>
                <div style={groupTitle}>{m.title}</div>
                <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                  {m.items.map((it) => (
                    <SideItem key={it.to} to={it.to} label={it.label} />
                  ))}
                </div>
              </div>
            ) : (
              <SideItem key={m.to} to={m.to} label={m.label} />
            )
          )}
        </nav>
      </aside>

      <main style={main}>
        <div style={content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SideItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/panel"}
      style={({ isActive }) => ({
        ...link,
        background: isActive ? "rgba(79,70,229,0.18)" : "transparent",
        borderColor: isActive ? "rgba(79,70,229,0.55)" : "transparent",
      })}
    >
      {label}
    </NavLink>
  );
}

function getMenuByRole(role) {
  if (role === "ADMIN") {
    return [
      { to: "/panel", label: "Dashboard" },
      { type: "group", title: "Manage", items: [
        { to: "/panel/rooms", label: "Rooms" },
        { to: "/panel/users", label: "Users" },
      ]},
      { type: "group", title: "Operations", items: [
        { to: "/panel/reservations", label: "Reservations" },
        { to: "/panel/invoices", label: "Invoices" },
        { to: "/panel/housekeeping", label: "Housekeeping" },
        { to: "/panel/frontdesk", label: "Front Desk" },
      ]},
      { type: "group", title: "Settings", items: [
        { to: "/panel/templates", label: "Templates" },
        { to: "/panel/system", label: "System" },
      ]},
    ];
  }

  if (role === "MANAGER") {
    return [
      { to: "/panel", label: "Dashboard" },
      { type: "group", title: "Operations", items: [
        { to: "/panel/reservations", label: "Reservations" },
        { to: "/panel/invoices", label: "Invoices" },
        { to: "/panel/reports", label: "Reports" },
      ]},
    ];
  }

  if (role === "FRONTDESK") {
    return [
      { to: "/panel", label: "Dashboard" },
      { type: "group", title: "Front Desk", items: [
        { to: "/panel/frontdesk/checkin", label: "Check-in" },
        { to: "/panel/frontdesk/checkout", label: "Check-out" },
        { to: "/panel/reservations", label: "Reservations" },
      ]},
    ];
  }

  if (role === "HOUSEKEEPING") {
    return [
      { to: "/panel", label: "Dashboard" },
      { type: "group", title: "Housekeeping", items: [
        { to: "/panel/housekeeping/issues", label: "Issues" },
        { to: "/panel/housekeeping/tasks", label: "Tasks" },
      ]},
    ];
  }

  return [
    { to: "/panel", label: "Dashboard" },
    { type: "group", title: "Staff", items: [
      { to: "/panel/reservations", label: "Reservations" },
      { to: "/panel/housekeeping", label: "Housekeeping" },
    ]},
  ];
}

const wrap = { minHeight: "100vh", width: "100%", display: "flex", background: "#0b1220" };

const sidebar = {
  width: 260,
  padding: 14,
  borderRight: "1px solid #1f2937",
  background: "#0b1220",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
};

const brand = {
  fontWeight: 900,
  fontSize: 18,
  color: "#e5e7eb",
  padding: "10px 10px",
  borderRadius: 12,
  border: "1px solid #1f2937",
  background: "#111827",
};

const groupTitle = { fontSize: 12, opacity: 0.75, marginTop: 8 };

const link = {
  display: "block",
  padding: "10px 10px",
  borderRadius: 12,
  border: "1px solid transparent",
  color: "#e5e7eb",
  textDecoration: "none",
};

const main = { flex: 1, minWidth: 0 };
const content = { padding: 14 };
