import React, { createContext, useState, useEffect } from "react";
import API, { setToken as applyTokenToAxios } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("gh_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [token, setTokenState] = useState(() => {
    return localStorage.getItem("gh_token") || null;
  });

  // Apply token to axios headers when loaded
  useEffect(() => {
    if (token) applyTokenToAxios(token);
  }, [token]);

  // LOGIN FUNCTION
  const login = (token, userObj) => {
    const fullUser = {
      id: userObj.id,
      username: userObj.username,
      email: userObj.email,
      role: userObj.role || "user",
    };

    // store in localStorage
    localStorage.setItem("gh_token", token);
    localStorage.setItem("gh_user", JSON.stringify(fullUser));

    // update state
    setTokenState(token);
    setUser(fullUser);

    // attach token to axios
    applyTokenToAxios(token);
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("gh_token");
    localStorage.removeItem("gh_user");

    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
