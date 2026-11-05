import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function CreateRoom() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    room_number: "",
    floor: 1,
    room_type: "Standard",
    capacity: 2,
    base_price: 0,
    status: "available",
    description: "",
    room_features: [],
    bed_count: 1,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [imagePreview, setImagePreview] = useState(null);

  const roomTypes = [
    {
      value: "Standard",
      label: "Standard",
      description: "Basic room with essential amenities",
      bedCount: 1,
      icon: "🛏️",
      color: "#3b82f6"
    },
    {
      value: "Single",
      label: "Single",
      description: "Single bed for solo travelers",
      bedCount: 1,
      icon: "🛌",
      color: "#10b981"
    },
    {
      value: "Double",
      label: "Double",
      description: "Double bed for couples",
      bedCount: 1,
      icon: "👨‍❤️‍👨",
      color: "#8b5cf6"
    },
    {
      value: "Family",
      label: "Family",
      description: "Spacious room for families",
      bedCount: 3,
      icon: "👨‍👩‍👧‍👦",
      color: "#f59e0b"
    }
  ];

  const features = ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Sea View", "Jacuzzi", "Kitchenette"];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoomTypeSelect = (type) => {
    const selectedType = roomTypes.find(rt => rt.value === type);
    setForm(prev => ({
      ...prev,
      room_type: type,
      bed_count: selectedType.bedCount,
      capacity: type === "Family" ? 4 : (type === "Double" ? 2 : 1)
    }));
  };

  const toggleFeature = (feature) => {
    setForm(prev => ({
      ...prev,
      room_features: prev.room_features.includes(feature)
        ? prev.room_features.filter(f => f !== feature)
        : [...prev.room_features, feature]
    }));
  };

  const submit = async (e) => {
  e.preventDefault();
  setErr("");
  setOk("");

  if (!form.room_number || !form.room_type) {
    setErr("Please fill in all required fields (*)");
    return;
  }

  if (form.room_number.length > 4 || !/^\d+$/.test(form.room_number)) {
    setErr("Room number must be numeric and max 4 digits");
    return;
  }

  if (form.floor > 99) {
    setErr("Floor number must be max 2 digits");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      room_number: String(form.room_number).trim(),
      floor: Number(form.floor),
      room_type: String(form.room_type).trim(),
      capacity: Number(form.capacity),
      base_price: Number(form.base_price),
      status: String(form.status).trim(),
      description: String(form.description || "").trim(),
    };

    // ✅ IMPORTANT: match your backend route
    const res = await api.post("/rooms/create", payload);


    setOk(res.message || "Room created successfully!");
    setTimeout(() => nav("/admin/rooms"), 1500);
  } catch (ex) {
    setErr(
      ex?.message ||
      "Failed to create room"
    );
  } finally {
    setLoading(false);
  }
};


  const isFormValid = form.room_number && form.room_type;

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Hotel Admin</h1>
          <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: 14 }}>
            Management System
          </p>
        </div>
        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "#1f2937",
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: 14
        }}>
          <span style={{ opacity: 0.7 }}>Admin User:</span>
          <span style={{ fontWeight: 500 }}>Administrator</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 24 }}>
        {/* Left Column - Form */}
        <div>
          {/* Dashboard Navigation */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 8,
            marginBottom: 24
          }}>
            
          </div>

          {/* Form Card */}
          <div style={card}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>Create Room</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.7 }}>
                  Complete all required fields (*) to enable room creation
                </p>
              </div>
              <button
                onClick={() => nav("/admin/rooms")}
                style={btn}
                type="button"
              >
                ← Back
              </button>
            </div>

            <div style={{
              background: "#0b1220",
              padding: "12px 16px",
              borderRadius: 12,
              marginBottom: 24,
              border: "1px solid #374151"
            }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Room Information</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.7 }}>
                Fill in the room details below
              </p>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              borderBottom: "1px solid #374151",
              paddingBottom: 12
            }}>
              <button
                onClick={() => setActiveTab("basic")}
                style={{
                  padding: "8px 16px",
                  background: activeTab === "basic" ? "#4f46e5" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: activeTab === "basic" ? "#fff" : "#9ca3af",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: activeTab === "basic" ? 500 : 400
                }}
              >
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab("features")}
                style={{
                  padding: "8px 16px",
                  background: activeTab === "features" ? "#4f46e5" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: activeTab === "features" ? "#fff" : "#9ca3af",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: activeTab === "features" ? 500 : 400
                }}
              >
                Features
              </button>
            </div>

            <form onSubmit={submit}>
              {activeTab === "basic" && (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Required Fields</div>
                    <div style={grid2}>
                      {/* Room Number */}
                      <div>
                        <div style={{ ...label, display: "flex", alignItems: "center", gap: 4 }}>
                          Room Number <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                        <input
                          style={input}
                          value={form.room_number}
                          onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                          placeholder="101"
                          maxLength={4}
                        />
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                          Unique room identifier (numbers only, max 4 digits)
                        </div>
                      </div>

                      {/* Floor */}
                      <div>
                        <div style={{ ...label, display: "flex", alignItems: "center", gap: 4 }}>
                          Floor <span style={{ color: "#ef4444" }}>*</span>
                        </div>
                        <input
                          style={input}
                          type="number"
                          value={form.floor}
                          onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                          placeholder="1"
                          min="0"
                          max="99"
                        />
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                          Floor level (0 for ground floor, max 2 digits)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Type Selection */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ ...label, display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                      Room Type <span style={{ color: "#ef4444" }}>*</span>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 12
                    }}>
                      {roomTypes.map(type => (
                        <div
                          key={type.value}
                          onClick={() => handleRoomTypeSelect(type.value)}
                          style={{
                            padding: 16,
                            background: form.room_type === type.value ? type.color + "20" : "#1f2937",
                            border: `2px solid ${form.room_type === type.value ? type.color : "#374151"}`,
                            borderRadius: 12,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 24 }}>{type.icon}</span>
                            <div>
                              <div style={{ fontWeight: 600 }}>{type.label}</div>
                              <div style={{ fontSize: 12, opacity: 0.7 }}>{type.bedCount} bed{type.bedCount > 1 ? 's' : ''}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, opacity: 0.9 }}>{type.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price and Status */}
                  <div style={grid2}>
                    <div>
                      <div style={label}>Base Price ($)</div>
                      <input
                        style={input}
                        type="number"
                        min="0"
                        value={form.base_price}
                        onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <div style={label}>Status</div>
                      <select
                        style={input}
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginTop: 20 }}>
                    <div style={label}>Description (optional)</div>
                    <textarea
                      style={{ ...input, height: 100, resize: "vertical" }}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Room details, facilities, notes..."
                    />
                  </div>
                </>
              )}

              {activeTab === "features" && (
                <div>
                  <div style={label}>Room Features</div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 8,
                    marginTop: 8
                  }}>
                    {features.map(feature => (
                      <div
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        style={{
                          padding: "10px 12px",
                          background: form.room_features.includes(feature) ? "#4f46e5" : "#1f2937",
                          border: `1px solid ${form.room_features.includes(feature) ? "#6366f1" : "#374151"}`,
                          borderRadius: 8,
                          textAlign: "center",
                          cursor: "pointer",
                          fontSize: 13,
                          transition: "all 0.2s"
                        }}
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {err && <div style={errorBox}>{err}</div>}
              {ok && <div style={okBox}>{ok}</div>}

              <button
                type="submit"
                style={{
                  ...btnPrimary,
                  marginTop: 24,
                  opacity: !isFormValid ? 0.5 : 1,
                  cursor: !isFormValid ? "not-allowed" : "pointer"
                }}
                disabled={loading || !isFormValid}
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div>
          <div style={{
            ...card,
            position: "sticky",
            top: 24
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Live Preview</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, opacity: 0.7 }}>
              Real-time room preview
            </p>

            {/* Image Upload/Preview */}
            <div
              style={{
                background: "#1f2937",
                border: "2px dashed #374151",
                borderRadius: 12,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                overflow: "hidden",
                position: "relative"
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Room preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🖼️</div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>No image uploaded</div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer"
                    }}
                  />
                </>
              )}
            </div>

            {/* Room Info Preview */}
            <div style={{
              background: "#1f2937",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #374151"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: "#4f46e5",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>
                  🏨
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    Room {form.room_number || "###"}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>📊</span> Floor {form.floor}
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderTop: "1px solid #374151",
                borderBottom: "1px solid #374151"
              }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>ROOM TYPE</div>
                  <div style={{ fontWeight: 600 }}>{form.room_type || "Select Type"}</div>
                </div>
                <div style={{
                  background: form.status === "available" ? "#10b98120" : 
                            form.status === "maintenance" ? "#f59e0b20" : "#ef444420",
                  color: form.status === "available" ? "#10b981" : 
                        form.status === "maintenance" ? "#f59e0b" : "#ef4444",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: "uppercase"
                }}>
                  {form.status || "AVAILABLE"}
                </div>
              </div>

              <div style={{ paddingTop: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>BEDS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🛏️</span>
                  <span>{roomTypes.find(rt => rt.value === form.room_type)?.bedCount || 1} bed(s)</span>
                </div>
              </div>

              {form.room_features.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>FEATURES</div>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6
                  }}>
                    {form.room_features.slice(0, 4).map(feature => (
                      <span
                        key={feature}
                        style={{
                          background: "#4f46e520",
                          color: "#818cf8",
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                    {form.room_features.length > 4 && (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>
                        +{form.room_features.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles remain the same as in your original code
const card = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 20,
  color: "#e5e7eb",
};

const label = { fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#d1d5db" };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 14,
};

const grid2 = { display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" };

const btn = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
};

const btnPrimary = {
  ...btn,
  width: "100%",
  border: "1px solid #4f46e5",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 600,
};

const errorBox = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  fontSize: 14,
  marginTop: 16,
};

const okBox = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(16,185,129,0.15)",
  border: "1px solid rgba(16,185,129,0.35)",
  color: "#bbf7d0",
  fontSize: 14,
  marginTop: 16,
};