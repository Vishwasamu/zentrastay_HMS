import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("zs_user");
      return u ? JSON.parse(u) : null;
    } catch (err) {
      console.warn("Failed to parse stored user:", err);
      localStorage.removeItem("zs_user");
      localStorage.removeItem("zs_token");
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(true);
  const token = useMemo(() => localStorage.getItem("zs_token") || "", [user]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem("zs_token");
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const storedUserRaw = localStorage.getItem("zs_user");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        // Don't make additional API calls during validation
        // The token is already stored, trust it for now
        // Actual endpoints will fail with 401 if token is invalid
        setAuthLoading(false);
      } catch (err) {
        console.warn("Token validation failed:", err.message);
        // Token invalid, clear auth
        localStorage.removeItem("zs_token");
        localStorage.removeItem("zs_user");
        setUser(null);
        setAuthLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = ({ token, user }) => {
    try {
      if (!token) {
        throw new Error("Token is required for login");
      }
      if (!user) {
        throw new Error("User is required for login");
      }

      const tokenStr = String(token).trim();
      if (!tokenStr) {
        throw new Error("Token cannot be empty");
      }

      localStorage.setItem("zs_token", tokenStr);
      localStorage.setItem("zs_user", JSON.stringify(user));
      setUser(user);
      console.log("Login successful. Token stored:", tokenStr.substring(0, 30) + "...");
    } catch (err) {
      console.error("Failed to save login data:", err);
      localStorage.removeItem("zs_token");
      localStorage.removeItem("zs_user");
      setUser(null);
      throw err;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("zs_token");
      localStorage.removeItem("zs_user");
      setUser(null);
      console.log("Logout successful. Token cleared.");
    } catch (err) {
      console.error("Failed to clear auth data:", err);
    }
  };

  const value = useMemo(
    () => ({ user, token, login, logout, authLoading }),
    [user, token, authLoading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
