import React, { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logodraft from "./logodraft.png";

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
    setErr("");
    setMsg("");

    try {
      await API.post("/repos/create", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg("Repository created successfully.");
      setTimeout(() => navigate("/home"), 900);
    } catch (error) {
      setErr(error.response?.data?.msg || "Error creating repository.");
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={logodraft} alt="logo" style={styles.logo} />
          <Link to="/home" style={styles.headerLink}>
            Home
          </Link>
          <Link
            to="/newrepo"
            style={{ ...styles.headerLink, color: "#58a6ff" }}
          >
            New Repository
          </Link>
        </div>

        <div style={styles.headerRight}>
          <Link to="/notifications" style={styles.headerLink}>
            🔔
          </Link>
          <Link to="/profile">
            <img src={logodraft} alt="profile" style={styles.profileImg} />
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create a New Repository</h2>
          <p style={styles.subtitle}>
            Repositories store code and track project history.
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
              style={{ ...styles.input, height: "90px" }}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the project..."
            />

            <button style={styles.button}>Create Repository</button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeAmigos — Built for developers
      </footer>
    </div>
  );
}

/* ---------- CLEAN PROFESSIONAL THEMING ---------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
  },

  header: {
    height: 60,
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 18px",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 50,
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },

  headerLink: {
    color: "#c9d1d9",
    textDecoration: "none",
    fontSize: "14px",
    transition: "0.2s",
  },

  logo: {
    width: 32,
    height: 32,
    borderRadius: "50%",
  },

  profileImg: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid #30363d",
    cursor: "pointer",
  },

  container: {
    display: "flex",
    justifyContent: "center",
    padding: "100px 16px 30px",
  },

  card: {
    width: "100%",
    maxWidth: 480,
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "10px",
    padding: "25px",
  },

  title: {
    fontSize: "22px",
    marginBottom: 6,
    fontWeight: 600,
  },

  subtitle: {
    fontSize: "14px",
    color: "#8b949e",
    marginBottom: 18,
  },

  label: {
    display: "block",
    marginTop: 12,
    fontSize: "14px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    marginTop: 6,
    padding: "10px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#238636",
    border: "1px solid #2ea043",
    borderRadius: 6,
    color: "white",
    fontWeight: 600,
    marginTop: 24,
    cursor: "pointer",
    transition: "0.2s",
  },

  error: {
    background: "#4a1e1e",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #da3633",
    color: "#ffb3b3",
    marginBottom: 16,
    textAlign: "center",
  },

  success: {
    background: "#10341f",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #2ea043",
    color: "#8bf59b",
    marginBottom: 16,
    textAlign: "center",
  },

  footer: {
    textAlign: "center",
    padding: "20px",
    color: "#8b949e",
    fontSize: "14px",
    marginTop: 20,
  },
};
