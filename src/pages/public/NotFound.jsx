import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Optional: for animations

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={styles.container}>
      {/* Animated background gradient */}
      <div 
        style={{
          ...styles.gradientBg,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`
        }}
      />

      {/* Content */}
      <div style={styles.content}>
        {/* Error Code with animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={styles.errorCode}
        >
          <span style={styles.four}>4</span>
          <div style={styles.zeroContainer}>
            <div style={styles.zero}>
              <div style={styles.zeroInner}>0</div>
            </div>
          </div>
          <span style={styles.four}>4</span>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 style={styles.title}>Page Not Found</h1>
          <p style={styles.description}>
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
          <p style={styles.subDescription}>
            It might have been moved, deleted, or never existed in the first place.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={styles.searchContainer}
        >
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search for pages..."
              style={styles.searchInput}
            />
            <button style={styles.searchButton}>
              <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={styles.linksContainer}
        >
          <p style={styles.linksTitle}>Quick Links</p>
          <div style={styles.linksGrid}>
            <Link to="/" style={styles.linkCard}>
              <div style={styles.linkIcon}>🏠</div>
              <div>
                <div style={styles.linkTitle}>Home</div>
                <div style={styles.linkDesc}>Return to homepage</div>
              </div>
            </Link>
            
            <Link to="/dashboard" style={styles.linkCard}>
              <div style={styles.linkIcon}>📊</div>
              <div>
                <div style={styles.linkTitle}>Dashboard</div>
                <div style={styles.linkDesc}>Go to main dashboard</div>
              </div>
            </Link>
            
            <Link to="/admin/rooms" style={styles.linkCard}>
              <div style={styles.linkIcon}>🏨</div>
              <div>
                <div style={styles.linkTitle}>Rooms</div>
                <div style={styles.linkDesc}>Manage hotel rooms</div>
              </div>
            </Link>
            
            <Link to="/help" style={styles.linkCard}>
              <div style={styles.linkIcon}>❓</div>
              <div>
                <div style={styles.linkTitle}>Help Center</div>
                <div style={styles.linkDesc}>Get assistance</div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={styles.actions}
        >
          <Link to="/" style={styles.primaryButton}>
            <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            style={styles.secondaryButton}
          >
            <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
          <button 
            onClick={() => window.location.reload()} 
            style={styles.tertiaryButton}
          >
            <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload Page
          </button>
        </motion.div>

        {/* Error Details (Optional - can be hidden) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={styles.errorDetails}
        >
          <details style={styles.details}>
            <summary style={styles.detailsSummary}>Technical Details</summary>
            <div style={styles.detailsContent}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status Code:</span>
                <span style={styles.detailValue}>404 Not Found</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Request URL:</span>
                <span style={styles.detailValue}>{window.location.href}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Timestamp:</span>
                <span style={styles.detailValue}>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </details>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div style={styles.floatingElement} className="float-1">🚀</div>
      <div style={styles.floatingElement} className="float-2">🔍</div>
      <div style={styles.floatingElement} className="float-3">💫</div>
    </div>
  );
}

// CSS-in-JS Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    transition: "background 0.3s ease",
  },
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: "800px",
    width: "100%",
    textAlign: "center",
  },
  errorCode: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  four: {
    fontSize: "12rem",
    fontWeight: 900,
    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
  },
  zeroContainer: {
    position: "relative",
    width: "160px",
    height: "160px",
  },
  zero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: "20px solid #ef4444",
    borderRadius: "50%",
    boxShadow: "0 0 60px rgba(239, 68, 68, 0.4)",
    animation: "pulse 2s infinite",
  },
  zeroInner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "6rem",
    fontWeight: 900,
    color: "#ef4444",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "16px",
    color: "#f1f5f9",
  },
  description: {
    fontSize: "1.125rem",
    color: "#cbd5e1",
    marginBottom: "8px",
    lineHeight: 1.6,
  },
  subDescription: {
    fontSize: "1rem",
    color: "#94a3b8",
    marginBottom: "40px",
    lineHeight: 1.6,
  },
  searchContainer: {
    margin: "40px 0",
  },
  searchBox: {
    display: "flex",
    maxWidth: "500px",
    margin: "0 auto",
    background: "#1e293b",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #334155",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  searchInput: {
    flex: 1,
    padding: "16px 20px",
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
  },
  searchButton: {
    padding: "0 24px",
    background: "#4f46e5",
    border: "none",
    color: "white",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  searchIcon: {
    width: "20px",
    height: "20px",
  },
  linksContainer: {
    margin: "40px 0",
  },
  linksTitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  linkCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "12px",
    border: "1px solid #334155",
    textDecoration: "none",
    color: "#f8fafc",
    transition: "all 0.2s",
    textAlign: "left",
  },
  linkIcon: {
    fontSize: "24px",
  },
  linkTitle: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  linkDesc: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginTop: "4px",
  },
  actions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginTop: "40px",
    flexWrap: "wrap",
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 20px rgba(79, 70, 229, 0.4)",
  },
  secondaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #475569",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tertiaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #475569",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonIcon: {
    width: "20px",
    height: "20px",
  },
  errorDetails: {
    marginTop: "40px",
  },
  details: {
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "12px",
    border: "1px solid #334155",
    overflow: "hidden",
  },
  detailsSummary: {
    padding: "16px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#cbd5e1",
    listStyle: "none",
    outline: "none",
  },
  detailsContent: {
    padding: "0 16px 16px",
    borderTop: "1px solid #334155",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  detailValue: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontFamily: "monospace",
  },
  floatingElement: {
    position: "absolute",
    fontSize: "24px",
    animation: "float 6s ease-in-out infinite",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 60px rgba(239, 68, 68, 0.4);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 80px rgba(239, 68, 68, 0.6);
      transform: scale(1.05);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }
  
  .float-1 {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }
  
  .float-2 {
    top: 60%;
    right: 10%;
    animation-delay: 2s;
  }
  
  .float-3 {
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
  
  details summary::-webkit-details-marker {
    display: none;
  }
  
  details summary::before {
    content: '▶';
    display: inline-block;
    margin-right: 8px;
    transition: transform 0.2s;
  }
  
  details[open] summary::before {
    transform: rotate(90deg);
  }
  
  *:hover {
    transition: all 0.2s ease;
  }
  
  button:hover, a:hover {
    transform: translateY(-2px);
  }
  
  .primaryButton:hover {
    box-shadow: 0 6px 30px rgba(79, 70, 229, 0.6);
    transform: translateY(-2px);
  }
  
  .secondaryButton:hover {
    background: #2d3748;
    border-color: #6366f1;
  }
  
  .tertiaryButton:hover {
    background: rgba(30, 41, 59, 0.8);
    color: #f8fafc;
  }
  
  .linkCard:hover {
    background: rgba(79, 70, 229, 0.1);
    border-color: #6366f1;
    transform: translateY(-2px);
  }
`;
document.head.appendChild(styleSheet);

// Alternative simpler version without framer-motion dependency:
export function SimpleNotFound() {
  return (
    <div style={simpleStyles.container}>
      <div style={simpleStyles.content}>
        <div style={simpleStyles.errorCode}>
          404
        </div>
        <h1 style={simpleStyles.title}>Page Not Found</h1>
        <p style={simpleStyles.description}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={simpleStyles.actions}>
          <Link to="/" style={simpleStyles.button}>Go Home</Link>
          <button 
            onClick={() => window.history.back()} 
            style={{...simpleStyles.button, ...simpleStyles.outlineButton}}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

const simpleStyles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "20px",
  },
  content: {
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
  },
  errorCode: {
    fontSize: "6rem",
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: "20px",
    fontFamily: "monospace",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "16px",
  },
  description: {
    fontSize: "1.125rem",
    color: "#64748b",
    marginBottom: "32px",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  button: {
    padding: "12px 24px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.2s",
  },
  outlineButton: {
    background: "transparent",
    color: "#4f46e5",
    border: "2px solid #4f46e5",
  },
};