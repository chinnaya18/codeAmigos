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
      navigate(res.data.user.role === "admin" ? "/admin" : "/home");
    } catch (e) {
      setErr(e.response?.data?.msg || "Invalid Login");
    }
  };

  return (
    <div style={styles.page}>
      {/* Floating Background Glow Elements */}
      <div style={{ ...styles.blob, ...styles.blob1 }}></div>
      <div style={{ ...styles.blob, ...styles.blob2 }}></div>
      <div style={{ ...styles.blob, ...styles.blob3 }}></div>

      {/* Header */}
      <header style={styles.header}>
        <p style={{ margin: 0, opacity: 0.7 }}>Don't have an account?</p>
        <button style={styles.signUpTopBtn} onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </header>

      {/* Login Card */}
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
            placeholder="Enter email or username"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            placeholder="Enter password"
          />

          <button type="submit" style={styles.signInBtn}>
            Sign In
          </button>
        </form>

        <p
          style={styles.forgotLink}
          onClick={() => alert("Forgot password feature pending…")}
        >
          Forgot Password?
        </p>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeAmigos. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------- Responsive Inline Styling ---------- */
const styles = {
  page: {
    background: "#090d16",
    color: "#fff",
    minHeight: "100vh",
    fontFamily: "Poppins, sans-serif",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    zIndex: 10,
    maxWidth: "1080px",
  },

  signUpTopBtn: {
    background: "transparent",
    color: "#58a6ff",
    border: "1px solid #58a6ff",
    padding: "8px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },

  card: {
    width: "90%",
    maxWidth: "380px",
    marginTop: "60px",
    padding: "35px",
    background: "rgba(20, 26, 35, 0.7)",
    borderRadius: "16px",
    border: "1px solid rgba(88, 166, 255, 0.25)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 0 20px rgba(88, 166, 255, 0.25)",
  },

  heading: {
    textAlign: "center",
    fontSize: "1.9rem",
    fontWeight: 700,
    marginBottom: "20px",
    background: "linear-gradient(90deg, #58a6ff, #9d79ff)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  label: {
    marginTop: "10px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(88, 166, 255, 0.35)",
    borderRadius: "8px",
    color: "#fff",
    outline: "none",
    fontSize: "15px",
  },

  signInBtn: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    background: "linear-gradient(90deg, #3a62ff, #903aff)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.2s",
  },

  forgotLink: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#7db0ff",
    cursor: "pointer",
    textDecoration: "underline",
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
    marginTop: "auto",
    padding: "15px 0",
    color: "#777",
    fontSize: "0.85rem",
    textAlign: "center",
  },

  /* Background Glow Shapes */
  blob: {
    position: "fixed",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.55,
    zIndex: 0,
    animation: "float 12s infinite ease-in-out",
  },

  blob1: { background: "#396cff", top: "-5%", left: "-5%" },
  blob2: { background: "#7d3aff", bottom: "10%", right: "-10%" },
  blob3: { background: "#00d2ff", top: "50%", left: "60%" },
};
