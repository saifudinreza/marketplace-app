import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axiosClient.post("/login", { email, password });
    const data = response.data.data || response.data;
    const newToken = data.token;
    const newUser = data.user || { email };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  const register = async (name, email, password, password_confirmation) => {
    const response = await axiosClient.post("/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    return response.data;
  };

  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (err) {
      console.warn("Logout API error:", err.message);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
