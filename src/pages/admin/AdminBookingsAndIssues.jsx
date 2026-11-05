// frontend/src/pages/admin/AdminBookingsAndIssues.jsx
// Admin dashboard for managing bookings and issues

import React, { useState, useEffect } from "react";
import { adminBookingService } from "../../services/booking.service";
import { adminIssueService } from "../../services/issue.service";

export default function AdminBookingsAndIssues() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    } else {
      fetchIssues();
    }
  }, [activeTab, filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminBookingService.listReservations(filterStatus);
      setBookings(data.reservations || []);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminIssueService.listIssues(filterStatus);
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      setError("");
      await adminBookingService.updateReservationStatus(bookingId, newStatus);
      setSuccessMessage("Booking status updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to update booking");
    }
  };

  const handleIssueStatusChange = async (issueId, newStatus) => {
    try {
      setError("");
      await adminIssueService.updateIssueStatus(issueId, newStatus);
      setSuccessMessage("Issue status updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchIssues();
    } catch (err) {
      setError(err.message || "Failed to update issue");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Management</h1>

      {error && <div style={styles.errorBox}>{error}</div>}
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => {
            setActiveTab("bookings");
            setFilterStatus("");
          }}
          style={{
            ...styles.tab,
            ...( activeTab === "bookings" ? styles.tabActive : {})
          }}
        >
          📅 Bookings ({bookings.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("issues");
            setFilterStatus("");
          }}
          style={{
            ...styles.tab,
            ...(activeTab === "issues" ? styles.tabActive : {})
          }}
        >
          🔧 Issues ({issues.length})
        </button>
      </div>

      {/* Filter */}
      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All</option>
          {activeTab === "bookings" && (
            <>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </>
          )}
          {activeTab === "issues" && (
            <>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </>
          )}
        </select>
      </div>

      {loading && <p style={styles.loadingText}>Loading...</p>}

      {/* Bookings Table */}
      {activeTab === "bookings" && !loading && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Ref</th>
                <th style={styles.th}>Guest Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Check-in</th>
                <th style={styles.th}>Check-out</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={styles.row}>
                  <td style={styles.td}>{booking.reservation_ref}</td>
                  <td style={styles.td}>{booking.guest_name || booking.first_name}</td>
                  <td style={styles.td}>{booking.email}</td>
                  <td style={styles.td}>{booking.room_number} ({booking.room_type})</td>
                  <td style={styles.td}>{booking.check_in_date}</td>
                  <td style={styles.td}>{booking.check_out_date}</td>
                  <td style={styles.td}>${booking.total_price}</td>
                  <td style={styles.td}>
                    <select
                      value={booking.status}
                      onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        backgroundColor: getStatusColor(booking.status)
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => alert(`Details for booking ${booking.id}`)}
                      style={styles.detailsBtn}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issues Table */}
      {activeTab === "issues" && !loading && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Guest Name</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Assigned To</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} style={styles.row}>
                  <td style={styles.td}>{issue.room_number}</td>
                  <td style={styles.td}>{issue.guest_name}</td>
                  <td style={styles.td} title={issue.description}>
                    {issue.title}
                  </td>
                  <td style={{
                    ...styles.td,
                    backgroundColor: getPriorityColor(issue.priority),
                    color: "white",
                    fontWeight: "bold"
                  }}>
                    {issue.priority.toUpperCase()}
                  </td>
                  <td style={styles.td}>
                    <select
                      value={issue.status}
                      onChange={(e) => handleIssueStatusChange(issue.id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        backgroundColor: getIssueStatusColor(issue.status)
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    {issue.assigned_to_first_name
                      ? `${issue.assigned_to_first_name} ${issue.assigned_to_last_name}`
                      : "Unassigned"}
                  </td>
                  <td style={styles.td}>{issue.created_at?.split("T")[0]}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => alert(`Details for issue ${issue.id}\n\n${issue.description}`)}
                      style={styles.detailsBtn}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        (activeTab === "bookings" && bookings.length === 0) ||
        (activeTab === "issues" && issues.length === 0)
      ) && (
        <p style={styles.emptyText}>No records found</p>
      )}
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    checked_in: "#3b82f6",
    checked_out: "#6b7280",
    cancelled: "#ef4444"
  };
  return colors[status] || "#6b7280";
}

function getIssueStatusColor(status) {
  const colors = {
    open: "#ef4444",
    in_progress: "#f59e0b",
    resolved: "#10b981",
    closed: "#6b7280"
  };
  return colors[status] || "#6b7280";
}

function getPriorityColor(priority) {
  const colors = {
    low: "#10b981",
    normal: "#3b82f6",
    high: "#f59e0b",
    critical: "#ef4444"
  };
  return colors[priority] || "#6b7280";
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#0f172a"
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #fecaca"
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #86efac"
  },
  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    borderBottom: "2px solid #e2e8f0"
  },
  tab: {
    padding: "12px 20px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px"
  },
  tabActive: {
    color: "#0284c7",
    borderBottomColor: "#0284c7"
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "600"
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px"
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b"
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  headerRow: {
    backgroundColor: "#f1f5f9",
    borderBottom: "2px solid #e2e8f0"
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569"
  },
  row: {
    borderBottom: "1px solid #e2e8f0",
    ":hover": {
      backgroundColor: "#f8fafc"
    }
  },
  td: {
    padding: "12px",
    fontSize: "13px",
    color: "#0f172a"
  },
  statusSelect: {
    padding: "6px 8px",
    border: "none",
    borderRadius: "4px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "12px"
  },
  detailsBtn: {
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  },
  emptyText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    backgroundColor: "white",
    borderRadius: "8px"
  }
};
