import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  BedDouble,
  MessageCircle,
  UserRound,
  LogOut,
  Search,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  BadgeInfo,
  Phone,
  Mail,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Inline CSS styles
const styles = `
  .guest-dashboard {
    min-height: 100vh;
    background-color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .dashboard-container {
    max-width: 72rem;
    margin-left: auto;
    margin-right: auto;
    padding: 1.5rem 1rem;
  }

  .dashboard-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 640px) {
    .dashboard-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .dashboard-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }

  .user-contact-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #475569;
  }

  .contact-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.75rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-refresh {
    background-color: white;
    color: #334155;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .btn-refresh:hover {
    background-color: #f8fafc;
  }

  .btn-logout {
    background-color: #0f172a;
    color: white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .btn-logout:hover {
    background-color: #1e293b;
  }

  .error-alert {
    margin-top: 1.25rem;
    border-radius: 1rem;
    background-color: #fef2f2;
    padding: 1rem;
    font-size: 0.875rem;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .error-content {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .error-icon {
    margin-top: 0.125rem;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .error-title {
    font-weight: 500;
  }

  .error-message {
    margin-top: 0.25rem;
  }

  .stats-grid {
    margin-top: 1.5rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .stat-card {
    border-radius: 1rem;
    background-color: white;
    padding: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .stat-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }

  .stat-value {
    margin-top: 0.5rem;
    font-size: 1.875rem;
    font-weight: 600;
    color: #0f172a;
  }

  .main-grid {
    margin-top: 1.5rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 1024px) {
    .main-grid {
      grid-template-columns: 3fr 1fr;
    }
  }

  .quick-actions {
    border-radius: 1rem;
    background-color: white;
    padding: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .actions-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .actions-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }

  .section-description {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #475569;
  }

  .actions-grid {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .quick-card {
    display: block;
    border-radius: 1rem;
    background-color: #f8fafc;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    text-decoration: none;
    transition: all 0.2s;
  }

  .quick-card:hover {
    background-color: white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .card-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .card-icon-container {
    border-radius: 0.75rem;
    background-color: white;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    transition: background-color 0.2s;
  }

  .quick-card:hover .card-icon-container {
    background-color: #f8fafc;
  }

  .card-text {
    min-width: 0;
  }

  .card-title {
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }

  .card-desc {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #475569;
  }

  .bookings-section {
    margin-top: 1rem;
    border-radius: 1rem;
    background-color: white;
    padding: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .bookings-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  @media (min-width: 640px) {
    .bookings-controls {
      flex-direction: row;
      align-items: center;
    }
  }

  .search-container {
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 0.625rem;
    width: 1rem;
    height: 1rem;
    color: #94a3b8;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    border-radius: 0.75rem;
    background-color: white;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    font-size: 0.875rem;
    border: 1px solid #e2e8f0;
    outline: none;
  }

  .search-input:focus {
    border-color: #cbd5e1;
  }

  .status-select {
    border-radius: 0.75rem;
    background-color: white;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid #e2e8f0;
    outline: none;
    cursor: pointer;
  }

  .status-select:focus {
    border-color: #cbd5e1;
  }

  .bookings-table {
    margin-top: 1rem;
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .table-header {
    display: none;
    grid-template-columns: repeat(12, 1fr);
    gap: 0.5rem;
    background-color: #f8fafc;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
  }

  @media (min-width: 640px) {
    .table-header {
      display: grid;
    }
  }

  .header-room {
    grid-column: span 3;
  }

  .header-dates {
    grid-column: span 3;
  }

  .header-nights {
    grid-column: span 2;
  }

  .header-status {
    grid-column: span 2;
  }

  .header-action {
    grid-column: span 2;
    text-align: right;
  }

  .table-body {
    background-color: white;
  }

  .table-loading,
  .table-empty {
    padding: 1rem;
    font-size: 0.875rem;
    color: #475569;
  }

  .booking-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .booking-row:last-child {
    border-bottom: none;
  }

  @media (min-width: 640px) {
    .booking-row {
      grid-template-columns: repeat(12, 1fr);
      align-items: center;
    }
  }

  .room-cell {
    grid-column: span 12;
  }

  @media (min-width: 640px) {
    .room-cell {
      grid-column: span 3;
    }
  }

  .room-label {
    font-weight: 600;
    color: #0f172a;
  }

  .room-sub {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
  }

  .booking-id {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #64748b;
  }

  .dates-cell {
    grid-column: span 12;
  }

  @media (min-width: 640px) {
    .dates-cell {
      grid-column: span 3;
    }
  }

  .dates-main {
    font-size: 0.875rem;
    color: #0f172a;
  }

  .dates-created {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #64748b;
  }

  .nights-cell {
    grid-column: span 12;
  }

  @media (min-width: 640px) {
    .nights-cell {
      grid-column: span 2;
    }
  }

  .nights-value {
    font-size: 0.875rem;
    color: #0f172a;
  }

  .nights-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .status-cell {
    grid-column: span 12;
  }

  @media (min-width: 640px) {
    .status-cell {
      grid-column: span 2;
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid;
  }

  .badge-confirmed {
    background-color: #f0fdf4;
    color: #15803d;
    border-color: #bbf7d0;
  }

  .badge-pending {
    background-color: #fefce8;
    color: #854d0e;
    border-color: #fef08a;
  }

  .badge-cancelled {
    background-color: #fef2f2;
    color: #b91c1c;
    border-color: #fecaca;
  }

  .badge-default {
    background-color: #f8fafc;
    color: #334155;
    border-color: #e2e8f0;
  }

  .status-icon {
    width: 1rem;
    height: 1rem;
  }

  .action-cell {
    grid-column: span 12;
    text-align: left;
  }

  @media (min-width: 640px) {
    .action-cell {
      grid-column: span 2;
      text-align: right;
    }
  }

  .view-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    background-color: #0f172a;
    color: white;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-btn:hover {
    background-color: #1e293b;
  }

  .table-footer {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #64748b;
  }

  .full-link {
    color: #334155;
    text-decoration: none;
  }

  .full-link:hover {
    text-decoration: underline;
  }

  .sidebar-section {
    border-radius: 1rem;
    background-color: white;
    padding: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .upcoming-list {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .upcoming-item {
    border-radius: 1rem;
    background-color: #f8fafc;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
  }

  .upcoming-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .upcoming-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
  }

  .upcoming-dates {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
  }

  .upcoming-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 9999px;
    padding: 0.125rem 0.625rem;
    font-size: 0.6875rem;
    font-weight: 600;
    border: 1px solid;
  }

  .upcoming-action {
    margin-top: 0.75rem;
  }

  .upcoming-btn {
    display: block;
    width: 100%;
    border-radius: 0.75rem;
    background-color: white;
    color: #0f172a;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    transition: background-color 0.2s;
  }

  .upcoming-btn:hover {
    background-color: #f1f5f9;
  }

  .chat-btn {
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.75rem;
    background-color: #0f172a;
    color: white;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .chat-btn:hover {
    background-color: #1e293b;
  }

  .help-list {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #334155;
  }

  .help-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .help-icon {
    width: 1rem;
    height: 1rem;
    color: #64748b;
  }

  .help-btn {
    display: block;
    width: 100%;
    border-radius: 0.75rem;
    background-color: #f8fafc;
    color: #0f172a;
    padding: 0.5rem 0.75rem;
    margin-top: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    transition: background-color 0.2s;
  }

  .help-btn:hover {
    background-color: #f1f5f9;
  }

  .dashboard-footer {
    margin-top: 2.5rem;
    text-align: center;
    font-size: 0.75rem;
    color: #64748b;
  }

  .loading-state {
    display: none;
  }

  /* Utility classes */
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-lg { font-size: 1.125rem; }
  .text-2xl { font-size: 1.5rem; }
  .text-3xl { font-size: 1.875rem; }

  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }

  .text-slate-900 { color: #0f172a; }
  .text-slate-800 { color: #1e293b; }
  .text-slate-700 { color: #334155; }
  .text-slate-600 { color: #475569; }
  .text-slate-500 { color: #64748b; }
  .text-slate-400 { color: #94a3b8; }

  .bg-white { background-color: white; }
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-slate-100 { background-color: #f1f5f9; }
  .bg-slate-900 { background-color: #0f172a; }

  .ring-1 { border-width: 1px; border-style: solid; }
  .ring-slate-200 { border-color: #e2e8f0; }

  .rounded-xl { border-radius: 0.75rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-full { border-radius: 9999px; }

  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-5 { margin-top: 1.25rem; }
  .mt-6 { margin-top: 1.5rem; }

  .w-4 { width: 1rem; }
  .h-4 { height: 1rem; }
  .w-5 { width: 1.25rem; }
  .h-5 { height: 1.25rem; }

  .inline-flex { display: inline-flex; }
  .flex { display: flex; }
  .grid { display: grid; }
  .hidden { display: none; }

  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .flex-col { flex-direction: column; }
  .flex-row { flex-direction: row; }
  .flex-wrap { flex-wrap: wrap; }

  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 0.75rem; }
  .p-4 { padding: 1rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }

  .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

  .divide-y > * + * { border-top: 1px solid #e2e8f0; }

  .pointer-events-none { pointer-events: none; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .block { display: block; }
  .inline-block { display: inline-block; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .min-w-0 { min-width: 0; }

  .hover-bg-slate-50:hover { background-color: #f8fafc; }
  .hover-bg-slate-100:hover { background-color: #f1f5f9; }
  .hover-bg-slate-800:hover { background-color: #1e293b; }
  .hover-underline:hover { text-decoration: underline; }

  .focus-outline-none:focus { outline: none; }
  .focus-ring-2:focus { border-width: 2px; }
  .focus-ring-slate-300:focus { border-color: #cbd5e1; }

  .group:hover .group-hover-bg-slate-50 { background-color: #f8fafc; }

  @media (min-width: 640px) {
    .sm-flex-row { flex-direction: row; }
    .sm-items-center { align-items: center; }
    .sm-justify-between { justify-content: space-between; }
    .sm-grid { display: grid; }
    .sm-grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
    .sm-w-72 { width: 18rem; }
    .sm-col-span-3 { grid-column: span 3; }
    .sm-col-span-2 { grid-column: span 2; }
    .sm-col-span-1 { grid-column: span 1; }
    .sm-text-right { text-align: right; }
  }

  @media (min-width: 1024px) {
    .lg-col-span-3 { grid-column: span 3; }
    .lg-col-span-1 { grid-column: span 1; }
    .lg-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  }
`;

// Helper functions (unchanged)
const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "confirmed" || s === "paid" || s === "completed")
    return "badge-confirmed";
  if (s === "pending" || s === "awaiting" || s === "processing")
    return "badge-pending";
  if (s === "cancelled" || s === "canceled" || s === "rejected")
    return "badge-cancelled";
  return "badge-default";
};

const StatusIcon = ({ status }) => {
  const s = (status || "").toLowerCase();
  if (s === "confirmed" || s === "paid" || s === "completed")
    return <CheckCircle2 className="status-icon" />;
  if (s === "pending" || s === "awaiting" || s === "processing")
    return <Clock3 className="status-icon" />;
  if (s === "cancelled" || s === "canceled" || s === "rejected")
    return <XCircle className="status-icon" />;
  return <BadgeInfo className="status-icon" />;
};

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
};

const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  const d1 = new Date(a);
  const d2 = new Date(b);
  const ms = d2 - d1;
  if (Number.isNaN(ms)) return 0;
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

// Main component
export default function GuestDashboard() {
  const navigate = useNavigate();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const safeName =
    profile?.full_name ||
    profile?.name ||
    user?.full_name ||
    user?.name ||
    "Guest";

  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || profile?.mobile || user?.phone || "";

  const fetchAll = async () => {
    setLoading(true);
    setErr("");

    try {
      const [pRes, bRes] = await Promise.all([
        api.get("/api/guest/profile.php"),
        api.get("/guest/my-bookings"),
      ]);
      setProfile(pRes?.data || null);
      setBookings(Array.isArray(bRes?.reservations) ? bRes.reservations : bRes?.data?.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/guest/login", { replace: true });
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) =>
      ["confirmed", "paid", "completed"].includes((b.status || "").toLowerCase())
    ).length;
    const pending = bookings.filter((b) =>
      ["pending", "awaiting", "processing"].includes((b.status || "").toLowerCase())
    ).length;
    const cancelled = bookings.filter((b) =>
      ["cancelled", "canceled", "rejected"].includes((b.status || "").toLowerCase())
    ).length;
    return { total, confirmed, pending, cancelled };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return bookings
      .filter((b) => {
        const s = (b.status || "").toLowerCase();
        if (status !== "all" && s !== status) return false;

        if (!qq) return true;
        const hay = [
          b.booking_id,
          b.id,
          b.room_number,
          b.room_type,
          b.check_in,
          b.check_out,
          b.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.created_at || b.check_in) - new Date(a.created_at || a.check_in));
  }, [bookings, q, status]);

  const upcoming = useMemo(() => {
    const today = new Date();
    return bookings
      .filter((b) => {
        const ci = new Date(b.check_in);
        if (Number.isNaN(ci.getTime())) return false;
        const st = (b.status || "").toLowerCase();
        return ci >= new Date(today.toDateString()) && !["cancelled", "canceled", "rejected"].includes(st);
      })
      .sort((a, b) => new Date(a.check_in) - new Date(b.check_in))
      .slice(0, 3);
  }, [bookings]);

  const quickCards = [
    {
      title: "My Profile",
      desc: "View and edit your personal details",
      icon: <UserRound className="card-icon" />,
      to: "/guest/profile",
    },
    {
      title: "My Bookings",
      desc: "See all reservations and statuses",
      icon: <BedDouble className="card-icon" />,
      to: "/guest/my-bookings",
    },
    {
      title: "Live Chat",
      desc: "Message the front desk instantly",
      icon: <MessageCircle className="card-icon" />,
      to: "/guest/chat",
    },
    {
      title: "Book a Room",
      desc: "Search rooms and make a booking",
      icon: <CalendarDays className="card-icon" />,
      to: "/available-rooms",
    },
  ];

  const onLogout = () => {
    logout?.();
    navigate("/", { replace: true });
  };

  if (authLoading) return null;

  return (
    <>
      {/* Inline styles */}
      <style>{styles}</style>
      
      <div className="guest-dashboard">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Welcome, {safeName}</h1>
              <div className="user-contact-info">
                {email ? (
                  <span className="contact-item">
                    <Mail className="contact-icon" />
                    {email}
                  </span>
                ) : null}
                {phone ? (
                  <span className="contact-item">
                    <Phone className="contact-icon" />
                    {phone}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="header-actions">
              <button
                onClick={fetchAll}
                className="btn btn-refresh"
                disabled={loading}
                type="button"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={onLogout}
                className="btn btn-logout"
                type="button"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {err ? (
            <div className="error-alert">
              <div className="error-content">
                <AlertCircle className="error-icon" />
                <div>
                  <div className="error-title">Something went wrong</div>
                  <div className="error-message">{err}</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">Total Bookings</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Confirmed</div>
              <div className="stat-value">{stats.confirmed}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Pending</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Cancelled</div>
              <div className="stat-value">{stats.cancelled}</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="main-grid">
            <div className="lg-col-span-3">
              {/* Quick Actions */}
              <div className="quick-actions">
                <div className="actions-header">
                  <div>
                    <h2 className="section-title">Quick Actions</h2>
                    <p className="section-description">
                      Manage your account and bookings in one place.
                    </p>
                  </div>
                </div>

                <div className="actions-grid">
                  {quickCards.map((c) => (
                    <Link
                      key={c.title}
                      to={c.to}
                      className="quick-card"
                    >
                      <div className="card-content">
                        <div className="card-icon-container">{c.icon}</div>
                        <div className="card-text">
                          <div className="card-title">{c.title}</div>
                          <div className="card-desc">{c.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bookings Section */}
              <div className="bookings-section">
                <div className="actions-header">
                  <div>
                    <h2 className="section-title">My Bookings</h2>
                    <p className="section-description">
                      Search and filter your reservations.
                    </p>
                  </div>

                  <div className="bookings-controls">
                    <div className="search-container">
                      <Search className="search-icon" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search booking / room / date..."
                        className="search-input"
                      />
                    </div>

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="status-select"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="bookings-table">
                  <div className="table-header">
                    <div className="header-room">Room</div>
                    <div className="header-dates">Dates</div>
                    <div className="header-nights">Nights</div>
                    <div className="header-status">Status</div>
                    <div className="header-action">Action</div>
                  </div>

                  {loading ? (
                    <div className="table-loading">Loading...</div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="table-empty">No bookings found.</div>
                  ) : (
                    <div className="table-body">
                      {filteredBookings.map((b) => {
                        const nights = nightsBetween(b.check_in, b.check_out);
                        const roomLabel = b.room_number
                          ? `Room ${b.room_number}`
                          : b.room_type
                          ? b.room_type
                          : "Room";
                        const sub =
                          b.room_type && b.room_number
                            ? b.room_type
                            : b.room_number
                            ? ""
                            : b.room_type || "";

                        return (
                          <div
                            key={b.booking_id || b.id || `${b.check_in}-${b.check_out}`}
                            className="booking-row"
                          >
                            <div className="room-cell">
                              <div className="room-label">{roomLabel}</div>
                              {sub ? (
                                <div className="room-sub">{sub}</div>
                              ) : null}
                              {b.booking_id || b.id ? (
                                <div className="booking-id">
                                  Booking #{b.booking_id || b.id}
                                </div>
                              ) : null}
                            </div>

                            <div className="dates-cell">
                              <div className="dates-main">
                                {fmtDate(b.check_in)} → {fmtDate(b.check_out)}
                              </div>
                              {b.created_at ? (
                                <div className="dates-created">
                                  Created: {fmtDate(b.created_at)}
                                </div>
                              ) : null}
                            </div>

                            <div className="nights-cell">
                              <div className="nights-value">{nights}</div>
                              <div className="nights-label">night(s)</div>
                            </div>

                            <div className="status-cell">
                              <span
                                className={`status-badge ${badgeClass(b.status)}`}
                              >
                                <StatusIcon status={b.status} />
                                {b.status || "Unknown"}
                              </span>
                            </div>

                            <div className="action-cell">
                              <Link
                                to={`/guest/booking/${b.booking_id || b.id || ""}`}
                                className="view-btn"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="table-footer">
                  <div>Showing {filteredBookings.length} booking(s)</div>
                  <Link
                    to="/guest/my-bookings"
                    className="full-link"
                  >
                    Open full bookings page →
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg-col-span-1">
              {/* Upcoming Bookings */}
              <div className="sidebar-section">
                <h2 className="section-title">Upcoming</h2>
                <p className="section-description">Your next reservations.</p>

                <div className="upcoming-list">
                  {loading ? (
                    <div className="text-sm text-slate-600">Loading...</div>
                  ) : upcoming.length === 0 ? (
                    <div className="text-sm text-slate-600">No upcoming bookings.</div>
                  ) : (
                    upcoming.map((b) => (
                      <div
                        key={b.booking_id || b.id || `${b.check_in}-${b.check_out}-u`}
                        className="upcoming-item"
                      >
                        <div className="upcoming-header">
                          <div className="min-w-0">
                            <div className="upcoming-title">
                              {b.room_number ? `Room ${b.room_number}` : b.room_type || "Room"}
                            </div>
                            <div className="upcoming-dates">
                              {fmtDate(b.check_in)} → {fmtDate(b.check_out)}
                            </div>
                          </div>
                          <span
                            className={`upcoming-badge ${badgeClass(b.status)}`}
                          >
                            <StatusIcon status={b.status} />
                            {b.status || "Unknown"}
                          </span>
                        </div>

                        <div className="upcoming-action">
                          <Link
                            to={`/guest/booking/${b.booking_id || b.id || ""}`}
                            className="upcoming-btn"
                          >
                            View booking
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <Link
                    to="/guest/chat"
                    className="chat-btn"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open Live Chat
                  </Link>
                </div>
              </div>

              {/* Help Section */}
              <div className="sidebar-section mt-4">
                <h2 className="section-title">Help</h2>
                <p className="section-description">
                  Need assistance? Contact the front desk.
                </p>
                <div className="help-list">
                  <div className="help-item">
                    <Phone className="help-icon" />
                    <span>Front Desk: +94 XX XXX XXXX</span>
                  </div>
                  <div className="help-item">
                    <Mail className="help-icon" />
                    <span>support@zentrastay.com</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/guest/help"
                    className="help-btn"
                  >
                    Open Help Center
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dashboard-footer">
            © {new Date().getFullYear()} ZentraStay
          </div>
        </div>
      </div>
    </>
  );
}

// StatCard component (unchanged)
function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}