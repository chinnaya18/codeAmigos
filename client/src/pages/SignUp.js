import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function SignUp() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.username || !form.email || form.password.length < 6) {
      return setErr("Fill all fields. Password must be at least 6 characters.");
    }

    try {
      const res = await API.post("/auth/signup", form);
      login(res.data.token, res.data.user);
      navigate("/signin");
    } catch (error) {
      setErr(error.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* Neon Glow Blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />

      {/* Header */}
      <header style={styles.header}>
        <p style={{ margin: 0, opacity: 0.7 }}>Already have an account?</p>
        <button style={styles.switchBtn} onClick={() => navigate("/signin")}>
          Sign In
        </button>
      </header>

      {/* Main Form Card */}
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>

        {err && <p style={styles.error}>{err}</p>}

        <form onSubmit={submit}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            placeholder="Choose a username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            style={styles.input}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" style={styles.signUpBtn}>
            Create Account
          </button>
        </form>

        {/* Optional Text */}
        <p style={styles.linkText} onClick={() => navigate("/signin")}>
          Already registered? Sign In
        </p>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeAmigos. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------- Shared Responsive UI Styling ---------- */
const styles = {
  page: {
    background: "#090f18",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    padding: "20px",
  },

  header: {
    width: "100%",
    maxWidth: "1080px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    zIndex: 10,
  },

  switchBtn: {
    background: "transparent",
    color: "#58a6ff",
    border: "1px solid #58a6ff",
    padding: "8px 18px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
  },

  card: {
    width: "90%",
    maxWidth: "380px",
    marginTop: "50px",
    padding: "35px",
    background: "rgba(20, 26, 35, 0.65)",
    borderRadius: "16px",
    border: "1px solid rgba(88,166,255,0.25)",
    backdropFilter: "blur(11px)",
    boxShadow: "0 0 22px rgba(88,166,255,0.25)",
    zIndex: 10,
  },

  heading: {
    textAlign: "center",
    fontSize: "1.9rem",
    fontWeight: 700,
    marginBottom: "18px",
    background: "linear-gradient(90deg, #58a6ff, #9d79ff)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  label: {
    marginTop: "10px",
    fontWeight: 600,
    fontSize: "0.9rem",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(88,166,255,0.35)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
  },

  signUpBtn: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "1rem",
    color: "#fff",
    background: "linear-gradient(90deg, #3a62ff, #903aff)",
    cursor: "pointer",
    transition: "0.25s",
  },

  error: {
    background: "#ff4d4f22",
    border: "1px solid #ff6b6b",
    padding: "8px",
    borderRadius: "6px",
    textAlign: "center",
    color: "#ff7b72",
    marginBottom: "10px",
    fontSize: "0.85rem",
  },

  linkText: {
    marginTop: "12px",
    textAlign: "center",
    color: "#7db0ff",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "0.85rem",
  },

  footer: {
    marginTop: "auto",
    padding: "15px 0",
    color: "#888",
    fontSize: "0.9rem",
    textAlign: "center",
  },

  /* Background Glow Blobs */
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
  blob2: { background: "#9d3aff", bottom: "12%", right: "-10%" },
  blob3: { background: "#00d2ff", top: "50%", left: "60%" },
};
