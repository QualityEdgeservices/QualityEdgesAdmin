// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api.js";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (err) {
        console.error("Failed to parse savedUser:", err);
        localStorage.removeItem("user");
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // const fetchUser = async () => {
  //   try {
  //     const response = await api.get("/auth/me");
  //     const userData = response.data;
  //     setUser(userData);
  //     localStorage.setItem("user", JSON.stringify(userData));
  //   } catch (error) {
  //     console.error("Failed to fetch user:", error);
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("user");
  //     delete api.defaults.headers.common["Authorization"];
  //     setUser(null);
  //     setToken(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUser = async () => {
  try {
    const response = await api.get("/auth/me");
    const userData = response.data;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  } catch (error) {
    console.error("Failed to fetch user:", error);

    // instead of clearing everything immediately:
    // only clear if it's definitely unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);
    }
  } finally {
    setLoading(false);
  }
};


  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      console.log("Full login response:", response.data);

      const newToken = response.data.token || response.data.accessToken;
      const userData = response.data.user || response.data.data;

      if (!newToken) {
        throw new Error("Token missing in response");
      }

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setToken(newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      console.log("Token stored successfully:", newToken);

      return { success: true };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);

      console.error("Login failed:", error.response?.data || error.message);

      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,     // ✅ now available to the whole app
    login,
    logout,
    loading,
    refreshUser: fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
