import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuthGuard";

const emptyUpdate = {
  status: "open",
  priority: "medium",
  assigned_to: "",
  admin_note: "",
};

export default function AdminGuestIssues() {
  const auth = useAuth();
  const [rows, setRows] = useState([]);
  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [room, setRoom] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(emptyUpdate);

  async function loadAll() {
    setErr("");
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        api.get("/api/issues/list.php"),
        api.get("/api/staff/list.php").catch(() => ({ data: [] })),
      ]);
      setRows(a?.data || a?.issues || []);
      setStaff(s?.data || s?.staff || []);
    } catch (e) {
      setErr(e.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth?.authLoading) return;
    if (!auth?.user) return;
    loadAll();
  }, [auth?.authLoading, auth?.user]);

  const statusOptions = useMemo(() => {
    const set = new Set((rows || []).map((x) => x.status).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const priorityOptions = useMemo(() => {
    const set = new Set((rows || []).map((x) => x.priority).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (rows || [])
      .filter((x) => {
        const st = String(x.status || "open").toLowerCase();
        const pr = String(x.priority || "medium").toLowerCase();

        if (status !== "all" && st !== String(status).toLowerCase()) return false;
        if (priority !== "all" && pr !== String(priority).toLowerCase()) return false;

        if (room.trim()) {
          const rn = String(x.room_number || "").toLowerCase();
          const rid = String(x.room_id || "").toLowerCase();
          const want = room.trim().toLowerCase();
          if (!rn.includes(want) && !rid.includes(want)) return false;
        }

        const created = (x.created_at || x.reported_at || x.date || "").slice(0, 10);
        if (from && created && created < from) return false;
        if (to && created && created > to) return false;

        if (!qq) return true;
        const hay = [
          x.id,
          x.title,
          x.subject,
          x.description,
          x.status,
          x.priority,
          x.room_number,
          x.room_id,
          x.guest_name,
          x.guest_email,
          x.guest_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
  }, [rows, q, status, priority, room, from, to]);

  function openUpdate(issue) {
    setErr("");
    setActive(issue);
    setForm({
      status: issue.status || "open",
      priority: issue.priority || "medium",
      assigned_to: issue.assigned_to || issue.assigned_staff_id || "",
      admin_note: issue.admin_note || issue.note || "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setActive(null);
    setForm(emptyUpdate);
  }

  async function save() {
    if (!active?.id) return;
    setErr("");
    setSaving(true);
    try {
      await api.put("/api/issues/update.php", {
        id: active.id,
        status: form.status,
        priority: form.priority,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        admin_note: form.admin_note,
      });
      closeModal();
      await loadAll();
    } catch (e) {
      setErr(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function markResolved(issue) {
    setErr("");
    try {
      await api.put("/api/issues/update.php", { id: issue.id, status: "resolved" });
      await loadAll();
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  }

  async function remove(issue) {
    const ok = window.confirm(`Delete issue #${issue.id}?`);
    if (!ok) return;
    setErr("");
    try {
      await api.del(`/api/issues/delete.php?id=${encodeURIComponent(issue.id)}`);
      await loadAll();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  const badgeClass = (type, value) => {
    const v = String(value || "").toLowerCase();
    if (type === "priority") {
      if (v === "urgent") return "zs-pill zs-pill-danger";
      if (v === "high") return "zs-pill zs-pill-warning";
      if (v === "low") return "zs-pill zs-pill-muted";
      return "zs-pill zs-pill-info";
    }
    if (type === "status") {
      if (v === "resolved" || v === "closed") return "zs-pill zs-pill-success";
      if (v === "in_progress") return "zs-pill zs-pill-info";
      return "zs-pill";
    }
    return "zs-pill";
  };

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
          display:grid;
          gap:10px;
          align-items:end;
          grid-template-columns: 1fr;
          width: 100%;
        }
        @media(min-width: 920px){
          .zs-controls{
            width: auto;
            grid-template-columns: 240px 140px 140px 120px 140px 140px auto;
          }
        }

        .zs-field{
          display:flex;
          flex-direction:column;
          gap:6px;
          min-width: 0;
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
          width: 100%;
          cursor: pointer;
        }

        .zs-textarea{
          padding: 10px 12px;
          min-height: 110px;
          width: 100%;
          resize: vertical;
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
          white-space: nowrap;
        }
        .zs-btn:hover{ background: rgba(255,255,255,.07); }
        .zs-btn:disabled{ opacity:.65; cursor:not-allowed; }

        .zs-btn-primary{
          border-color: rgba(99,102,241,.45);
          background: rgba(99,102,241,.18);
        }
        .zs-btn-primary:hover{ background: rgba(99,102,241,.26); }

        .zs-btn-ghost{
          background: rgba(255,255,255,.03);
        }
        .zs-btn-ghost:hover{ background: rgba(255,255,255,.06); }

        .zs-btn-danger{
          border-color: rgba(239,68,68,.35);
          background: rgba(239,68,68,.12);
          color: #fecaca;
        }
        .zs-btn-danger:hover{ background: rgba(239,68,68,.20); }

        .zs-alert{
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,.35);
          background: rgba(239,68,68,.10);
          padding: 12px 14px;
          color: #fecaca;
          font-size: 13px;
        }

        .zs-card{
          margin-top: 14px;
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: var(--shadow);
          overflow:hidden;
        }

        .zs-table-wrap{ overflow:auto; }

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

        .zs-col-issue{
          min-width: 420px;
        }
        .zs-col-actions{
          width: 280px;
        }

        .zs-issue-title{
          font-weight: 800;
          letter-spacing: .1px;
        }
        .zs-issue-desc{
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 560px;
        }

        .zs-muted{
          color: var(--muted);
          font-size: 12px;
        }

        .zs-pill{
          display:inline-flex;
          align-items:center;
          border: 1px solid rgba(31,42,68,.95);
          background: rgba(255,255,255,.03);
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          color: var(--text);
          white-space: nowrap;
          text-transform: lowercase;
        }
        .zs-pill-success{ border-color: rgba(16,185,129,.35); background: rgba(16,185,129,.10); color: #d1fae5; }
        .zs-pill-warning{ border-color: rgba(245,158,11,.35); background: rgba(245,158,11,.10); color: #ffedd5; }
        .zs-pill-danger{ border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.10); color: #fecaca; }
        .zs-pill-info{ border-color: rgba(99,102,241,.35); background: rgba(99,102,241,.10); color: #e0e7ff; }
        .zs-pill-muted{ border-color: rgba(156,163,175,.35); background: rgba(156,163,175,.10); color: #e5e7eb; }

        .zs-actions{
          display:flex;
          justify-content:flex-end;
          gap: 10px;
          flex-wrap: wrap;
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

        .zs-modal-body{ padding: 14px 16px 16px; }

        .zs-grid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width: 760px){
          .zs-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        .zs-span-2{ grid-column: 1 / -1; }

        .zs-footer{
          padding: 14px 16px 16px;
          border-top: 1px solid rgba(31,42,68,.95);
          display:flex;
          justify-content:space-between;
          gap: 10px;
          align-items:center;
          flex-wrap: wrap;
        }
      `}</style>

      <div className="zs-top">
        <div>
          <div className="zs-title">Guest Issues</div>
          <div className="zs-sub">View, assign, and update reported guest issues.</div>
        </div>

        <div className="zs-controls">
          <div className="zs-field">
            <div className="zs-label">Search</div>
            <input className="zs-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="room, guest, title..." />
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
            <div className="zs-label">Priority</div>
            <select className="zs-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="zs-field">
            <div className="zs-label">Room</div>
            <input className="zs-input" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="101" />
          </div>

          <div className="zs-field">
            <div className="zs-label">From</div>
            <input type="date" className="zs-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className="zs-field">
            <div className="zs-label">To</div>
            <input type="date" className="zs-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <button onClick={loadAll} className="zs-btn zs-btn-primary" disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {err ? <div className="zs-alert">{err}</div> : null}

      <div className="zs-card">
        {loading ? (
          <div style={{ padding: 18, color: "var(--muted)", fontSize: 13 }}>Loading...</div>
        ) : (
          <div className="zs-table-wrap">
            <table className="zs-table">
              <thead>
                <tr>
                  <th className="zs-col-issue">Issue</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported</th>
                  <th className="zs-col-actions" style={{ textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x.id}>
                    <td className="zs-col-issue">
                      <div className="zs-issue-title">{x.title || x.subject || `Issue #${x.id}`}</div>
                      <div className="zs-issue-desc">{x.description || x.message || ""}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800 }}>{x.guest_name || `Guest #${x.guest_id || ""}`}</div>
                      <div className="zs-muted">{x.guest_email || ""}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {x.room_number ? `Room ${x.room_number}` : `Room #${x.room_id || ""}`}
                      </div>
                      <div className="zs-muted">{x.room_type || ""}</div>
                    </td>

                    <td>
                      <span className={badgeClass("priority", x.priority || "medium")}>{x.priority || "medium"}</span>
                    </td>

                    <td>
                      <span className={badgeClass("status", x.status || "open")}>{x.status || "open"}</span>
                    </td>

                    <td className="zs-muted">{(x.created_at || x.reported_at || x.date || "").slice(0, 10)}</td>

                    <td>
                      <div className="zs-actions">
                        <button className="zs-btn zs-btn-ghost" onClick={() => openUpdate(x)}>
                          Update
                        </button>
                        <button className="zs-btn zs-btn-primary" onClick={() => markResolved(x)}>
                          Resolve
                        </button>
                        <button className="zs-btn zs-btn-danger" onClick={() => remove(x)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 22, textAlign: "center", color: "var(--muted)" }}>
                      No issues found.
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
                <div className="zs-modal-title">Update Issue</div>
                <div className="zs-modal-desc">{active?.title || active?.subject || `Issue #${active?.id}`}</div>
              </div>
              <button className="zs-btn zs-btn-ghost" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="zs-modal-body">
              <div className="zs-grid">
                <div className="zs-field">
                  <div className="zs-label">Status</div>
                  <select className="zs-select" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                </div>

                <div className="zs-field">
                  <div className="zs-label">Priority</div>
                  <select className="zs-select" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="urgent">urgent</option>
                  </select>
                </div>

                <div className="zs-field zs-span-2">
                  <div className="zs-label">Assign to Staff (optional)</div>
                  <select className="zs-select" value={form.assigned_to} onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))}>
                    <option value="">Not assigned</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email || `Staff #${s.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="zs-field zs-span-2">
                  <div className="zs-label">Admin Note</div>
                  <textarea
                    className="zs-textarea"
                    value={form.admin_note}
                    onChange={(e) => setForm((p) => ({ ...p, admin_note: e.target.value }))}
                    placeholder="Internal note (visible to admin/staff)..."
                  />
                </div>
              </div>
            </div>

            <div className="zs-footer">
              <div className="zs-muted">
                Room: {active?.room_number ? `Room ${active.room_number}` : `Room #${active?.room_id || ""}`} • Guest:{" "}
                {active?.guest_name || `Guest #${active?.guest_id || ""}`}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="zs-btn zs-btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button className="zs-btn zs-btn-primary" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
