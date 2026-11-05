import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Camera,
  X,
  ArrowRight,
  HelpCircle,
  Clock,
  MapPin,
  Tag
} from "lucide-react";

const ISSUE_TEMPLATES = [
  {
    key: "ac",
    label: "AC",
    category: "AC Not Working",
    title: "AC not cooling / not working",
    icon: "❄️",
    color: "#0ea5e9",
    prompts: [
      "Is the AC turning on?",
      "Is it blowing air but not cooling?",
      "What temperature did you set?",
      "Any error code on the AC display?",
      "Since when did the problem start?"
    ],
    quickAdd: [
      "AC turns on but not cooling.",
      "AC not turning on at all.",
      "Remote not responding.",
      "AC making unusual sound.",
      "AC leaking water."
    ],
  },
  {
    key: "wifi",
    label: "WiFi",
    category: "WiFi Issue",
    title: "WiFi not working / slow",
    icon: "📶",
    color: "#8b5cf6",
    prompts: [
      "Which device? (phone/laptop)",
      "Is WiFi connected but no internet?",
      "Is it slow or disconnecting?",
      "Room number / location?",
      "Approx. time issue started?"
    ],
    quickAdd: [
      "WiFi connected but no internet.",
      "WiFi password not working.",
      "WiFi very slow.",
      "WiFi keeps disconnecting."
    ],
  },
  {
    key: "water",
    label: "Water",
    category: "Hot Water Issue",
    title: "Hot water not available",
    icon: "🚿",
    color: "#06b6d4",
    prompts: [
      "Which bathroom/shower?",
      "Is water cold or fluctuating?",
      "Since when?",
      "Any heater switch turned on/off?"
    ],
    quickAdd: [
      "No hot water in shower.",
      "Hot water comes and goes.",
      "Water pressure is low."
    ],
  },
  {
    key: "electric",
    label: "Electric",
    category: "Electricity / Lights",
    title: "Lights or power issue",
    icon: "💡",
    color: "#f59e0b",
    prompts: [
      "Which area? (bedroom/bathroom)",
      "Is it fully off or flickering?",
      "Any plug points not working?"
    ],
    quickAdd: [
      "Lights not working in room.",
      "Power socket not working.",
      "Lights flickering."
    ],
  },
  {
    key: "clean",
    label: "Clean",
    category: "Cleanliness",
    title: "Cleaning request / cleanliness issue",
    icon: "🧹",
    color: "#10b981",
    prompts: [
      "Which area needs cleaning?",
      "Do you need towels/linen refill?",
      "Preferred time for housekeeping?"
    ],
    quickAdd: [
      "Need room cleaning.",
      "Need fresh towels.",
      "Need linen change."
    ],
  },
  {
    key: "noise",
    label: "Noise",
    category: "Noise",
    title: "Noise complaint",
    icon: "🔇",
    color: "#ef4444",
    prompts: [
      "Where is the noise coming from?",
      "What time did it start?",
      "Continuous or occasional?"
    ],
    quickAdd: [
      "Noise from nearby room.",
      "Noise from outside.",
      "Noise from AC/pipe."
    ],
  },
  {
    key: "other",
    label: "Other",
    category: "Other",
    title: "",
    icon: "❓",
    color: "#6b7280",
    prompts: ["Describe the issue clearly."],
    quickAdd: [],
  },
];

const empty = {
  templateKey: "ac",
  category: "AC Not Working",
  title: "AC not cooling / not working",
  description: "",
  emergency: false,
  location: "",
};

export default function GuestIssues() {
  const nav = useNavigate();
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [guestId, setGuestId] = useState(0);
  const [roomId, setRoomId] = useState(0);

  const template = useMemo(
    () => ISSUE_TEMPLATES.find((t) => t.key === form.templateKey) || ISSUE_TEMPLATES[0],
    [form.templateKey]
  );

  // Load guest ID and room ID from profile and current reservation
  useEffect(() => {
    const loadGuestAndRoom = async () => {
      if (!user) return;
      
      try {
        // Try to get guest ID from auth context first
        if (user.id) {
          setGuestId(Number(user.id));
        }
        
        // Try to get current room from reservations
        try {
          const res = await api.get("/guest/my-bookings");
          const reservations = res?.reservations || [];
          
          // Find active reservation (check-in date <= today and check-out date >= today)
          const today = new Date().toISOString().split('T')[0];
          const activeReservation = reservations.find(r => 
            r.check_in_date <= today && r.check_out_date >= today
          );
          
          if (activeReservation && activeReservation.room_id) {
            setRoomId(Number(activeReservation.room_id));
          }
        } catch (resError) {
          console.warn("Could not load reservations:", resError);
        }
      } catch (error) {
        console.error("Failed to load guest profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;
    if (!user) {
      nav("/guest/login", { replace: true });
      return;
    }
    
    loadGuestAndRoom();
  }, [authLoading, user, nav]);

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickTemplate = (key) => {
    const t = ISSUE_TEMPLATES.find((x) => x.key === key) || ISSUE_TEMPLATES[0];
    setErr("");
    setOk("");
    setPhoto(null);

    setForm((prev) => ({
      ...prev,
      templateKey: t.key,
      category: t.category,
      title: t.key === "other" ? "" : t.title,
      description: "",
    }));
  };

  const addToDesc = (text) => {
    setForm((prev) => {
      const base = prev.description?.trim() ? prev.description.trim() + "\n" : "";
      return { ...prev, description: base + "• " + text };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const category = form.category.trim();
    const title = form.title.trim();
    const description = form.description.trim();

    if (!category) return setErr("Please select or type a category.");
    if (!title) return setErr("Please enter a title.");
    if (!description) return setErr("Please describe the issue.");
    
    if (!guestId || guestId === 0) {
      return setErr("Please login to submit an issue.");
    }

    if (!roomId || roomId === 0) {
      return setErr("No active reservation found. Please check your bookings.");
    }

    // Calculate priority based on emergency
    const priority = form.emergency ? "high" : "medium";

    // Prepare data for API
    const data = {
      guest_id: guestId,
      room_id: roomId,
      category: category,
      title: title,
      description: description,
      location: form.location || "",
      emergency: form.emergency ? 1 : 0,
      priority: priority,
    };

    // Use FormData if photo exists, otherwise use JSON
    let requestData;
    if (photo) {
      const fd = new FormData();
      Object.keys(data).forEach(key => {
        fd.append(key, data[key]);
      });
      fd.append("photo", photo);
      requestData = fd;
    } else {
      requestData = data;
    }

    setSubmitting(true);
    try {
      if (photo) {
        // Use postForm for FormData
        await api.postForm("/api/issues/create.php", requestData);
      } else {
        // Use regular post for JSON
        await api.post("/api/issues/create.php", requestData);
      }

      setOk("Issue submitted successfully. Our team will get back to you soon.");
      setForm(empty);
      setPhoto(null);
    } catch (error) {
      console.error("Submit error:", error);
      setErr(error.message || "Failed to submit issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={head}>
          <div style={headerContent}>
            <div style={titleSection}>
              <h1 style={title}>Report an Issue</h1>
              <div style={sub}>Select an issue type and provide details for quick assistance</div>
              {guestId > 0 && (
                <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 8 }}>
                  Guest ID: {guestId}
                </div>
              )}
            </div>
            <div style={progressIndicator}>
              <div style={progressStep}>
                <div style={{...progressCircle, background: '#3b82f6', color: 'white'}}>1</div>
                <div style={progressLabel}>Select Issue</div>
              </div>
              <div style={progressLine}></div>
              <div style={progressStep}>
                <div style={{...progressCircle, background: form.category ? '#3b82f6' : '#374151', color: 'white'}}>2</div>
                <div style={progressLabel}>Add Details</div>
              </div>
            </div>
          </div>
        </div>

        <div style={section}>
          <div style={sectionHeader}>
            <Tag size={18} />
            <h3 style={sectionTitle}>What's the issue?</h3>
          </div>
          <div style={chipsRow}>
            {ISSUE_TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => pickTemplate(t.key)}
                style={{
                  ...chip,
                  borderColor: form.templateKey === t.key ? t.color : "#374151",
                  background: form.templateKey === t.key ? `${t.color}15` : "#1f2937",
                  color: form.templateKey === t.key ? t.color : "#d1d5db",
                }}
              >
                <span style={chipIcon}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {err && (
          <div style={alertError}>
            <AlertCircle size={18} />
            <span>{err}</span>
          </div>
        )}
        
        {ok && (
          <div style={alertSuccess}>
            <CheckCircle size={18} />
            <span>{ok}</span>
          </div>
        )}

        <form onSubmit={submit} style={formGrid}>
          <div style={section}>
            <div style={sectionHeader}>
              <HelpCircle size={18} />
              <h3 style={sectionTitle}>Issue Details</h3>
            </div>
            
            <div style={fieldsGrid}>
              <div style={field}>
                <label style={label}>
                  <span>Category</span>
                  {form.templateKey !== "other" && (
                    <span style={autoLabel}>Auto-filled</span>
                  )}
                </label>
                <input
                  value={form.category}
                  onChange={(e) => setValue("category", e.target.value)}
                  style={input}
                  placeholder="e.g., AC Not Working"
                  disabled={form.templateKey !== "other"}
                />
              </div>

              <div style={field}>
                <label style={label}>Issue Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setValue("title", e.target.value)}
                  style={input}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div style={{...field, gridColumn: 'span 2'}}>
                <div style={labelRow}>
                  <label style={label}>Location (Optional)</label>
                  <MapPin size={14} style={{opacity: 0.6}} />
                </div>
                <input
                  value={form.location}
                  onChange={(e) => setValue("location", e.target.value)}
                  style={input}
                  placeholder="Room number, building, or area"
                />
              </div>
            </div>
          </div>

          <div style={section}>
            <div style={sectionHeader}>
              <Clock size={18} />
              <h3 style={sectionTitle}>Describe the Issue</h3>
            </div>
            
            <div style={suggestionsSection}>
              <div style={suggestionGroup}>
                <div style={suggestionTitle}>Suggested Questions</div>
                <div style={suggestionChips}>
                  {template.prompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addToDesc(p)}
                      style={suggestionChip}
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              {template.quickAdd?.length > 0 && (
                <div style={suggestionGroup}>
                  <div style={suggestionTitle}>Quick Add Phrases</div>
                  <div style={suggestionChips}>
                    {template.quickAdd.map((x) => (
                      <button
                        key={x}
                        type="button"
                        onClick={() => addToDesc(x)}
                        style={suggestionChip}
                      >
                        + {x}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={field}>
              <label style={label}>
                Description
                <span style={required}> *</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setValue("description", e.target.value)}
                style={textarea}
                placeholder="Describe what's happening, when it started, and any relevant details..."
                rows={5}
              />
              <div style={charCount}>
                {form.description.length} characters
              </div>
            </div>
          </div>

          <div style={section}>
            <div style={sectionHeader}>
              <Zap size={18} />
              <h3 style={sectionTitle}>Priority & Media</h3>
            </div>

            <div style={fieldsGrid}>
              <div style={field}>
                <label style={label}>Priority Level</label>
                <div style={priorityCard}>
                  <div style={priorityToggle}>
                    <input
                      type="checkbox"
                      id="emergency"
                      checked={form.emergency}
                      onChange={(e) => setValue("emergency", e.target.checked)}
                      style={hiddenCheckbox}
                    />
                    <label htmlFor="emergency" style={toggleSwitch}>
                      <div style={toggleSlider}></div>
                      <span style={toggleLabel}>Emergency</span>
                    </label>
                  </div>
                  <div style={priorityHint}>
                    <AlertCircle size={14} />
                    <span>For urgent issues needing immediate attention</span>
                  </div>
                </div>
              </div>

              <div style={{...field, gridColumn: 'span 2'}}>
                <label style={label}>Add Photo (Optional)</label>
                <div style={uploadArea}>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    style={hiddenFileInput}
                  />
                  <label htmlFor="photo-upload" style={uploadButton}>
                    <Camera size={20} />
                    <span>Choose Photo</span>
                  </label>
                  <div style={uploadHint}>JPG, PNG up to 5MB</div>
                </div>
                
                {preview && (
                  <div style={previewCard}>
                    <div style={previewHeader}>
                      <span>Photo Preview</span>
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        style={removeButton}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <img src={preview} alt="preview" style={previewImage} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={actionBar}>
            <button
              type="button"
              style={secondaryButton}
              onClick={() => {
                setErr("");
                setOk("");
                setForm(empty);
                setPhoto(null);
              }}
              disabled={submitting}
            >
              Clear All
            </button>
            <button
              disabled={submitting || guestId === 0}
              style={{
                ...primaryButton,
                opacity: guestId === 0 ? 0.5 : 1,
              }}
              type="submit"
            >
              {submitting ? (
                <>
                  <div style={spinner}></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Issue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles (same as before, but here are the essential ones to include)
const wrap = { 
  minHeight: "100vh", 
  padding: "24px 16px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
};

const card = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#1e293b",
  color: "#f1f5f9",
  borderRadius: 20,
  padding: 32,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
};

const head = {
  marginBottom: 32,
};

const headerContent = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24
};

const titleSection = {
  textAlign: 'center'
};

const title = { 
  fontSize: 32, 
  fontWeight: 800,
  background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: 8
};

const sub = { 
  fontSize: 16, 
  opacity: 0.8,
  maxWidth: 500,
  margin: "0 auto"
};

const progressIndicator = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8
};

const progressStep = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8
};

const progressCircle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: 14
};

const progressLabel = {
  fontSize: 12,
  opacity: 0.8,
  fontWeight: 500
};

const progressLine = {
  width: 60,
  height: 2,
  background: '#374151',
  margin: '0 4px'
};

const section = {
  marginBottom: 32,
  padding: 24,
  background: '#0f172a',
  borderRadius: 16,
  border: '1px solid #334155'
};

const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 20
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 600,
  margin: 0
};

const chipsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
  gap: 12
};

const chip = {
  padding: "16px 12px",
  borderRadius: 12,
  border: "1px solid",
  background: "#1f2937",
  color: "#d1d5db",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  transition: "all 0.2s"
};

const chipIcon = {
  fontSize: 20
};

const alertError = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  background: '#7f1d1d',
  border: '1px solid #ef4444',
  color: '#fecaca',
  borderRadius: 12,
  marginBottom: 24,
  fontSize: 14
};

const alertSuccess = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  background: '#064e3b',
  border: '1px solid #10b981',
  color: '#a7f3d0',
  borderRadius: 12,
  marginBottom: 24,
  fontSize: 14
};

const formGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24
};

const fieldsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20
};

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const label = {
  fontSize: 14,
  fontWeight: 600,
  color: '#cbd5e1',
  display: 'flex',
  alignItems: 'center',
  gap: 8
};

const labelRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const autoLabel = {
  fontSize: 12,
  fontWeight: 500,
  background: '#3b82f6',
  color: 'white',
  padding: '2px 8px',
  borderRadius: 6
};

const required = {
  color: '#ef4444'
};

const input = {
  borderRadius: 12,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#f1f5f9",
  padding: "12px 16px",
  outline: "none",
  fontSize: 14,
  transition: 'border 0.2s'
};

const textarea = {
  ...input,
  minHeight: 120,
  resize: "vertical",
  fontFamily: 'inherit'
};

const charCount = {
  fontSize: 12,
  color: '#94a3b8',
  textAlign: 'right'
};

const suggestionsSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  marginBottom: 24
};

const suggestionGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

const suggestionTitle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#cbd5e1'
};

const suggestionChips = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8
};

const suggestionChip = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#cbd5e1",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  transition: 'all 0.2s'
};

const priorityCard = {
  padding: 16,
  background: '#0f172a',
  border: '1px solid #475569',
  borderRadius: 12
};

const priorityToggle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12
};

const hiddenCheckbox = {
  display: 'none'
};

const toggleSwitch = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  cursor: 'pointer'
};

const toggleSlider = {
  width: 40,
  height: 20,
  background: '#475569',
  borderRadius: 20,
  position: 'relative'
};

const toggleLabel = {
  fontSize: 14,
  fontWeight: 500
};

const priorityHint = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  color: '#94a3b8',
  marginTop: 8
};

const uploadArea = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  background: '#0f172a',
  border: '2px dashed #475569',
  borderRadius: 12,
  transition: 'border 0.2s'
};

const hiddenFileInput = {
  display: 'none'
};

const uploadButton = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  background: '#3b82f6',
  color: 'white',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 14,
  transition: 'background 0.2s'
};

const uploadHint = {
  fontSize: 12,
  color: '#94a3b8'
};

const previewCard = {
  marginTop: 16,
  border: '1px solid #475569',
  borderRadius: 12,
  overflow: 'hidden'
};

const previewHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 12,
  background: '#0f172a',
  borderBottom: '1px solid #475569'
};

const removeButton = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: '#475569',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s'
};

const previewImage = {
  width: '100%',
  height: 200,
  objectFit: 'cover'
};

const actionBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px 0',
  borderTop: '1px solid #334155'
};

const primaryButton = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: "16px 32px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "white",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  transition: 'all 0.2s'
};

const secondaryButton = {
  padding: "12px 24px",
  borderRadius: 12,
  border: "1px solid #475569",
  background: "transparent",
  color: "#94a3b8",
  fontWeight: 500,
  fontSize: 14,
  cursor: "pointer",
  transition: 'all 0.2s'
};

const spinner = {
  width: 16,
  height: 16,
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: 'white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

// Add CSS for hover effects
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .suggestionChip:hover {
    background: #334155;
    border-color: #3b82f6;
  }
  
  .input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .primaryButton:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  }
  
  .secondaryButton:hover:not(:disabled) {
    background: #334155;
    color: #f1f5f9;
  }
  
  .uploadButton:hover {
    background: #2563eb;
  }
  
  .removeButton:hover {
    background: #ef4444;
  }
  
  .toggleSlider:before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  
  input[type="checkbox"]:checked + label .toggleSlider {
    background: #3b82f6;
  }
  
  input[type="checkbox"]:checked + label .toggleSlider:before {
    transform: translateX(20px);
  }
`;
document.head.appendChild(styleTag);