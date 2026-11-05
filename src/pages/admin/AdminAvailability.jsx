import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuthGuard";

const AdminRoomAvailability = () => {
  const auth = useAuth();
  const [rooms, setRooms] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedRoom, setSelectedRoom] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState(1);
  const [priceType, setPriceType] = useState("default");
  const [seasonName, setSeasonName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [currentPricingId, setCurrentPricingId] = useState(null);

  const [bulkAction, setBulkAction] = useState("price_update");
  const [selectedPricing, setSelectedPricing] = useState([]);
  const [bulkPrice, setBulkPrice] = useState("");

  const [calendarView, setCalendarView] = useState(false);
  const [selectedCalendarRoom, setSelectedCalendarRoom] = useState("");
  const [calendarData, setCalendarData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (auth?.authLoading) return;
    if (!auth?.user) return;
    fetchRooms();
  }, [auth?.authLoading, auth?.user]);

  useEffect(() => {
    if (auth?.authLoading) return;
    if (!auth?.user) return;
    fetchPricing();
  }, [currentPage, auth?.authLoading, auth?.user]);

  const clearMsgs = () => {
    setError("");
    setSuccess("");
  };

  const fetchRooms = async () => {
  setError("");
  try {
    const res = await api.get("/rooms/list"); 
    const list = res?.rooms || [];
    setRooms(list);
  } catch (err) {
    setError("Failed to load rooms: " + (err?.message || "Error"));
  }
};

const fetchPricing = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get(`/admin/pricing?page=${currentPage}&limit=${itemsPerPage}`);
    setPricing(res?.data || []);
    setTotalPages(res?.totalPages || 1);
  } catch (err) {
    setError("Failed to load pricing data: " + (err?.message || "Failed to fetch"));
  } finally {
    setLoading(false);
  }
};

const fetchCalendarData = async (roomId, month, year) => {
  try {
    const res = await api.get(`/admin/availability-calendar?room_id=${roomId}&month=${month}&year=${year}`);
    setCalendarData(res?.data || {});
  } catch (err) {
    console.error("Failed to load calendar data:", err);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMsgs();

    if (!selectedRoom) return setError("Please select a room");
    if (!price || isNaN(price) || Number(price) <= 0) return setError("Please enter a valid price");
    if (!startDate || !endDate) return setError("Please select date range");
    if (new Date(startDate) > new Date(endDate)) return setError("End date must be after start date");
    if (priceType === "seasonal" && !seasonName.trim())
      return setError("Please enter season name for seasonal pricing");

    const payload = {
      room_id: Number(selectedRoom),
      price: Number(price),
      start_date: startDate,
      end_date: endDate,
      available_rooms: Number(availableRooms),
      price_type: priceType,
      season_name: priceType === "seasonal" ? seasonName : null,
      is_active: isActive ? 1 : 0,
    };

    try {
      if (editMode && currentPricingId) {
        await api.put(`/admin/pricing/${currentPricingId}`, payload);
        setSuccess("Pricing updated successfully!");
      } else {
        await api.post("/admin/pricing", payload);
        setSuccess("Price and availability added successfully!");
      }

      resetForm();
      fetchPricing();
    } catch (err) {
      setError("Failed to save: " + (err?.message || "Error"));
    }
  };

  const handleBulkAction = async () => {
    clearMsgs();

    if (selectedPricing.length === 0) return setError("Please select at least one pricing record");

    if (bulkAction === "price_update") {
      if (!bulkPrice || isNaN(bulkPrice) || Number(bulkPrice) <= 0) {
        return setError("Please enter a valid bulk price");
      }
    }

    try {
      await api.put("/admin/pricing/bulk", {
        ids: selectedPricing,
        action: bulkAction,
        price: bulkAction === "price_update" ? Number(bulkPrice) : undefined,
      });

      setSuccess("Bulk update completed successfully!");
      setSelectedPricing([]);
      setBulkPrice("");
      fetchPricing();
    } catch (err) {
      setError("Bulk update failed: " + (err?.message || "Error"));
    }
  };

  const handleEdit = (priceItem) => {
    clearMsgs();
    setEditMode(true);
    setCurrentPricingId(priceItem.id);
    setSelectedRoom(String(priceItem.room_id));
    setPrice(String(priceItem.price));
    setStartDate(priceItem.start_date);
    setEndDate(priceItem.end_date);
    setAvailableRooms(priceItem.available_rooms);
    setPriceType(priceItem.price_type || "default");
    setSeasonName(priceItem.season_name || "");
    setIsActive(priceItem.is_active === 1);
  };

  const handleDelete = async (id) => {
    clearMsgs();
    if (!window.confirm("Are you sure you want to delete this pricing record?")) return;

    try {
      await api.del(`/admin/pricing/${id}`);
      setSuccess("Pricing record deleted successfully!");
      fetchPricing();
    } catch (err) {
      setError("Failed to delete: " + (err?.message || "Error"));
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setCurrentPricingId(null);
    setSelectedRoom("");
    setPrice("");
    setStartDate("");
    setEndDate("");
    setAvailableRooms(1);
    setPriceType("default");
    setSeasonName("");
    setIsActive(true);
  };

  const togglePricingSelection = (id) => {
    setSelectedPricing((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllPricing = () => {
    if (selectedPricing.length === pricing.length) setSelectedPricing([]);
    else setSelectedPricing(pricing.map((x) => x.id));
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const isDateRangeActive = (s, e) => {
    const today = new Date();
    const start = new Date(s);
    const end = new Date(e);
    return today >= start && today <= end;
  };

  const styles = {
    container: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: 30, backgroundColor: "#f5f7fa", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingBottom: 20, borderBottom: "2px solid #e4e7eb" },
    headerTitle: { fontSize: 32, fontWeight: 700, color: "#1a365d", margin: 0 },
    headerActions: { display: "flex", gap: 15 },
    button: { padding: "12px 24px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: 8 },
    primaryButton: { background: "linear-gradient(135deg, #3182ce 0%, #2c5282 100%)", color: "white" },
    secondaryButton: { background: "#e2e8f0", color: "#4a5568" },
    tabs: { display: "flex", gap: 10, marginBottom: 30, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" },
    tab: { padding: "12px 24px", background: "none", border: "none", fontSize: 16, fontWeight: 600, color: "#718096", cursor: "pointer", borderRadius: 8, transition: "all 0.3s ease" },
    activeTab: { background: "#3182ce", color: "white" },
    message: { padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 500 },
    errorMessage: { background: "#fed7d7", color: "#9b2c2c", borderLeft: "4px solid #e53e3e" },
    successMessage: { background: "#c6f6d5", color: "#276749", borderLeft: "4px solid #38a169" },
    mainContent: { display: "grid", gridTemplateColumns: "350px 1fr", gap: 30 },
    formCard: { background: "white", borderRadius: 12, padding: 25, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    formTitle: { fontSize: 20, fontWeight: 600, color: "#2d3748", marginBottom: 20, paddingBottom: 15, borderBottom: "1px solid #e2e8f0" },
    formGroup: { marginBottom: 20 },
    label: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#4a5568" },
    required: { color: "#e53e3e" },
    input: { width: "100%", padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 8, fontSize: 14 },
    select: { width: "100%", padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "white", cursor: "pointer" },
    radioGroup: { display: "flex", gap: 20, marginTop: 10 },
    radioLabel: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
    radio: { width: 18, height: 18, cursor: "pointer" },
    checkboxLabel: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#4a5568" },
    dateRange: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 },
    formActions: { display: "flex", gap: 15, marginTop: 30, paddingTop: 20, borderTop: "1px solid #e2e8f0" },
    bulkCard: { background: "white", borderRadius: 12, padding: 25, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 30 },
    bulkHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
    bulkForm: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 20 },
    tableContainer: { background: "white", borderRadius: 12, padding: 25, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "16px 12px", textAlign: "left", borderBottom: "2px solid #e2e8f0", color: "#4a5568", fontSize: 14, fontWeight: 600, backgroundColor: "#f7fafc" },
    td: { padding: "16px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 14, color: "#2d3748" },
    badge: (type) => {
      const colors = {
        default: { bg: "#bee3f8", color: "#2c5282" },
        seasonal: { bg: "#c6f6d5", color: "#276749" },
        active: { bg: "#c6f6d5", color: "#276749" },
        inactive: { bg: "#fed7d7", color: "#9b2c2c" },
        current: { bg: "#d6bcfa", color: "#553c9a" },
        upcoming: { bg: "#feebc8", color: "#744210" },
        expired: { bg: "#e2e8f0", color: "#4a5568" },
      };
      const style = colors[type] || colors.default;
      return { padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: style.bg, color: style.color, display: "inline-block", marginTop: 6 };
    },
    actionButtons: { display: "flex", gap: 8 },
    actionButton: { padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer" },
    editButton: { background: "#bee3f8", color: "#2c5282" },
    deleteButton: { background: "#fed7d7", color: "#9b2c2c" },
    loading: { textAlign: "center", padding: 40, fontSize: 16, color: "#718096" },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 30, paddingTop: 20, borderTop: "1px solid #e2e8f0" },
    pageButton: (isActive) => ({ padding: "8px 16px", borderRadius: 6, border: "none", background: isActive ? "#3182ce" : "#e2e8f0", color: isActive ? "white" : "#4a5568", cursor: "pointer", fontSize: 14 }),
    calendarContainer: { background: "white", borderRadius: 12, padding: 25, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    calendarHeader: { display: "flex", gap: 20, marginBottom: 20, alignItems: "center" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Room Pricing & Availability Management</h1>
        <div style={styles.headerActions}>
          <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={() => setCalendarView(!calendarView)}>
            📅 {calendarView ? "List View" : "Calendar View"}
          </button>
          <button style={{ ...styles.button, ...styles.primaryButton }} onClick={resetForm}>
            ➕ Add New Pricing
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(calendarView ? {} : styles.activeTab) }} onClick={() => setCalendarView(false)}>
          Pricing Management
        </button>
        <button style={{ ...styles.tab, ...(calendarView ? styles.activeTab : {}) }} onClick={() => setCalendarView(true)}>
          Availability Calendar
        </button>
      </div>

      {error && <div style={{ ...styles.message, ...styles.errorMessage }}>⚠️ {error}</div>}
      {success && <div style={{ ...styles.message, ...styles.successMessage }}>✅ {success}</div>}

      {calendarView ? (
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <select
              value={selectedCalendarRoom}
              onChange={(e) => {
                setSelectedCalendarRoom(e.target.value);
                if (e.target.value) {
                  const today = new Date();
                  fetchCalendarData(e.target.value, today.getMonth() + 1, today.getFullYear());
                }
              }}
              style={{ ...styles.select, width: 300 }}
            >
              <option value="">-- Select Room to View Calendar --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} - {room.room_type}
                </option>
              ))}
            </select>
          </div>

          {selectedCalendarRoom ? (
            <pre style={{ background: "#f7fafc", padding: 16, borderRadius: 8, overflowX: "auto" }}>
              {JSON.stringify(calendarData, null, 2)}
            </pre>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "#718096" }}>
              Please select a room to view its availability calendar
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={styles.bulkCard}>
            <div style={styles.bulkHeader}>
              <span style={{ fontSize: 20, fontWeight: 600 }}>📦 Bulk Operations</span>
              <span style={{ fontSize: 12, color: "#718096" }}>{selectedPricing.length} record(s) selected</span>
            </div>

            <div style={styles.bulkForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bulk Action</label>
                <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} style={styles.select}>
                  <option value="price_update">Update Price</option>
                  <option value="activate">Activate Selected</option>
                  <option value="deactivate">Deactivate Selected</option>
                </select>
              </div>

              {bulkAction === "price_update" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Price ($)</label>
                  <input type="number" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} style={styles.input} placeholder="Enter new price" min="0" step="0.01" />
                </div>
              )}
            </div>

            <div style={styles.formActions}>
              <button onClick={selectAllPricing} style={{ ...styles.button, ...styles.secondaryButton }} disabled={pricing.length === 0}>
                {selectedPricing.length === pricing.length && pricing.length > 0 ? "Deselect All" : "Select All Records"}
              </button>
              <button onClick={handleBulkAction} style={{ ...styles.button, ...styles.primaryButton }} disabled={selectedPricing.length === 0}>
                Apply Bulk Update
              </button>
            </div>
          </div>

          <div style={styles.mainContent}>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>{editMode ? "Edit Pricing" : "Add Price & Availability"}</h3>

              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Select Room <span style={styles.required}>*</span>
                  </label>
                  <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} style={styles.select} required>
                    <option value="">-- Choose a room --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_number} - {room.room_type} (${room.base_price})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Price ($) <span style={styles.required}>*</span>
                  </label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} placeholder="Enter price per night" required min="0" step="0.01" />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Price Type</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input type="radio" value="default" checked={priceType === "default"} onChange={(e) => setPriceType(e.target.value)} style={styles.radio} />
                      Default Price
                    </label>
                    <label style={styles.radioLabel}>
                      <input type="radio" value="seasonal" checked={priceType === "seasonal"} onChange={(e) => setPriceType(e.target.value)} style={styles.radio} />
                      Seasonal Price
                    </label>
                  </div>
                </div>

                {priceType === "seasonal" && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Season Name</label>
                    <input type="text" value={seasonName} onChange={(e) => setSeasonName(e.target.value)} style={styles.input} placeholder="e.g., Summer Season, Holiday Season" />
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Date Range <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.dateRange}>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} required />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} required />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Available Rooms</label>
                  <input type="number" value={availableRooms} onChange={(e) => setAvailableRooms(e.target.value)} style={styles.input} min="1" />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={styles.radio} />
                    Active (available for booking)
                  </label>
                </div>

                <div style={styles.formActions}>
                  {editMode && (
                    <button type="button" onClick={resetForm} style={{ ...styles.button, ...styles.secondaryButton }}>
                      Cancel Edit
                    </button>
                  )}
                  <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
                    {editMode ? "Update Pricing" : "Save Price & Availability"}
                  </button>
                </div>
              </form>
            </div>

            <div style={styles.tableContainer}>
              <h3 style={styles.formTitle}>Pricing Records</h3>

              {loading ? (
                <div style={styles.loading}>⏳ Loading pricing data...</div>
              ) : pricing.length === 0 ? (
                <div style={styles.loading}>📋 No pricing records found</div>
              ) : (
                <>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          <input
                            type="checkbox"
                            checked={selectedPricing.length === pricing.length && pricing.length > 0}
                            onChange={selectAllPricing}
                            style={{ marginRight: 8 }}
                          />
                          Room
                        </th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Date Range</th>
                        <th style={styles.th}>Available</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.map((item) => {
                        const isCurrent = isDateRangeActive(item.start_date, item.end_date);
                        const statusType =
                          isCurrent ? "current" : new Date(item.start_date) > new Date() ? "upcoming" : "expired";

                        return (
                          <tr key={item.id}>
                            <td style={styles.td}>
                              <input
                                type="checkbox"
                                checked={selectedPricing.includes(item.id)}
                                onChange={() => togglePricingSelection(item.id)}
                                style={{ marginRight: 8 }}
                              />
                              <div>
                                <strong>{item.room_number}</strong>
                                <div style={{ fontSize: 12, color: "#718096" }}>{item.room_type}</div>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <strong>${item.price}</strong>
                            </td>
                            <td style={styles.td}>
                              <div>{formatDate(item.start_date)}</div>
                              <div style={{ fontSize: 12, color: "#718096" }}>to {formatDate(item.end_date)}</div>
                              <span style={styles.badge(statusType)}>{statusType}</span>
                            </td>
                            <td style={styles.td}>{item.available_rooms} room(s)</td>
                            <td style={styles.td}>
                              <span style={styles.badge(item.price_type)}>{item.price_type}</span>
                              {item.season_name && (
                                <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{item.season_name}</div>
                              )}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badge(item.is_active === 1 ? "active" : "inactive")}>
                                {item.is_active === 1 ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionButtons}>
                                <button style={{ ...styles.actionButton, ...styles.editButton }} onClick={() => handleEdit(item)}>
                                  Edit
                                </button>
                                <button style={{ ...styles.actionButton, ...styles.deleteButton }} onClick={() => handleDelete(item.id)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div style={styles.pagination}>
                      <button
                        style={styles.pageButton(false)}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i + 1}
                          style={styles.pageButton(currentPage === i + 1)}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        style={styles.pageButton(false)}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRoomAvailability;
