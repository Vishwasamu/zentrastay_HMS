import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../../lib/api";
import { Link, useLocation } from "react-router-dom";

export default function AvailableRooms() {
  const location = useLocation();

  const incoming = location.state?.searchParams || location.state || null;
  const initialCheckIn = incoming?.checkIn || incoming?.check_in_date || "";
  const initialCheckOut = incoming?.checkOut || incoming?.check_out_date || "";
  const initialGuests = Number(incoming?.guests || incoming?.number_of_guests || 1);
  const initialRoomType = incoming?.roomType || incoming?.room_type || "All Rooms";

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const [priceRange] = useState({ min: 1, max: 1000 });
  const [selectedPrice, setSelectedPrice] = useState(priceRange.max);

  const [selectedRoomTypes, setSelectedRoomTypes] = useState(
    initialRoomType && initialRoomType !== "Any Room" && initialRoomType !== "All Rooms"
      ? [initialRoomType]
      : ["All Rooms"]
  );

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [guests, setGuests] = useState(initialGuests);

  const amenitiesList = [
    "Free WiFi",
    "Air Conditioning",
    "Swimming Pool",
    "Spa",
    "Fitness Center",
  ];

  const loadRooms = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/rooms/list");
      const list = res?.rooms || [];
      setRooms(list);
      setFilteredRooms(list);
    } catch (e) {
      setErr(e?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const searchAvailability = async (ci, co) => {
    setErr("");
    if (!ci || !co) {
      setErr("Please select check-in and check-out dates");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/rooms/availability", {
        check_in_date: ci,
        check_out_date: co,
      });

      const list = res?.rooms || [];
      setRooms(list);
      setFilteredRooms(list);
    } catch (e) {
      setErr(e?.message || "Failed to check availability");
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = useCallback(() => {
    let filtered = [...rooms];

    // Guests capacity filter
    if (guests > 0) {
      filtered = filtered.filter((room) => Number(room.capacity || 0) >= guests);
    }

    // Room type filter
    if (!selectedRoomTypes.includes("All Rooms") && selectedRoomTypes.length > 0) {
      filtered = filtered.filter((room) => {
        const roomType = String(room.room_type || "").toLowerCase().trim();
        return selectedRoomTypes.some((type) => 
          roomType === type.toLowerCase().trim()
        );
      });
    }

    // Price filter - show rooms with price ≤ selected price
    filtered = filtered.filter((room) => {
      const price = Number(room.base_price || 0);
      return price <= selectedPrice;
    });

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((room) => {
        const roomAmenities = Array.isArray(room.amenities) 
          ? room.amenities 
          : (typeof room.amenities === 'string' 
              ? room.amenities.split(',').map(a => a.trim()) 
              : []);
        return selectedAmenities.every((amenity) => 
          roomAmenities.some(roomAmenity => 
            String(roomAmenity).toLowerCase().includes(amenity.toLowerCase())
          )
        );
      });
    }

    setFilteredRooms(filtered);
  }, [rooms, guests, selectedRoomTypes, selectedPrice, selectedAmenities]);

  useEffect(() => {
    if (initialCheckIn && initialCheckOut) {
      searchAvailability(initialCheckIn, initialCheckOut);
    } else {
      loadRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterRooms();
  }, [filterRooms]);

  const handleRoomTypeClick = (roomType) => {
    if (roomType === "All Rooms") {
      setSelectedRoomTypes(["All Rooms"]);
    } else {
      const newTypes = selectedRoomTypes.includes("All Rooms")
        ? [roomType]
        : selectedRoomTypes.includes(roomType)
        ? selectedRoomTypes.filter((t) => t !== roomType)
        : [...selectedRoomTypes, roomType];

      setSelectedRoomTypes(newTypes.length === 0 ? ["All Rooms"] : newTypes);
    }
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSelectedPrice(priceRange.max);
    setSelectedRoomTypes(["All Rooms"]);
    setSelectedAmenities([]);
    setGuests(1);
    setCheckIn("");
    setCheckOut("");
    loadRooms();
  };

  const roomTypesFromDB = useMemo(() => {
    const map = new Map();
    rooms.forEach((r) => {
      const t = r.room_type || "Unknown";
      map.set(t, (map.get(t) || 0) + 1);
    });

    const list = [{ name: "All Rooms", count: rooms.length }];
    Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([name, count]) => list.push({ name, count }));

    return list;
  }, [rooms]);

  const styles = {
    container: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
    },
    header: { marginBottom: "30px" },
    headerTitle: { fontSize: "28px", fontWeight: "600", color: "#333", margin: "0 0 8px 0" },
    roomCount: { fontSize: "14px", color: "#666", marginBottom: "24px" },
    mainLayout: { display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px" },
    sidebar: {
      background: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      height: "fit-content",
    },
    filterSection: { marginBottom: "32px" },
    sectionTitle: { fontSize: "16px", fontWeight: "600", color: "#333", margin: "0 0 16px 0" },
    priceDisplay: { display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#666" },
    selectedPrice: {
      fontSize: "14px",
      color: "#333",
      padding: "12px",
      backgroundColor: "#f0f7ff",
      borderRadius: "8px",
      borderLeft: "4px solid #4a6cf7",
      marginTop: "16px",
    },
    roomTypeList: { listStyle: "none", padding: "0", margin: "0" },
    roomTypeItem: (isSelected, isDisabled) => ({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      marginBottom: "8px",
      borderRadius: "8px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      border: "1px solid #e0e0e0",
      backgroundColor: isSelected ? "#e8f0fe" : "white",
      borderColor: isSelected ? "#4a6cf7" : "#e0e0e0",
      color: isSelected ? "#4a6cf7" : "#333",
      opacity: isDisabled ? "0.5" : "1",
    }),
    amenitiesList: { listStyle: "none", padding: "0", margin: "0" },
    amenityItem: { marginBottom: "12px" },
    amenityLabel: { display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px", color: "#333" },
    amenityCheckbox: { display: "none" },
    checkmark: (isChecked) => ({
      width: "18px",
      height: "18px",
      border: "2px solid #ddd",
      borderRadius: "4px",
      marginRight: "10px",
      position: "relative",
      backgroundColor: isChecked ? "#4a6cf7" : "white",
      borderColor: isChecked ? "#4a6cf7" : "#ddd",
    }),
    checkmarkAfter: { position: "absolute", color: "white", fontSize: "12px", top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    mainContent: {
      background: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    searchBar: { marginBottom: "24px" },
    dateInputs: { display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" },
    dateInput: { flex: "1", minWidth: "180px" },
    dateLabel: { fontSize: "12px", color: "#666", marginBottom: "6px", opacity: "0.8" },
    datePicker: { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none" },
    button: { padding: "10px 24px", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s ease", height: "42px", alignSelf: "flex-end" },
    searchButton: { backgroundColor: "#4a6cf7", color: "white" },
    resetButton: { backgroundColor: "#f0f0f0", color: "#333" },
    errorMessage: { color: "#dc3545", padding: "12px", backgroundColor: "#f8d7da", borderRadius: "8px", margin: "16px 0" },
    loading: { textAlign: "center", padding: "40px", color: "#666" },
    roomsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px", marginTop: "24px" },
    roomCard: { border: "1px solid #e0e0e0", borderRadius: "12px", padding: "20px" },
    roomTitle: { fontSize: "20px", fontWeight: "600", color: "#333", margin: "0 0 16px 0" },
    roomMeta: { display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #f0f0f0" },
    metaItem: { display: "flex", alignItems: "center", fontSize: "14px", color: "#666", gap: "6px" },
    price: { color: "#4a6cf7", fontWeight: "600", fontSize: "16px" },
    perNight: { fontSize: "12px", color: "#666", fontWeight: "normal" },
    roomDescription: { fontSize: "14px", color: "#666", lineHeight: "1.5", margin: "0 0 16px 0" },
    roomActions: { display: "flex", gap: "12px", marginTop: "20px" },
    viewDetailsButton: { flex: "1", padding: "12px", backgroundColor: "white", color: "#4a6cf7", border: "2px solid #4a6cf7", borderRadius: "8px", cursor: "pointer", fontWeight: "500" },
    bookNowButton: { width: "100%", padding: "12px", backgroundColor: "#4a6cf7", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" },
    noRooms: { textAlign: "center", padding: "40px", color: "#666", fontSize: "16px" },
    availableBadge: { position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#28a745", color: "white", padding: "8px 16px", borderRadius: "20px", fontWeight: "600", fontSize: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
  };

  const Icon = ({ type }) => {
    const icons = { user: "👤" };
    return <span style={{ fontSize: "14px" }}>{icons[type]}</span>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>All Rooms & Suites</h1>
        <div style={styles.roomCount}>Showing {filteredRooms.length} room types</div>
      </div>

      <div style={styles.mainLayout}>
        <div style={styles.sidebar}>
          <div style={styles.filterSection}>
            <h3 style={styles.sectionTitle}>Maximum Price</h3>
            <div style={styles.priceDisplay}>
              <span>{priceRange.min.toLocaleString()} USD</span>
              <span>{priceRange.max.toLocaleString()} USD</span>
            </div>

            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step="100"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(parseInt(e.target.value))}
              style={{ 
                width: "100%", 
                height: "6px", 
                WebkitAppearance: "none", 
                background: "linear-gradient(to right, #e0e0e0, #4a6cf7)", 
                borderRadius: "3px", 
                outline: "none", 
                marginBottom: "16px" 
              }}
            />

            <div style={styles.selectedPrice}>
              Max Price: <strong>{selectedPrice.toLocaleString()} USD</strong>
            </div>
          </div>

          <div style={styles.filterSection}>
            <h3 style={styles.sectionTitle}>Room Types</h3>
            <ul style={styles.roomTypeList}>
              {roomTypesFromDB.map((t) => {
                const isSelected = selectedRoomTypes.includes(t.name);
                const isDisabled = t.count === 0;
                return (
                  <li
                    key={t.name}
                    style={styles.roomTypeItem(isSelected, isDisabled)}
                    onClick={() => !isDisabled && handleRoomTypeClick(t.name)}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>{t.name}</span>
                    <span style={{ fontSize: "13px" }}>({t.count})</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={styles.filterSection}>
            <h3 style={styles.sectionTitle}>Amenities</h3>
            <ul style={styles.amenitiesList}>
              {amenitiesList.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <li key={amenity} style={styles.amenityItem}>
                    <label style={styles.amenityLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAmenityToggle(amenity)}
                        style={styles.amenityCheckbox}
                      />
                      <div style={styles.checkmark(isChecked)}>
                        {isChecked && <span style={styles.checkmarkAfter}>✓</span>}
                      </div>
                      {amenity}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.searchBar}>
            <div style={styles.dateInputs}>
              <div style={styles.dateInput}>
                <div style={styles.dateLabel}>Check-in</div>
                <input 
                  type="date" 
                  value={checkIn} 
                  onChange={(e) => setCheckIn(e.target.value)} 
                  style={styles.datePicker} 
                />
              </div>
              <div style={styles.dateInput}>
                <div style={styles.dateLabel}>Check-out</div>
                <input 
                  type="date" 
                  value={checkOut} 
                  onChange={(e) => setCheckOut(e.target.value)} 
                  style={styles.datePicker} 
                />
              </div>

              <div style={styles.dateInput}>
                <div style={styles.dateLabel}>Guests</div>
                <input 
                  type="number" 
                  min="1" 
                  value={guests} 
                  onChange={(e) => setGuests(Number(e.target.value || 1))} 
                  style={styles.datePicker}
                />
              </div>

              <button
                onClick={() => searchAvailability(checkIn, checkOut)}
                style={{ ...styles.button, ...styles.searchButton }}
              >
                Search
              </button>
              <button 
                onClick={resetFilters} 
                style={{ ...styles.button, ...styles.resetButton }}
              >
                Reset
              </button>
            </div>
          </div>

          {err && <div style={styles.errorMessage}>{err}</div>}
          {loading && <div style={styles.loading}>Loading...</div>}

          {!loading && filteredRooms.length > 0 && (
            <div style={styles.roomsGrid}>
              {filteredRooms.map((room) => (
                <div key={room.id} style={styles.roomCard}>
                  <h3 style={styles.roomTitle}>{room.room_type}</h3>

                  <div style={styles.roomMeta}>
                    <span style={styles.metaItem}>
                      <Icon type="user" /> {room.capacity || 2} Guests
                    </span>
                    <span style={{ ...styles.metaItem, ...styles.price }}>
                      USD {Number(room.base_price || 0).toLocaleString()} <span style={styles.perNight}>per night</span>
                    </span>
                  </div>

                  <p style={styles.roomDescription}>
                    {room.description || "A comfortable room with modern amenities and excellent service."}
                  </p>

                  <div style={styles.roomActions}>
                    <button type="button" style={styles.viewDetailsButton}>
                      View Details
                    </button>

                    <Link
                      to="/confirm-booking"
                      state={{ 
                        selectedRoom: room, 
                        searchParams: { checkIn, checkOut }, 
                        guests 
                      }}
                      style={{ textDecoration: "none", flex: 1 }}
                    >
                      <button type="button" style={styles.bookNowButton}>
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredRooms.length === 0 && (
            <div style={styles.noRooms}>No rooms available matching your criteria</div>
          )}
        </div>
      </div>

      <div style={styles.availableBadge}>AVAILABLE</div>
    </div>
  );
}