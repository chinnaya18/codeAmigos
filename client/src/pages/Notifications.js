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
          <img
            src={logodraft}
            alt="logo"
            width="35"
            height="35"
            style={{ borderRadius: "50%" }}
          />
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
          <p style={styles.loading}>Loading…</p>
        ) : notifications.length === 0 ? (
          <p style={styles.empty}>No notifications yet.</p>
        ) : (
          notifications.map((note) => (
            <div key={note._id} style={styles.card}>
              <strong style={styles.title}>{note.title}</strong>
              <p style={styles.message}>{note.message}</p>

              <small style={styles.time}>
                {new Date(note.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} MergeWorks — All Rights Reserved
      </footer>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
  },

  /* HEADER */
  header: {
    height: "60px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },

  headerTitle: {
    fontSize: "18px",
    fontWeight: "600",
  },

  headerRight: { display: "flex", gap: "12px" },

  navBtn: {
    background: "transparent",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.2s",
  },

  /* MAIN */
  main: {
    maxWidth: "700px",
    width: "100%",
    margin: "40px auto",
    padding: "0 20px",
  },

  heading: { fontSize: "24px", marginBottom: "20px" },

  loading: { fontSize: "16px", color: "#8b949e" },
  empty: { fontSize: "16px", color: "#8b949e" },

  /* CARD */
  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    padding: "18px",
    borderRadius: "8px",
    marginBottom: "16px",
    transition: "0.2s",
  },

  title: { fontSize: "16px" },

  message: {
    marginTop: "8px",
    color: "#c9d1d9",
    lineHeight: "1.4",
  },

  time: { marginTop: "8px", display: "block", color: "#8b949e" },

  /* FOOTER */
  footer: {
    marginTop: "auto",
    textAlign: "center",
    padding: "16px 0",
    background: "#0d1117",
    borderTop: "1px solid #30363d",
    color: "#8b949e",
    fontSize: "14px",
  },
};
