// frontend/src/pages/guest/GuestDashboardSimple.jsx
// Simplified guest dashboard focusing on booking display and issue reporting

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingService } from "../../services/booking.service";
import { issueService } from "../../services/issue.service";

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedReservationForIssue, setSelectedReservationForIssue] = useState(null);
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    priority: "normal"
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await bookingService.getGuestProfile();
      setProfile(data.profile);
      setReservations(data.reservations || []);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    try {
      console.log("[GuestDashboard] Report issue attempt started");
      setError("");
      setSuccessMessage("");
      
      // Validation 1: Check title
      if (!issueForm.title || issueForm.title.trim().length === 0) {
        console.warn("[GuestDashboard] Validation failed: title is empty");
        setError("❌ Please enter an issue title");
        return;
      }
      
      // Validation 2: Check reservation selected
      if (!selectedReservationForIssue) {
        console.warn("[GuestDashboard] Validation failed: no reservation selected");
        setError("❌ Please select a reservation first");
        return;
      }

      // Validation 3: Find reservation in list
      const reservation = reservations.find(
        r => r.id === selectedReservationForIssue
      );
      
      if (!reservation) {
        console.warn("[GuestDashboard] Validation failed: invalid reservation ID", selectedReservationForIssue);
        setError("❌ Invalid reservation selected");
        return;
      }

      // Validation 4: Verify room_id exists
      if (!reservation.room_id) {
        console.warn("[GuestDashboard] Validation failed: reservation missing room_id", reservation);
        setError("❌ Room information not found for this reservation");
        return;
      }

      const issueData = {
        room_id: reservation.room_id,
        title: issueForm.title.trim(),
        description: issueForm.description.trim(),
        priority: issueForm.priority
      };

      console.log("[GuestDashboard] Submitting issue with data:", issueData);

      const response = await issueService.createIssue(issueData);
      
      console.log("[GuestDashboard] Issue created successfully:", response);

      // Success flow
      setSuccessMessage("✅ Issue reported successfully! Our team will assist you shortly.");
      setIssueForm({ title: "", description: "", priority: "normal" });
      setSelectedReservationForIssue(null);

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(""), 4000);
      
      // Refresh reservations list to show updated state
      setTimeout(() => fetchProfile(), 5000);
      
    } catch (err) {
      console.error("[GuestDashboard] Issue reporting error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        fullError: err
      });
      
      // Better error message parsing
      let errorMsg = "❌ Failed to report issue";
      if (err.response?.data?.error) {
        errorMsg = "❌ " + err.response.data.error;
      } else if (err.message) {
        errorMsg = "❌ " + err.message;
      }
      
      setError(errorMsg);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {profile?.guest?.name || profile?.user?.first_name || "Guest"}!</h1>
          <div style={styles.contactInfo}>
            <span>{profile?.user?.email}</span>
            <span>{profile?.guest?.phone}</span>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Messages */}
      {error && <div style={styles.errorBox}>{error}</div>}
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}

      {/* Main Content */}
      <div style={styles.content}>
        {/* Reservations Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📅 Your Reservations</h2>
          
          {reservations.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No reservations yet. <a href="/rooms" style={styles.link}>Browse available rooms</a></p>
            </div>
          ) : (
            <div style={styles.reservationsList}>
              {reservations.map((res) => (
                <div key={res.id} style={styles.reservationCard}>
                  <div style={styles.reservationHeader}>
                    <div>
                      <h3 style={styles.roomName}>
                        {res.room_number} - {res.room_type}
                      </h3>
                      <p style={styles.reservationRef}>Ref: {res.reservation_ref}</p>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(res.status)
                    }}>
                      {res.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={styles.reservationDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Check-in</span>
                      <span style={styles.detailValue}>{res.check_in_date}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Check-out</span>
                      <span style={styles.detailValue}>{res.check_out_date}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Guests</span>
                      <span style={styles.detailValue}>{res.number_of_guests}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Total</span>
                      <span style={styles.detailValue}>${res.total_price}</span>
                    </div>
                  </div>

                  {res.special_requests && (
                    <div style={styles.requests}>
                      <strong>Special Requests:</strong> {res.special_requests}
                    </div>
                  )}

                  <div style={styles.reservationActions}>
                    <button
                      onClick={() => setSelectedReservationForIssue(
                        selectedReservationForIssue === res.id ? null : res.id
                      )}
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: selectedReservationForIssue === res.id ? "#ef4444" : "#3b82f6"
                      }}
                    >
                      {selectedReservationForIssue === res.id ? "Cancel" : "Report Issue"}
                    </button>
                  </div>

                  {/* Issue Form for this Reservation */}
                  {selectedReservationForIssue === res.id && (
                    <div style={styles.issueFormContainer}>
                      <h4 style={styles.issueFormTitle}>Report an Issue for {res.room_number}</h4>
                      <form onSubmit={handleReportIssue} style={styles.issueForm}>
                        <div>
                          <label style={styles.label}>Issue Title *</label>
                          <input
                            type="text"
                            value={issueForm.title}
                            onChange={(e) => setIssueForm(p => ({ ...p, title: e.target.value }))}
                            style={styles.input}
                            placeholder="e.g., AC not working"
                            required
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Description</label>
                          <textarea
                            value={issueForm.description}
                            onChange={(e) => setIssueForm(p => ({ ...p, description: e.target.value }))}
                            style={styles.textarea}
                            placeholder="Describe the issue in detail"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Priority</label>
                          <select
                            value={issueForm.priority}
                            onChange={(e) => setIssueForm(p => ({ ...p, priority: e.target.value }))}
                            style={styles.select}
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>

                        <button type="submit" style={styles.submitBtn}>
                          Submit Issue Report
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <button
              onClick={() => navigate("/rooms")}
              style={styles.actionCard}
            >
              🏨 Browse Rooms
            </button>
            <button
              onClick={() => navigate("/guest/profile")}
              style={styles.actionCard}
            >
              👤 My Profile
            </button>
            <button
              onClick={() => navigate("/guest/chat")}
              style={styles.actionCard}
            >
              💬 Chat Support
            </button>
          </div>
        </section>
      </div>
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

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e2e8f0"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
    color: "#0f172a"
  },
  contactInfo: {
    display: "flex",
    gap: "20px",
    fontSize: "14px",
    color: "#64748b"
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #fecaca"
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #86efac"
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "30px"
  },
  section: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#0f172a"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b"
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "600"
  },
  reservationsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "16px"
  },
  reservationCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#f8fafc"
  },
  reservationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px"
  },
  roomName: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#0f172a"
  },
  reservationRef: {
    margin: "0",
    fontSize: "12px",
    color: "#64748b"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap"
  },
  reservationDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px"
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  detailLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase"
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a"
  },
  requests: {
    padding: "12px",
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "12px",
    color: "#0369a1"
  },
  reservationActions: {
    display: "flex",
    gap: "8px"
  },
  actionBtn: {
    flex: 1,
    padding: "10px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px"
  },
  issueFormContainer: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#fff7ed",
    borderRadius: "8px",
    border: "1px solid #fed7aa"
  },
  issueFormTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#92400e"
  },
  issueForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "4px",
    display: "block"
  },
  input: {
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit"
  },
  textarea: {
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical"
  },
  select: {
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit"
  },
  submitBtn: {
    padding: "10px",
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px"
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px"
  },
  actionCard: {
    padding: "16px",
    backgroundColor: "#f0f9ff",
    border: "2px solid #0284c7",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0369a1",
    transition: "all 0.2s"
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b"
  }
};
