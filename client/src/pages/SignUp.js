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
      setErr(
        "All fields are required. Password must be at least 6 characters."
      );
      return;
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
      {/* Background glow blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }}></div>
      <div style={{ ...styles.blob, ...styles.blob2 }}></div>
      <div style={{ ...styles.blob, ...styles.blob3 }}></div>

      {/* Header */}
      <header style={styles.header}>
        <p style={{ margin: 0, color: "#a0a0a0" }}>Already have an account?</p>
        <button style={styles.signInTopBtn} onClick={() => navigate("/signin")}>
          Sign In
        </button>
      </header>

      {/* Main Card */}
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>

        {err && <p style={styles.error}>{err}</p>}

        <form onSubmit={submit}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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

          <button type="submit" style={styles.signUpBtn}>
            Create Account
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
   INLINE CSS STYLES — same UI theme as SignIn.js
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
  },

  signInTopBtn: {
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
    margin: "70px auto",
    padding: "40px",
    background: "rgba(20, 26, 35, 0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(88,166,255,0.25)",
    boxShadow: "0 0 25px rgba(88,166,255,0.3)",
    backdropFilter: "blur(10px)",
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

  signUpBtn: {
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

  /* Glowing blobs */
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
