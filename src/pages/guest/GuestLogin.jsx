import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { pendingBookingStorage } from "../../lib/pendingBooking";
import "./GuestLogin.css";

export default function GuestLogin() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get email from pending booking or location state
  const pendingBooking = pendingBookingStorage.get();

  const [form, setForm] = useState({ 
    email: location.state?.email || pendingBooking?.email || "", 
    password: "" 
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    
    try {
      console.log("Submitting login form:", form);
      const data = await api.post("/api/auth/login.php", form);
      
      console.log("Login response:", data);
      console.log("Response success:", data?.success);
      console.log("Response token:", data?.token ? "YES" : "NO");
      console.log("Response user:", data?.user ? "YES" : "NO");

      if (!data?.token || !data?.user) {
        console.error("Invalid response structure - missing token or user:", data);
        throw new Error("Server returned invalid response");
      }

      console.log("Calling login with token and user");
      try {
        login({ token: data.token, user: data.user });
      } catch (loginErr) {
        console.error("Login context error:", loginErr);
        throw loginErr;
      }

      // Store token
      localStorage.setItem("zs_token", data.token);
      localStorage.setItem("auth_token", data.token);

      // If coming from booking, clear pending booking and go to dashboard
      pendingBookingStorage.clear();
      nav("/guest/dashboard", { replace: true });
    } catch (e) {
      console.error("Login error:", e);
      setErr(e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    nav("/forgot-password");
  };

  const handleCreateAccount = () => {
    nav("/guest/register", {
      state: location.state ? { ...location.state } : undefined
    });
  };

  return (
    <div className="login-container">
      {/* Left Side - Welcome Content */}
      <div className="left-panel">
        <div className="brand">
          <div className="logo">ZentraStay</div>
          <div className="tagline">Luxury Hotels</div>
        </div>
        <div className="welcome-content">
          <h2 className="welcome-subtitle">Welcome Back</h2>
          <h1 className="welcome-title">Sign In to Your Account</h1>
          <p className="welcome-description">
            Manage your bookings, access hotel services, and personalize your stay experience with ZentraStay Luxury Hotels.
          </p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Manage bookings & reservations</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Access exclusive hotel services</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Personalize your stay preferences</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>24/7 concierge support</span>
            </div>
          </div>
        </div>
        <div className="footer-left">
          <p className="copyright-left">© 2024 ZentraStay Luxury Hotels. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="right-panel">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to manage your bookings, access hotel services, and personalize your stay experience.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="b@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label className="label">Password</label>
                <button 
                  type="button" 
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgotten password?
                </button>
              </div>
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {err && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {err}
              </div>
            )}

            <button 
              type="submit" 
              className="sign-in-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">New to ZentraStay?</span>
          </div>

          <button 
            className="create-account-button"
            onClick={handleCreateAccount}
          >
            Create Guest Account
          </button>

          <div className="terms">
            <p className="terms-text">
              By signing in, you agree to our{" "}
              <a href="/terms" className="terms-link">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="terms-link">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
