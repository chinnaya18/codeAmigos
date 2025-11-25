import React, { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logodraft from "./logodraft.png"; // your logo

export default function NewRepo() {
  const [form, setForm] = useState({
    name: "",
    visibility: "public",
    description: "",
  });

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const createRepo = async (e) => {
    e.preventDefault();
    try {
      await API.post(
        "/repos/create",
        {
          name: form.name,
          visibility: form.visibility,
          description: form.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMsg("Repository created successfully!");
      setTimeout(() => navigate("/home"), 900);
    } catch (error) {
      setErr(error.response?.data?.msg || "Error creating repository");
    }
  };

  return (
    <div style={styles.page}>
      {/* ---------------- HEADER ---------------- */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img
            src={logodraft}
            alt="logo"
            style={{ width: 34, height: 34, borderRadius: "50%" }}
          />
          <Link to="/home" style={styles.headerLink}>
            Home
          </Link>
          <Link
            to="/newrepo"
            style={{ ...styles.headerLink, color: "#58a6ff" }}
          >
            New Repo
          </Link>
        </div>

        <div style={styles.headerRight}>
          <Link to="/notifications" style={styles.headerLink}>
            Notifications
          </Link>
          <Link to="/profile">
            <img
              src={logodraft}
              alt="profile"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid #30363d",
              }}
            />
          </Link>
        </div>
      </header>

      {/* ---------------- CREATE REPO CARD ---------------- */}
      <div style={styles.card}>
        <h2 style={styles.title}>Create a New Repository</h2>
        <p style={styles.subtitle}>
          A repository contains all project files including revision history.
        </p>

        {err && <div style={styles.error}>{err}</div>}
        {msg && <div style={styles.success}>{msg}</div>}

        <form onSubmit={createRepo}>
          <label style={styles.label}>Repository Name</label>
          <input
            style={styles.input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Enter repository name"
          />

          <label style={styles.label}>Visibility</label>
          <select
            style={styles.input}
            value={form.visibility}
            onChange={(e) => setForm({ ...form, visibility: e.target.value })}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <label style={styles.label}>Description (Optional)</label>
          <textarea
            style={{ ...styles.input, height: "100px" }}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Write a short description…"
          ></textarea>

          <button style={styles.button}>Create Repository</button>
        </form>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeAmigos · Built with ❤️ for developers
      </footer>
    </div>
  );
}

/* ---------- Modern GitHub Dark Styles ---------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
    color: "#c9d1d9",
  },

  /* ---- HEADER ---- */
  header: {
    width: "100%",
    height: "60px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    position: "fixed",
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  headerLink: {
    color: "#c9d1d9",
    textDecoration: "none",
    fontSize: "15px",
  },

  /* ---- CARD ---- */
  card: {
    width: "480px",
    background: "#161b22",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #30363d",
    marginTop: "120px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: "26px",
    fontWeight: 600,
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#8b949e",
    marginBottom: "20px",
  },
  label: {
    fontWeight: 600,
    fontSize: "14px",
    marginTop: "15px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px",
    background: "#0d1117",
    color: "#c9d1d9",
    border: "1px solid #30363d",
    borderRadius: "6px",
    marginTop: "5px",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#238636",
    border: "1px solid #2ea043",
    borderRadius: "8px",
    marginTop: "25px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  success: {
    background: "#062b0f",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #238636",
    color: "#6ee07a",
    marginBottom: 15,
  },
  error: {
    background: "#3b0a0a",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ff6b6b",
    color: "#ffb3b3",
    marginBottom: 15,
  },

  /* ---- FOOTER ---- */
  footer: {
    marginTop: "40px",
    padding: "20px",
    color: "#8b949e",
    fontSize: "14px",
  },
};
