import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuthGuard";

function toYMD(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const da = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function daysBetween(a, b) {
  const A = new Date(a);
  const B = new Date(b);
  const ms = B - A;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function money(n) {
  const x = Number(n || 0);
  return x.toFixed(2);
}

function downloadCSV(filename, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function Stat({ title, value, sub, tone = "primary" }) {
  return (
    <div className={cx("zs-card zs-stat", `zs-tone-${tone}`)}>
      <div className="zs-stat-title">{title}</div>
      <div className="zs-stat-value">{value}</div>
      {sub ? <div className="zs-stat-sub">{sub}</div> : null}
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="zs-card">
      <div className="zs-card-head">
        <div className="zs-card-title">{title}</div>
        {right ? <div className="zs-card-right">{right}</div> : null}
      </div>
      <div className="zs-card-body">{children}</div>
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <div className="zs-table-wrap">
      <table className="zs-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="zs-empty" colSpan={cols.length}>
                No data
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default function Reports() {
  const auth = useAuth();
  const today = useMemo(() => toYMD(new Date()), []);
  const startDefault = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return toYMD(d);
  }, []);

  const [range, setRange] = useState({ from: startDefault, to: today });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [issues, setIssues] = useState([]);

  const nightsInRange = useMemo(() => daysBetween(range.from, range.to) || 1, [range]);

  async function loadAll() {
    setErr("");
    setLoading(true);
    try {
      const q = `?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
      const [rRooms, rRes, rPay, rIssues] = await Promise.all([
        api.get("/rooms/list").catch(() => ({ data: [] })),
        api.get(`/reservations/list${q}`).catch(() => ({ data: [] })),
        api.get(`/invoices/list${q}`).catch(() => ({ data: [] })),
        api.get(`/housekeeping/list-issues${q}`).catch(() => ({ data: [] })),
      ]);

      setRooms(rRooms?.data || rRooms?.rooms || []);
      setReservations(rRes?.data || rRes?.reservations || []);
      setPayments(rPay?.data || rPay?.payments || []);
      setIssues(rIssues?.data || rIssues?.issues || []);
    } catch (e) {
      setErr(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth?.authLoading) return;
    if (!auth?.user) return;
    loadAll();
  }, [range.from, range.to, auth?.authLoading, auth?.user]);

  const roomCount = rooms.length;

  const resInRange = useMemo(() => {
    const from = range.from;
    const to = range.to;
    return (reservations || []).filter((x) => {
      const ci = (x.check_in_date || "").slice(0, 10);
      const co = (x.check_out_date || "").slice(0, 10);
      if (!ci || !co) return false;
      if (co <= from) return false;
      if (ci > to) return false;
      return true;
    });
  }, [reservations, range]);

  const paymentsInRange = useMemo(() => {
    const from = range.from;
    const to = range.to;
    return (payments || []).filter((p) => {
      const d = (p.paid_at || p.payment_date || p.created_at || "").slice(0, 10);
      if (!d) return false;
      return d >= from && d <= to;
    });
  }, [payments, range]);

  const revenue = useMemo(
    () => paymentsInRange.reduce((s, p) => s + Number(p.amount || p.total || 0), 0),
    [paymentsInRange]
  );

  const statusCounts = useMemo(() => {
    const map = new Map();
    (rooms || []).forEach((r) => {
      const k = (r.status || "unknown").toLowerCase();
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [rooms]);

  const reservedRoomNights = useMemo(() => {
    const from = range.from;
    const to = range.to;
    let total = 0;

    for (const x of resInRange) {
      if (String(x.status || "").toLowerCase() === "cancelled") continue;
      const ci = (x.check_in_date || "").slice(0, 10);
      const co = (x.check_out_date || "").slice(0, 10);
      const start = ci < from ? from : ci;
      const end = co > to ? to : co;
      total += daysBetween(start, end);
    }
    return total;
  }, [resInRange, range]);

  const availableRoomNights = useMemo(() => roomCount * nightsInRange, [roomCount, nightsInRange]);

  const occupancy = useMemo(() => {
    if (availableRoomNights <= 0) return 0;
    return (reservedRoomNights / availableRoomNights) * 100;
  }, [reservedRoomNights, availableRoomNights]);

  const adr = useMemo(() => {
    const nights = Math.max(1, reservedRoomNights);
    return revenue / nights;
  }, [revenue, reservedRoomNights]);

  const revpar = useMemo(() => {
    const nights = Math.max(1, availableRoomNights);
    return revenue / nights;
  }, [revenue, availableRoomNights]);

  const bookingsSummary = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let cancelled = 0;
    let checked_in = 0;
    let checked_out = 0;

    for (const x of resInRange) {
      const s = String(x.status || "confirmed").toLowerCase();
      if (s === "pending") pending++;
      else if (s === "cancelled") cancelled++;
      else if (s === "checked_in") checked_in++;
      else if (s === "checked_out") checked_out++;
      else confirmed++;
    }

    return { confirmed, pending, cancelled, checked_in, checked_out, total: resInRange.length };
  }, [resInRange]);

  const topRoomTypes = useMemo(() => {
    const map = new Map();
    for (const x of resInRange) {
      if (String(x.status || "").toLowerCase() === "cancelled") continue;
      const t = (x.room_type || x.roomType || "Unknown").trim() || "Unknown";
      map.set(t, (map.get(t) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [resInRange]);

  const revenueByDay = useMemo(() => {
    const map = new Map();
    for (const p of paymentsInRange) {
      const d = (p.paid_at || p.payment_date || p.created_at || "").slice(0, 10);
      if (!d) continue;
      map.set(d, (map.get(d) || 0) + Number(p.amount || p.total || 0));
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [paymentsInRange]);

  const issuesSummary = useMemo(() => {
    const map = new Map();
    (issues || []).forEach((i) => {
      const s = String(i.status || "open").toLowerCase();
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  const exportBookings = () => {
    const rows = [
      ["Reservation ID", "Code", "Guest", "Room", "Type", "Check-in", "Check-out", "Adults", "Children", "Total", "Status"],
      ...resInRange.map((x) => [
        x.id,
        x.reservation_code || "",
        x.guest_name || x.guest_email || x.guest_id || "",
        x.room_number || x.room_id || "",
        x.room_type || "",
        (x.check_in_date || "").slice(0, 10),
        (x.check_out_date || "").slice(0, 10),
        x.adults ?? "",
        x.children ?? "",
        x.total_price ?? x.total ?? "",
        x.status || "",
      ]),
    ];
    downloadCSV(`bookings_${range.from}_to_${range.to}.csv`, rows);
  };

  const exportRevenue = () => {
    const rows = [
      ["Date", "Revenue"],
      ...revenueByDay.map(([d, v]) => [d, money(v)]),
      ["TOTAL", money(revenue)],
    ];
    downloadCSV(`revenue_${range.from}_to_${range.to}.csv`, rows);
  };

  const exportRooms = () => {
    const rows = [
      ["Room ID", "Room Number", "Type", "Capacity", "Base Price", "Status"],
      ...rooms.map((r) => [r.id, r.room_number || "", r.room_type || "", r.capacity ?? "", r.base_price ?? "", r.status || ""]),
    ];
    downloadCSV(`rooms_snapshot_${today}.csv`, rows);
  };

  return (
    <div className="zs-root">
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

        .zs-root{
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
          margin-bottom: 12px;
        }

        .zs-title{
          font-size: 22px;
          font-weight: 750;
          letter-spacing: .2px;
        }

        .zs-sub{
          margin-top: 2px;
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

        .zs-input{
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,.03);
          color: var(--text);
          outline: none;
          box-shadow: 0 0 0 rgba(99,102,241,0);
          transition: .15s;
        }
        .zs-input:focus{
          border-color: rgba(99,102,241,.55);
          box-shadow: 0 0 0 4px rgba(99,102,241,.14);
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
        .zs-btn:disabled{ opacity:.65; cursor:not-allowed; }

        .zs-btn-primary{
          border-color: rgba(99,102,241,.45);
          background: rgba(99,102,241,.18);
        }
        .zs-btn-primary:hover{
          background: rgba(99,102,241,.26);
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

        .zs-grid{
          margin-top: 14px;
          display:grid;
          grid-template-columns: repeat(1, minmax(0,1fr));
          gap: 12px;
        }
        @media (min-width: 760px){
          .zs-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (min-width: 1100px){
          .zs-grid.kpis{ grid-template-columns: repeat(4, minmax(0,1fr)); }
        }

        .zs-card{
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: var(--shadow);
        }

        .zs-stat{
          position: relative;
          overflow:hidden;
        }
        .zs-stat::before{
          content:"";
          position:absolute;
          inset:-1px;
          opacity:.55;
          background: radial-gradient(600px 150px at 20% 0%, rgba(99,102,241,.20), transparent 60%);
          pointer-events:none;
        }
        .zs-stat-title{
          position:relative;
          font-size: 12px;
          color: var(--muted);
        }
        .zs-stat-value{
          position:relative;
          margin-top: 6px;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: .2px;
        }
        .zs-stat-sub{
          position:relative;
          margin-top: 6px;
          font-size: 11px;
          color: var(--muted);
        }

        .zs-tone-success::before{
          background: radial-gradient(600px 150px at 20% 0%, rgba(16,185,129,.22), transparent 60%);
        }
        .zs-tone-warning::before{
          background: radial-gradient(600px 150px at 20% 0%, rgba(245,158,11,.22), transparent 60%);
        }
        .zs-tone-danger::before{
          background: radial-gradient(600px 150px at 20% 0%, rgba(239,68,68,.22), transparent 60%);
        }

        .zs-card-head{
          padding: 14px 16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          border-bottom: 1px solid rgba(31,42,68,.9);
        }
        .zs-card-title{
          font-weight: 750;
          font-size: 14px;
          letter-spacing:.2px;
        }
        .zs-card-body{
          padding: 14px 16px 16px;
        }

        .zs-table-wrap{
          border: 1px solid rgba(31,42,68,.95);
          border-radius: 14px;
          overflow:auto;
          background: rgba(0,0,0,.15);
        }

        .zs-table{
          width:100%;
          min-width: 680px;
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
        }

        .zs-table tbody td{
          padding: 12px 14px;
          border-bottom: 1px solid rgba(31,42,68,.55);
          color: var(--text);
        }

        .zs-table tbody tr:hover td{
          background: rgba(255,255,255,.03);
        }

        .zs-empty{
          padding: 24px 14px !important;
          text-align:center;
          color: var(--muted);
        }

        .zs-kpi-row{
          display:grid;
          grid-template-columns: repeat(1, minmax(0,1fr));
          gap: 12px;
        }
        @media(min-width:1100px){
          .zs-kpi-row{ grid-template-columns: repeat(4, minmax(0,1fr)); }
        }

        .zs-note{
          display:grid;
          gap: 10px;
        }
        .zs-note-box{
          border: 1px solid rgba(31,42,68,.85);
          background: rgba(255,255,255,.03);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .zs-note-box h4{
          margin:0 0 6px 0;
          font-size: 13px;
          font-weight: 750;
        }
        .zs-note-box p{
          margin:0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
        }
      `}</style>

      <div className="zs-top">
        <div>
          <div className="zs-title">Reports</div>
          <div className="zs-sub">
            Date range: {range.from} → {range.to}
          </div>
        </div>

        <div className="zs-controls">
          <div className="zs-field">
            <div className="zs-label">From</div>
            <input
              type="date"
              className="zs-input"
              value={range.from}
              onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))}
            />
          </div>

          <div className="zs-field">
            <div className="zs-label">To</div>
            <input
              type="date"
              className="zs-input"
              value={range.to}
              onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))}
            />
          </div>

          <button onClick={loadAll} className={cx("zs-btn zs-btn-primary")} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {err ? <div className="zs-alert">{err}</div> : null}

      <div className="zs-grid kpis">
        <Stat title="Revenue" value={money(revenue)} sub="From payments in range" tone="success" />
        <Stat title="Occupancy" value={`${occupancy.toFixed(1)}%`} sub={`${reservedRoomNights}/${availableRoomNights} room-nights`} tone="primary" />
        <Stat title="ADR" value={money(adr)} sub="Average daily rate (approx.)" tone="warning" />
        <Stat title="RevPAR" value={money(revpar)} sub="Revenue per available room-night" tone="primary" />
      </div>

      <div className="zs-grid">
        <Card
          title="Bookings Summary"
          right={
            <button className="zs-btn" onClick={exportBookings}>
              Export CSV
            </button>
          }
        >
          <div className="zs-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <Stat title="Total" value={bookingsSummary.total} />
            <Stat title="Confirmed" value={bookingsSummary.confirmed} tone="success" />
            <Stat title="Pending" value={bookingsSummary.pending} tone="warning" />
            <Stat title="Checked-in" value={bookingsSummary.checked_in} />
            <Stat title="Checked-out" value={bookingsSummary.checked_out} />
            <Stat title="Cancelled" value={bookingsSummary.cancelled} tone="danger" />
          </div>

          <div style={{ marginTop: 14 }}>
            <Table
              cols={["Reservation", "Guest", "Room", "Check-in", "Check-out", "Total", "Status"]}
              rows={resInRange.slice(0, 12).map((x) => [
                x.reservation_code || `#${x.id}`,
                x.guest_name || x.guest_email || `Guest #${x.guest_id || ""}`,
                x.room_number || `Room #${x.room_id || ""}`,
                (x.check_in_date || "").slice(0, 10),
                (x.check_out_date || "").slice(0, 10),
                money(x.total_price || x.total || 0),
                x.status || "confirmed",
              ])}
            />
            <div className="zs-sub" style={{ marginTop: 10 }}>
              Showing latest 12 records in the selected range.
            </div>
          </div>
        </Card>

        <Card
          title="Revenue by Day"
          right={
            <button className="zs-btn" onClick={exportRevenue}>
              Export CSV
            </button>
          }
        >
          <Table cols={["Date", "Revenue"]} rows={revenueByDay.slice(-14).map(([d, v]) => [d, money(v)])} />
          <div className="zs-sub" style={{ marginTop: 10 }}>
            Showing last 14 days with payments in range.
          </div>
        </Card>

        <Card
          title="Room Status Snapshot"
          right={
            <button className="zs-btn" onClick={exportRooms}>
              Export CSV
            </button>
          }
        >
          <div className="zs-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {statusCounts.slice(0, 6).map(([s, c]) => (
              <Stat key={s} title={s} value={c} />
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Table
              cols={["Room", "Type", "Capacity", "Base Price", "Status"]}
              rows={rooms.slice(0, 12).map((r) => [
                r.room_number ? `Room ${r.room_number}` : `#${r.id}`,
                r.room_type || "",
                r.capacity ?? "",
                money(r.base_price ?? 0),
                r.status || "",
              ])}
            />
            <div className="zs-sub" style={{ marginTop: 10 }}>
              Showing first 12 rooms.
            </div>
          </div>
        </Card>

        <Card title="Top Room Types (Bookings)">
          <Table cols={["Room Type", "Bookings"]} rows={topRoomTypes.map(([t, c]) => [t, c])} />
        </Card>

        <Card title="Issues / Maintenance Summary">
          <div className="zs-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {issuesSummary.slice(0, 6).map(([s, c]) => (
              <Stat key={s} title={s} value={c} />
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Table
              cols={["Issue", "Room", "Priority", "Status", "Created"]}
              rows={(issues || []).slice(0, 12).map((i) => [
                i.title || i.subject || `#${i.id}`,
                i.room_number || (i.room_id ? `Room #${i.room_id}` : ""),
                i.priority || "",
                i.status || "",
                (i.created_at || i.reported_at || "").slice(0, 10),
              ])}
            />
            <div className="zs-sub" style={{ marginTop: 10 }}>
              Showing latest 12 issues in range.
            </div>
          </div>
        </Card>

        <Card title="KPI Notes (Calculated)">
          <div className="zs-note">
            <div className="zs-note-box">
              <h4>Occupancy</h4>
              <p>Based on room-nights reserved within the date range divided by total available room-nights.</p>
            </div>
            <div className="zs-note-box">
              <h4>ADR</h4>
              <p>Revenue divided by reserved room-nights (approx.). Use finalized invoices for accuracy.</p>
            </div>
            <div className="zs-note-box">
              <h4>RevPAR</h4>
              <p>Revenue divided by available room-nights. Good for comparing performance over time.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
