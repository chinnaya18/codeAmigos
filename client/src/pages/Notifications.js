import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import logodraft from "./logodraft.png";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div style={styles.page}>
      {/* ---------- HEADER ---------- */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={logodraft} alt="logo" style={styles.logo} />
          <span style={styles.headerTitle}>Notifications</span>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.navBtn} onClick={() => navigate("/home")}>
            Home
          </button>
          <button style={styles.navBtn} onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>
      </header>

      {/* ---------- CONTENT ---------- */}
      <main style={styles.main}>
        <h2 style={styles.heading}>Your Notifications</h2>

        {loading ? (
          <p style={styles.infoText}>Loading...</p>
        ) : notifications.length === 0 ? (
          <p style={styles.infoText}>You have no notifications at this time.</p>
        ) : (
          notifications.map((note) => (
            <div key={note._id} style={styles.card}>
              <strong style={styles.cardTitle}>
                {note.type === "collab_request"
                  ? "Collaboration Request"
                  : "System Update"}
              </strong>

              <p style={styles.message}>{note.message}</p>

              <small style={styles.time}>
                {new Date(note.date || note.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeAmigos — Notifications Center
      </footer>
    </div>
  );
}

/* ---------------- CLEAN STYLE SYSTEM ---------------- */

const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
  },

  header: {
    height: 60,
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },

  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerRight: { display: "flex", gap: 12 },

  logo: { width: 34, height: 34, borderRadius: "50%" },

  headerTitle: { fontWeight: 600, fontSize: "18px" },

  navBtn: {
    border: "1px solid #30363d",
    padding: "6px 14px",
    borderRadius: 6,
    color: "#c9d1d9",
    background: "#21262d",
    cursor: "pointer",
    fontSize: "14px",
  },

  main: {
    maxWidth: "720px",
    width: "100%",
    margin: "80px auto 20px",
    padding: "0 16px",
  },

  heading: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },

  infoText: {
    color: "#8b949e",
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 10,
    padding: "18px",
    marginBottom: "14px",
  },

  cardTitle: {
    fontSize: "16px",
    marginBottom: 6,
    color: "#58a6ff",
    display: "block",
  },

  message: { margin: "6px 0", lineHeight: 1.5 },

  time: { display: "block", color: "#8b949e", fontSize: "12px" },

  footer: {
    marginTop: "auto",
    textAlign: "center",
    padding: "20px",
    borderTop: "1px solid #30363d",
    color: "#8b949e",
    fontSize: "14px",
  },
};
