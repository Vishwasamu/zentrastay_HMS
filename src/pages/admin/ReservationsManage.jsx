import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const emptyReservation = {
  id: null,
  reservation_code: "",
  guest_id: "",
  room_id: "",
  check_in_date: "",
  check_out_date: "",
  adults: 2,
  children: 0,
  total_price: 0,
  status: "confirmed",
  special_requests: "",
};

export default function ReservationsManage() {
  const auth = useAuth();
  const [rows, setRows] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyReservation);

  async function loadAll() {
    setErr("");
    setLoading(true);
    try {
      const [r, rm, g] = await Promise.all([
        api.get("/api/reservations/list.php"),
        api.get("/api/rooms/list.php").catch(() => ({ data: [] })),
        api.get("/api/guests/list.php").catch(() => ({ data: [] })),
      ]);

      setRows(r?.data || r?.reservations || []);
      setRooms(rm?.data || rm?.rooms || []);
      setGuests(g?.data || g?.guests || []);
    } catch (e) {
      setErr(e.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth?.authLoading) return; // Wait for auth to load
    if (!auth?.user) return; // Wait for user to be set
    loadAll();
  }, [auth?.authLoading, auth?.user]);

  const statusOptions = useMemo(() => {
    const set = new Set((rows || []).map((x) => x.status).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (rows || [])
      .filter((x) => {
        if (status !== "all" && (x.status || "").toLowerCase() !== status.toLowerCase()) return false;

        if (from) {
          const ci = (x.check_in_date || "").slice(0, 10);
          if (!ci || ci < from) return false;
        }
        if (to) {
          const co = (x.check_out_date || "").slice(0, 10);
          if (!co || co > to) return false;
        }

        if (!qq) return true;
        const hay = [
          x.id,
          x.reservation_code,
          x.guest_id,
          x.room_id,
          x.status,
          x.check_in_date,
          x.check_out_date,
          x.guest_name,
          x.guest_email,
          x.room_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
  }, [rows, q, status, from, to]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const revenue = filtered.reduce((sum, x) => sum + Number(x.total_price || 0), 0);
    return { count, revenue };
  }, [filtered]);

  function roomLabel(id) {
    const r = rooms.find((x) => String(x.id) === String(id));
    if (!r) return id ? `Room #${id}` : "";
    return r.room_number ? `Room ${r.room_number}` : `Room #${r.id}`;
  }

  function guestLabel(id) {
    const g = guests.find((x) => String(x.id) === String(id));
    if (!g) return id ? `Guest #${id}` : "";
    const name = [g.first_name, g.last_name].filter(Boolean).join(" ").trim();
    return name || g.email || `Guest #${g.id}`;
  }

  function openCreate() {
    setErr("");
    setForm(emptyReservation);
    setOpen(true);
  }

  function openEdit(row) {
    setErr("");
    setForm({
      id: row.id ?? null,
      reservation_code: row.reservation_code ?? "",
      guest_id: row.guest_id ?? "",
      room_id: row.room_id ?? "",
      check_in_date: (row.check_in_date || "").slice(0, 10),
      check_out_date: (row.check_out_date || "").slice(0, 10),
      adults: Number(row.adults ?? 2),
      children: Number(row.children ?? 0),
      total_price: Number(row.total_price ?? 0),
      status: row.status ?? "confirmed",
      special_requests: row.special_requests ?? "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setForm(emptyReservation);
  }

  async function save() {
    setErr("");

    if (!form.guest_id) return setErr("guest_id required");
    if (!form.room_id) return setErr("room_id required");
    if (!form.check_in_date) return setErr("check_in_date required");
    if (!form.check_out_date) return setErr("check_out_date required");
    if (form.check_out_date <= form.check_in_date) return setErr("check_out_date must be after check_in_date");
    if (Number(form.adults) <= 0) return setErr("adults must be > 0");
    if (Number(form.total_price) < 0) return setErr("total_price must be >= 0");

    setSaving(true);
    try {
      const payload = {
        ...form,
        guest_id: Number(form.guest_id),
        room_id: Number(form.room_id),
        adults: Number(form.adults),
        children: Number(form.children),
        total_price: Number(form.total_price),
      };

      if (form.id) {
        await api.put("/api/reservations/update.php", payload);
      } else {
        await api.post("/api/reservations/create.php", payload);
      }

      closeModal();
      await loadAll();
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    const ok = window.confirm(`Delete reservation ${row.reservation_code || row.id}?`);
    if (!ok) return;
    setErr("");
    try {
      await api.del(`/api/reservations/delete.php?id=${encodeURIComponent(row.id)}`);
      await loadAll();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  return (
    <div className="zs-page">
      <style>{`
        :root{
          --bg:#0b1220;
          --panel:#0f172a;
          --panel2:#111c33;
          --border:#1f2a44;
          --text:#e5e7eb;
          --muted:#9ca3af;
          --primary:#6366f1;
          --success:#10b981;
          --warning:#f59e0b;
          --danger:#ef4444;
          --shadow: 0 18px 45px rgba(0,0,0,.35);
        }

        .zs-page{
          min-height: 100vh;
          padding: 18px;
          background: radial-gradient(1100px 600px at 20% -10%, rgba(99,102,241,.20), transparent 60%),
                      radial-gradient(900px 500px at 95% 10%, rgba(16,185,129,.14), transparent 55%),
                      var(--bg);
          color: var(--text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        .zs-top{
          display:flex;
          gap:14px;
          flex-wrap:wrap;
          align-items:flex-end;
          justify-content:space-between;
        }

        .zs-title{
          font-size: 22px;
          font-weight: 800;
          letter-spacing: .2px;
        }

        .zs-sub{
          margin-top: 4px;
          font-size: 13px;
          color: var(--muted);
        }

        .zs-controls{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          align-items:flex-end;
        }

        .zs-field{
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .zs-label{
          font-size: 11px;
          color: var(--muted);
        }

        .zs-input, .zs-select, .zs-textarea{
          border: 1px solid var(--border);
          background: rgba(255,255,255,.03);
          color: var(--text);
          border-radius: 12px;
          outline: none;
          transition: .15s;
        }

        .zs-input:focus, .zs-select:focus, .zs-textarea:focus{
          border-color: rgba(99,102,241,.55);
          box-shadow: 0 0 0 4px rgba(99,102,241,.14);
        }

        .zs-input{
          height: 40px;
          padding: 0 12px;
          width: 100%;
        }

        .zs-select{
          height: 40px;
          padding: 0 12px;
          cursor: pointer;
        }

        .zs-textarea{
          padding: 10px 12px;
          min-height: 90px;
        }

        .zs-btn{
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,.04);
          color: var(--text);
          cursor:pointer;
          transition: .15s;
        }
        .zs-btn:hover{ background: rgba(255,255,255,.07); }

        .zs-btn-primary{
          border-color: rgba(99,102,241,.45);
          background: rgba(99,102,241,.18);
        }
        .zs-btn-primary:hover{
          background: rgba(99,102,241,.26);
        }

        .zs-btn-danger{
          border-color: rgba(239,68,68,.35);
          background: rgba(239,68,68,.12);
          color: #fecaca;
        }
        .zs-btn-danger:hover{
          background: rgba(239,68,68,.20);
        }

        .zs-btn-ghost{
          background: rgba(255,255,255,.03);
        }
        .zs-btn-ghost:hover{
          background: rgba(255,255,255,.06);
        }

        .zs-alert{
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,.35);
          background: rgba(239,68,68,.10);
          padding: 12px 14px;
          color: #fecaca;
          font-size: 13px;
        }

        .zs-table-card{
          margin-top: 14px;
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: var(--shadow);
          overflow:hidden;
        }

        .zs-table-wrap{
          overflow:auto;
        }

        .zs-table{
          width:100%;
          min-width: 980px;
          border-collapse: collapse;
          font-size: 13px;
        }

        .zs-table thead th{
          text-align:left;
          padding: 12px 14px;
          font-size: 11px;
          color: var(--muted);
          background: rgba(255,255,255,.03);
          position: sticky;
          top: 0;
          z-index: 1;
          border-bottom: 1px solid rgba(31,42,68,.95);
          letter-spacing: .2px;
        }

        .zs-table tbody td{
          padding: 12px 14px;
          border-bottom: 1px solid rgba(31,42,68,.55);
          color: var(--text);
          vertical-align: top;
        }

        .zs-table tbody tr:hover td{
          background: rgba(255,255,255,.03);
        }

        .zs-pill{
          display:inline-flex;
          align-items:center;
          gap: 6px;
          border: 1px solid rgba(31,42,68,.95);
          background: rgba(255,255,255,.03);
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          color: var(--text);
          text-transform: lowercase;
          white-space: nowrap;
        }

        .zs-pill.confirmed{ border-color: rgba(16,185,129,.35); background: rgba(16,185,129,.10); color: #d1fae5; }
        .zs-pill.pending{ border-color: rgba(245,158,11,.35); background: rgba(245,158,11,.10); color: #ffedd5; }
        .zs-pill.checked_in{ border-color: rgba(99,102,241,.35); background: rgba(99,102,241,.10); color: #e0e7ff; }
        .zs-pill.checked_out{ border-color: rgba(156,163,175,.35); background: rgba(156,163,175,.10); color: #e5e7eb; }
        .zs-pill.cancelled{ border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.10); color: #fecaca; }

        .zs-actions{
          display:flex;
          justify-content:flex-end;
          gap: 10px;
        }

        .zs-modal-backdrop{
          position: fixed;
          inset: 0;
          z-index: 50;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 14px;
          background: rgba(0,0,0,.55);
        }

        .zs-modal{
          width: 100%;
          max-width: 920px;
          border-radius: 18px;
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border: 1px solid var(--border);
          box-shadow: 0 25px 70px rgba(0,0,0,.55);
          overflow:hidden;
        }

        .zs-modal-head{
          padding: 14px 16px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(31,42,68,.95);
        }

        .zs-modal-title{
          font-size: 16px;
          font-weight: 800;
          letter-spacing: .2px;
        }

        .zs-modal-desc{
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .zs-modal-body{
          padding: 14px 16px 16px;
        }

        .zs-grid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width: 760px){
          .zs-grid{
            grid-template-columns: repeat(2, minmax(0,1fr));
          }
        }
        .zs-span-2{ grid-column: 1 / -1; }

        .zs-footer{
          padding: 14px 16px 16px;
          border-top: 1px solid rgba(31,42,68,.95);
          display:flex;
          justify-content:flex-end;
          gap: 10px;
        }
      `}</style>

      <div className="zs-top">
        <div>
          <div className="zs-title">Reservations</div>
          <div className="zs-sub">
            {totals.count} records • Total Revenue: {totals.revenue.toFixed(2)}
          </div>
        </div>

        <div className="zs-controls">
          <div className="zs-field">
            <div className="zs-label">Search</div>
            <input
              className="zs-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="code, guest, room, dates..."
            />
          </div>

          <div className="zs-field">
            <div className="zs-label">Status</div>
            <select className="zs-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="zs-field">
            <div className="zs-label">From</div>
            <input type="date" className="zs-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className="zs-field">
            <div className="zs-label">To</div>
            <input type="date" className="zs-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <button onClick={openCreate} className="zs-btn zs-btn-primary">
            + New
          </button>
        </div>
      </div>

      {err ? <div className="zs-alert">{err}</div> : null}

      <div className="zs-table-card">
        {loading ? (
          <div style={{ padding: 18, color: "var(--muted)", fontSize: 13 }}>Loading...</div>
        ) : (
          <div className="zs-table-wrap">
            <table className="zs-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.reservation_code || `#${r.id}`}</td>
                    <td>{r.guest_name || guestLabel(r.guest_id)}</td>
                    <td>{r.room_number || roomLabel(r.room_id)}</td>
                    <td>{(r.check_in_date || "").slice(0, 10)}</td>
                    <td>{(r.check_out_date || "").slice(0, 10)}</td>
                    <td>
                      {Number(r.adults || 0) + Number(r.children || 0)}{" "}
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        ({r.adults || 0}A/{r.children || 0}C)
                      </span>
                    </td>
                    <td>{Number(r.total_price || 0).toFixed(2)}</td>
                    <td>
                      <span className={`zs-pill ${(r.status || "confirmed").toLowerCase()}`}>
                        {r.status || "confirmed"}
                      </span>
                    </td>
                    <td>
                      <div className="zs-actions">
                        <button className="zs-btn zs-btn-ghost" onClick={() => openEdit(r)}>
                          Edit
                        </button>
                        <button className="zs-btn zs-btn-danger" onClick={() => remove(r)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="zs-empty" style={{ padding: 22, textAlign: "center", color: "var(--muted)" }}>
                      No reservations found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <div className="zs-modal-backdrop">
          <div className="zs-modal">
            <div className="zs-modal-head">
              <div>
                <div className="zs-modal-title">{form.id ? "Edit Reservation" : "New Reservation"}</div>
                <div className="zs-modal-desc">Create or update reservation details.</div>
              </div>
              <button className="zs-btn zs-btn-ghost" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="zs-modal-body">
              <div className="zs-grid">
                <div className="zs-field">
                  <div className="zs-label">Reservation Code</div>
                  <input
                    className="zs-input"
                    value={form.reservation_code}
                    onChange={(e) => setForm((p) => ({ ...p, reservation_code: e.target.value }))}
                    placeholder="Optional (auto-generate in backend)"
                  />
                </div>

                <div className="zs-field">
                  <div className="zs-label">Status</div>
                  <select
                    className="zs-select"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="confirmed">confirmed</option>
                    <option value="pending">pending</option>
                    <option value="checked_in">checked_in</option>
                    <option value="checked_out">checked_out</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>

                <div className="zs-field">
                  <div className="zs-label">Guest</div>
                  <select
                    className="zs-select"
                    value={form.guest_id}
                    onChange={(e) => setForm((p) => ({ ...p, guest_id: e.target.value }))}
                  >
                    <option value="">Select guest</option>
                    {guests.map((g) => {
                      const name = [g.first_name, g.last_name].filter(Boolean).join(" ").trim();
                      const label = name || g.email || `Guest #${g.id}`;
                      return (
                        <option key={g.id} value={g.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="zs-field">
                  <div className="zs-label">Room</div>
                  <select
                    className="zs-select"
                    value={form.room_id}
                    onChange={(e) => setForm((p) => ({ ...p, room_id: e.target.value }))}
                  >
                    <option value="">Select room</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.room_number ? `Room ${r.room_number}` : `Room #${r.id}`}{" "}
                        {r.room_type ? `• ${r.room_type}` : ""} {r.status ? `• ${r.status}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="zs-field">
                  <div className="zs-label">Check-in</div>
                  <input
                    type="date"
                    className="zs-input"
                    value={form.check_in_date}
                    onChange={(e) => setForm((p) => ({ ...p, check_in_date: e.target.value }))}
                  />
                </div>

                <div className="zs-field">
                  <div className="zs-label">Check-out</div>
                  <input
                    type="date"
                    className="zs-input"
                    value={form.check_out_date}
                    onChange={(e) => setForm((p) => ({ ...p, check_out_date: e.target.value }))}
                  />
                </div>

                <div className="zs-field">
                  <div className="zs-label">Adults</div>
                  <input
                    type="number"
                    min="1"
                    className="zs-input"
                    value={form.adults}
                    onChange={(e) => setForm((p) => ({ ...p, adults: e.target.value }))}
                  />
                </div>

                <div className="zs-field">
                  <div className="zs-label">Children</div>
                  <input
                    type="number"
                    min="0"
                    className="zs-input"
                    value={form.children}
                    onChange={(e) => setForm((p) => ({ ...p, children: e.target.value }))}
                  />
                </div>

                <div className="zs-field zs-span-2">
                  <div className="zs-label">Total Price</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="zs-input"
                    value={form.total_price}
                    onChange={(e) => setForm((p) => ({ ...p, total_price: e.target.value }))}
                  />
                </div>

                <div className="zs-field zs-span-2">
                  <div className="zs-label">Special Requests</div>
                  <textarea
                    className="zs-textarea"
                    value={form.special_requests}
                    onChange={(e) => setForm((p) => ({ ...p, special_requests: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="zs-footer">
              <button className="zs-btn zs-btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button className="zs-btn zs-btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
