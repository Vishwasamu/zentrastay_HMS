import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const emptyRoom = {
  id: null,
  room_number: "",
  floor: "",
  room_type: "Standard",
  description: "",
  capacity: 2,
  base_price: 0,
  status: "available",
  image_url: "",
};

export default function RoomsManage() {
  const auth = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyRoom);

  const roomTypes = useMemo(() => {
    const s = new Set(rooms.map((r) => r.room_type).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [rooms]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchQ =
        !qq ||
        String(r.room_number || "").toLowerCase().includes(qq) ||
        String(r.room_type || "").toLowerCase().includes(qq);

      const matchType = type === "all" ? true : r.room_type === type;
      const matchStatus = status === "all" ? true : r.status === status;

      return matchQ && matchType && matchStatus;
    });
  }, [rooms, q, type, status]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/rooms/list");
      setRooms(res?.rooms || []);
    } catch (e) {
      setErr(e?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.authLoading) return; // Wait for auth to load
    if (!auth?.user) return; // Wait for user to be set
    load();
  }, [auth?.authLoading, auth?.user]);

  const openCreate = () => {
    setForm({ ...emptyRoom });
    setOpen(true);
  };

  const openEdit = (r) => {
    setForm({
      id: r.id ?? null,
      room_number: r.room_number ?? "",
      floor: r.floor ?? "",
      room_type: r.room_type ?? "Standard",
      description: r.description ?? "",
      capacity: Number(r.capacity ?? 2),
      base_price: Number(r.base_price ?? 0),
      status: r.status ?? "available",
      image_url: r.image_url ?? "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setForm({ ...emptyRoom });
  };

  const saveRoom = async () => {
    setErr("");

    if (!String(form.room_number).trim()) return setErr("Room number required");
    if (!String(form.room_type).trim()) return setErr("Room type required");
    if (!form.capacity || Number(form.capacity) <= 0) return setErr("Capacity invalid");
    if (Number(form.base_price) < 0) return setErr("Price invalid");

    setSaving(true);
    try {
      const payload = {
        id: form.id,
        room_number: String(form.room_number).trim(),
        floor: String(form.floor || "").trim(),
        room_type: String(form.room_type).trim(),
        description: String(form.description || "").trim(),
        capacity: Number(form.capacity),
        base_price: Number(form.base_price),
        status: String(form.status || "available").trim(),
        image_url: String(form.image_url || "").trim(),
      };

      if (payload.id) {
        await api.post("/rooms/update", payload);
      } else {
        await api.post("/rooms/create", payload);
      }

      await load();
      closeModal();
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!confirm("Delete this room?")) return;
    setErr("");
    try {
      await api.del(`/rooms/delete?id=${id}`);
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Rooms Management</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.8 }}>Manage rooms, pricing and availability.</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>+ Add Room</button>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by room number / type..."
          style={input}
        />

        <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
          {roomTypes.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
          <option value="all">All Status</option>
          <option value="available">available</option>
          <option value="booked">booked</option>
          <option value="maintenance">maintenance</option>
        </select>

        <button onClick={load} style={btn}>Refresh</button>
      </div>

      {err && <div style={errorBox}>{err}</div>}

      <div style={{ marginTop: 16, border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, background: "#111827", color: "#fff", display: "flex", justifyContent: "space-between" }}>
          <b>Rooms</b>
          <span style={{ opacity: 0.85 }}>{loading ? "Loading..." : `${filtered.length} items`}</span>
        </div>

        <div style={{ width: "100%", overflowX: "auto", background: "#0b1220" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#e5e7eb" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #1f2937" }}>
                <th style={th}>#</th>
                <th style={th}>Room No</th>
                <th style={th}>Floor</th>
                <th style={th}>Type</th>
                <th style={th}>Capacity</th>
                <th style={th}>Price</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 14, opacity: 0.8 }}>No rooms found.</td>
                </tr>
              )}

              {filtered.map((r, idx) => (
                <tr key={r.id ?? `${r.room_number}-${idx}`} style={{ borderBottom: "1px solid #111827" }}>
                  <td style={td}>{idx + 1}</td>
                  <td style={td}><b>{r.room_number}</b></td>
                  <td style={td}>{r.floor ?? "-"}</td>
                  <td style={td}>{r.room_type}</td>
                  <td style={td}>{r.capacity}</td>
                  <td style={td}>${Number(r.base_price).toFixed(2)}</td>
                  <td style={td}>
                    <span style={pill(r.status)}>{r.status}</span>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => openEdit(r)} style={btnSmall}>Edit</button>
                      <button onClick={() => deleteRoom(r.id)} style={btnDangerSmall}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {open && (
        <div style={modalBackdrop} onClick={closeModal}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{form.id ? "Edit Room" : "Add Room"}</h3>
              <button onClick={closeModal} style={btnSmall}>X</button>
            </div>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr", marginTop: 14 }}>
              <div>
                <label style={label}>Room Number</label>
                <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} style={input} />
              </div>

              <div>
                <label style={label}>Floor</label>
                <input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} style={input} />
              </div>

              <div>
                <label style={label}>Room Type</label>
                <input value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} style={input} />
              </div>

              <div>
                <label style={label}>Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Base Price</label>
                <input
                  type="number"
                  value={form.base_price}
                  onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={input}>
                  <option value="available">available</option>
                  <option value="booked">booked</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={label}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...input, minHeight: 90, resize: "vertical" }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={label}>Image URL (optional)</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} style={input} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={closeModal} style={btn}>Cancel</button>
              <button onClick={saveRoom} style={btnPrimary} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
              Backend routes needed for full CRUD: <b>/rooms/create</b>, <b>/rooms/update</b>, <b>/rooms/delete</b>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* styles */
const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#0b1220",
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

const btnPrimary = {
  ...btn,
  border: "1px solid #4f46e5",
  background: "#4f46e5",
  color: "#fff",
};

const btnSmall = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
};

const btnDangerSmall = {
  ...btnSmall,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "#fff",
};

const th = { padding: 12, fontSize: 13, opacity: 0.9 };
const td = { padding: 12, fontSize: 13 };

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

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modal = {
  width: "100%",
  maxWidth: 680,
  background: "#0b1220",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 16,
  color: "#e5e7eb",
};

const label = { display: "block", fontSize: 12, opacity: 0.85, fontWeight: 800, marginBottom: 6 };
