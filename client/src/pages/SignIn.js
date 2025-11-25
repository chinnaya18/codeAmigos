import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function SignIn() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await API.post("/auth/signin", form);

      login(res.data.token, res.data.user);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (e) {
      setErr(e.response?.data?.msg || "Invalid Login");
    }
  };

  return (
    <div style={styles.page}>
      {/* Glowing background blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }}></div>
      <div style={{ ...styles.blob, ...styles.blob2 }}></div>
      <div style={{ ...styles.blob, ...styles.blob3 }}></div>

      {/* Header */}
      <header style={styles.header}>
        <p style={{ margin: 0, color: "#a0a0a0" }}>Don't have an account?</p>
        <button style={styles.signUpTopBtn} onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </header>

      {/* Main Sign-In Box */}
      <div style={styles.card}>
        <h2 style={styles.heading}>Sign In</h2>

        {err && <p style={styles.error}>{err}</p>}

        <form onSubmit={submit}>
          <label style={styles.label}>Email or Username</label>
          <input
            style={styles.input}
            value={form.emailOrUsername}
            onChange={(e) =>
              setForm({ ...form, emailOrUsername: e.target.value })
            }
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" style={styles.signInBtn}>
            Sign In
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2025 MergeWorks. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------
   INLINE CSS STYLES
--------------------------------------------------------- */
const styles = {
  page: {
    background: "#0a0f17",
    color: "#fff",
    minHeight: "100vh",
    fontFamily: "Poppins, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "end",
    gap: "12px",
    padding: "20px 30px",
    position: "relative",
    zIndex: 10,
  },

  signUpTopBtn: {
    background: "transparent",
    color: "#58a6ff",
    border: "1px solid #58a6ff",
    padding: "8px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },

  card: {
    width: "380px",
    margin: "80px auto",
    padding: "40px",
    background: "rgba(20, 26, 35, 0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(88, 166, 255, 0.25)",
    boxShadow: "0 0 25px rgba(88, 166, 255, 0.3)",
    backdropFilter: "blur(10px)",
    position: "relative",
    zIndex: 10,
  },

  heading: {
    textAlign: "center",
    fontSize: "1.9rem",
    fontWeight: "700",
    background: "linear-gradient(90deg, #58a6ff, #9d79ff)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  label: {
    marginTop: "12px",
    fontWeight: "600",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(88, 166, 255, 0.35)",
    color: "#fff",
    borderRadius: "8px",
    outline: "none",
    fontSize: "15px",
  },

  signInBtn: {
    width: "100%",
    marginTop: "22px",
    padding: "12px",
    background: "linear-gradient(90deg, #3a62ff, #9d3aff)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
  },

  error: {
    background: "#ff4d4f33",
    color: "#ff7b72",
    padding: "8px",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "0.85rem",
  },

  footer: {
    textAlign: "center",
    marginTop: "40px",
    color: "#777",
  },

  blob: {
    position: "fixed",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    filter: "blur(120px)",
    zIndex: 0,
    opacity: 0.55,
    animation: "float 10s infinite ease-in-out",
  },

  blob1: { background: "#3a62ff", top: "5%", left: "10%" },
  blob2: {
    background: "#9d3aff",
    bottom: "15%",
    right: "10%",
    animationDelay: "3s",
  },
  blob3: {
    background: "#00d2ff",
    top: "55%",
    left: "60%",
    animationDelay: "5s",
  },
};
  