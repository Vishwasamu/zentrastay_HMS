import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthGuard";
import { api } from "../../lib/api";

export default function UsersManage() {
  const auth = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const loadUsers = async () => {
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const res = await api.get("/admin/users/list");
      setUsers(res.users || []);
    } catch (e) {
      setErr(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.authLoading) return;
    loadUsers();
  }, [auth.authLoading]);

  const createUser = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.role) {
      setErr("First name, last name, email, password, and role required");
      return;
    }

    try {
      await api.post("/admin/users/create", form);
      setOk("User created successfully");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "STAFF",
      });
      loadUsers();
    } catch (e) {
      setErr(e.message || "Failed to create user");
    }
  };

  if (auth.authLoading) {
    return (
      <div style={{ padding: 10 }}>
        <p style={{ opacity: 0.8 }}>Verifying authentication...</p>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div style={{ padding: 10 }}>
        <p style={{ opacity: 0.8 }}>You must be logged in as an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <h2 style={{ margin: "0 0 6px" }}>User Management</h2>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Create Admin / Manager / Frontdesk / Housekeeping / Staff accounts and manage users.
      </p>

      <div style={grid}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Create User</h3>

          <form onSubmit={createUser} style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={label}>First Name</div>
              <input
                style={input}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="John"
              />
            </div>

            <div>
              <div style={label}>Last Name</div>
              <input
                style={input}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>

            <div>
              <div style={label}>Email</div>
              <input
                style={input}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@zentrastay.com"
              />
            </div>

            <div>
              <div style={label}>Password</div>
              <input
                style={input}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div>
              <div style={label}>Role</div>
              <select
                style={input}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="FRONTDESK">FRONTDESK</option>
                <option value="HOUSEKEEPING">HOUSEKEEPING</option>
                <option value="STAFF">STAFF</option>
                <option value="GUEST">GUEST</option>
              </select>
            </div>

            {err && <div style={errorBox}>{err}</div>}
            {ok && <div style={okBox}>{ok}</div>}

            <button type="submit" style={btnPrimary}>
              Create User
            </button>
          </form>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Users List</h3>
            <button onClick={loadUsers} style={btn}>Refresh</button>
          </div>

          {loading && <p style={{ opacity: 0.8 }}>Loading...</p>}

          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  users.map((u) => (
                    <tr key={u.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={td}>{u.id}</td>
                      <td style={td}>{u.name}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={pill(u.role)}>{u.role}</span>
                      </td>
                      <td style={td}>{u.status || "-"}</td>
                    </tr>
                  ))}

                {!loading && users.length === 0 && (
                  <tr>
                    <td style={{ padding: 12, opacity: 0.8 }} colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Note: Only ADMIN can access these endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}

/* styles */
const grid = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
};

const card = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 14,
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

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  cursor: "pointer",
};

const btnPrimary = {
  ...btn,
  width: "100%",
  border: "1px solid #4f46e5",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 800,
};

const table = { width: "100%", borderCollapse: "collapse", marginTop: 6 };
const th = { textAlign: "left", padding: 10, fontSize: 12, opacity: 0.85 };
const td = { padding: 10, fontSize: 13 };

const pill = (role) => ({
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #374151",
  background:
    role === "ADMIN"
      ? "rgba(79,70,229,0.18)"
      : role === "MANAGER"
      ? "rgba(16,185,129,0.15)"
      : role === "FRONTDESK"
      ? "rgba(59,130,246,0.15)"
      : role === "HOUSEKEEPING"
      ? "rgba(245,158,11,0.15)"
      : "rgba(148,163,184,0.15)",
});

const errorBox = {
  padding: 10,
  borderRadius: 12,
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  fontSize: 13,
};

const okBox = {
  padding: 10,
  borderRadius: 12,
  background: "rgba(16,185,129,0.15)",
  border: "1px solid rgba(16,185,129,0.35)",
  color: "#bbf7d0",
  fontSize: 13,
};
