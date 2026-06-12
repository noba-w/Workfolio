import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../lib/auth";

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

  async function login(email, password) {
    const data = await loginUser(email, password);
    persist(data);
  }

  async function register(name, email, password) {
    const data = await registerUser(name, email, password);
    persist(data);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
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
