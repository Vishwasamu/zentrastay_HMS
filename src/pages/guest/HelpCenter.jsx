import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HelpCenter() {
  const { user } = useAuth();

  const email = user?.email || "guest@zentrastay.com";

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={head}>
          <div>
            <div style={title}>Help Center</div>
            <div style={sub}>
              Find quick answers or contact the front desk for support.
            </div>
          </div>
          <Link to="/guest/chat" style={btnPrimary}>
            Live Chat
          </Link>
        </div>

        <div style={grid}>
          <Section title="Quick Help">
            <QA
              q="How do I book a room?"
              a="Go to 'Book a Room' or 'Available Rooms', select dates, choose a room, and confirm your booking."
            />
            <QA
              q="Where can I see my reservations?"
              a="Open 'My Bookings' to view all your bookings and their status."
            />
            <QA
              q="How do I update my profile?"
              a="Open 'My Profile' and edit your details, then click Save."
            />
            <QA
              q="How do I cancel a booking?"
              a="Open 'My Bookings' → View booking → Cancel (if allowed). If not, contact the front desk."
            />
          </Section>

          <Section title="Common Issues">
            <QA
              q="I forgot my password"
              a="Use the login page and click 'Forgot Password' (if available) or contact the front desk for help."
            />
            <QA
              q="Payment issue"
              a="If your payment is not updated, please share your booking number via Live Chat."
            />
            <QA
              q="Room key / access problem"
              a="Contact the front desk immediately using Live Chat or call the number below."
            />
            <QA
              q="Need housekeeping"
              a="Use 'Report Issue' or message housekeeping through Live Chat."
            />
          </Section>

          <Section title="Contact">
            <div style={contactBox}>
              <div style={contactRow}>
                <span style={label}>Email:</span>
                <span style={val}>support@zentrastay.com</span>
              </div>
              <div style={contactRow}>
                <span style={label}>Phone:</span>
                <span style={val}>+94 XX XXX XXXX</span>
              </div>
              <div style={contactRow}>
                <span style={label}>Your account:</span>
                <span style={val}>{email}</span>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link to="/guest/issues" style={btnSoft}>
                  Report an Issue
                </Link>
                <Link to="/guest/my-bookings" style={btnSoft}>
                  My Bookings
                </Link>
                <Link to="/available-rooms" style={btnSoft}>
                  Book a Room
                </Link>
              </div>
            </div>
          </Section>

          <Section title="Policies">
            <QA
              q="Check-in / Check-out"
              a="Standard check-in is usually after 2:00 PM and check-out before 12:00 PM. Please confirm with the property."
            />
            <QA
              q="Cancellation policy"
              a="Cancellation depends on your booking type. Contact us via Live Chat for exact details."
            />
            <QA
              q="Damage / extra charges"
              a="Extra charges may apply for damages or missing items as per hotel policy."
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={section}>
      <div style={sectionTitle}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </div>
  );
}

function QA({ q, a }) {
  return (
    <div style={qa}>
      <div style={qStyle}>{q}</div>
      <div style={aStyle}>{a}</div>
    </div>
  );
}

const wrap = {
  minHeight: "calc(100vh - 56px)",
  padding: 16,
};

const card = {
  maxWidth: 1100,
  margin: "0 auto",
  background: "#0b1220",
  color: "#e5e7eb",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 16,
};

const head = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  paddingBottom: 12,
  borderBottom: "1px solid #1f2937",
};

const title = { fontSize: 20, fontWeight: 900 };
const sub = { fontSize: 13, opacity: 0.85, marginTop: 4 };

const grid = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  gap: 12,
};

const section = {
  gridColumn: "span 6",
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 14,
};

const sectionTitle = {
  fontWeight: 900,
  marginBottom: 10,
  fontSize: 14,
  opacity: 0.95,
};

const qa = {
  background: "#0b1220",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 12,
};

const qStyle = { fontWeight: 800, fontSize: 13 };
const aStyle = { marginTop: 6, fontSize: 13, opacity: 0.9, lineHeight: 1.5 };

const contactBox = {
  background: "#0b1220",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 12,
};

const contactRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "6px 0",
  borderBottom: "1px dashed rgba(148,163,184,0.25)",
};

const label = { fontSize: 13, opacity: 0.85 };
const val = { fontSize: 13, fontWeight: 700 };

const btnPrimary = {
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #22c55e",
  background: "#22c55e",
  color: "#0b1220",
  fontWeight: 900,
};

const btnSoft = {
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
  fontWeight: 800,
};
