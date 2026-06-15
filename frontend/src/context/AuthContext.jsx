import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser } from "../lib/auth";
import { setRefreshCallback } from "../lib/api";

const AuthContext = createContext(null);

const SESSION_KEY = "workfolio_session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  function persist(data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
  }

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    if (!session?.refresh_token) {
      setRefreshCallback(null);
      return;
    }
    const refreshToken = session.refresh_token;
    setRefreshCallback(async () => {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        logout();
        throw new Error("Session expired");
      }
      const data = await res.json();
      persist(data);
      return data.access_token;
    });
  }, [session?.refresh_token, logout]);

  async function login(email, password) {
    const data = await loginUser(email, password);
    persist(data);
  }

  async function register(name, email, password) {
    const data = await registerUser(name, email, password);
    persist(data);
  }

  return (
    <AuthContext.Provider value={{ session, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
