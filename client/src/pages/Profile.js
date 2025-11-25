// client/src/pages/Profile.js
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import * as powerbi from "powerbi-client";
import logodraft from "./logodraft.png";

export default function Profile() {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [stats, setStats] = useState({
    repos: 0,
    commits: 0,
    collaborators: 0,
  });

  const [loading, setLoading] = useState(true);
  const [embedConfig, setEmbedConfig] = useState(null);
  const reportRef = useRef(null);

  /* ---------------- Load Stats + PowerBI Embed Token ---------------- */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await API.get("/profile/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    const loadEmbed = async () => {
      try {
        const res = await API.get("/powerbi/embed");
        setEmbedConfig(res.data);
      } catch (err) {
        console.error("Power BI config error", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    loadEmbed();
  }, []);

  /* ---------------- Embed Power BI Report ---------------- */
  useEffect(() => {
    if (!embedConfig || !reportRef.current) return;

    const models = powerbi.models;
    const config = {
      type: "report",
      id: embedConfig.reportId,
      embedUrl: embedConfig.embedUrl,
      accessToken: embedConfig.embedToken,
      tokenType: models.TokenType.Embed,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
      },
    };

    const service = new powerbi.service.Service(
      powerbi.factories.hpmFactory,
      powerbi.factories.wpmpFactory,
      powerbi.factories.routerFactory
    );

    service.reset(reportRef.current);
    const report = service.embed(reportRef.current, config);

    report.on("loaded", () => console.log("Power BI Loaded"));
    report.on("error", (e) => console.error("Power BI Error", e.detail));

    return () => service.reset(reportRef.current);
  }, [embedConfig]);

  /* ---------------- Upload Profile Picture ---------------- */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await API.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser((prev) => ({ ...prev, avatar: res.data.url }));
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }

    setUploading(false);
  };

  if (!user) return <div style={styles.page}>Please sign in.</div>;

  return (
    <div style={styles.page}>
      {/* ---------------- NAVBAR ---------------- */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <img
            src={logodraft}
            alt="logo"
            style={{ width: 34, height: 34, borderRadius: "50%" }}
          />
          <span style={styles.navTitle}>CodeAmigos</span>
        </div>

        <div style={styles.navRight}>
          <button style={styles.navButton} onClick={() => navigate("/home")}>
            Home
          </button>
          <button
            style={styles.navButton}
            onClick={() => {
              logout();
              navigate("/signin");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ---------------- PROFILE HEADER ---------------- */}
      <div style={styles.container}>
        <div style={styles.profileSection}>
          {/* Avatar */}
          <label style={{ cursor: "pointer" }}>
            <img
              src={avatarPreview || user.avatar || logodraft}
              alt="avatar"
              style={styles.avatar}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
            />
          </label>

          <div>
            <h2 style={styles.username}>
              {user.username}
              <small style={styles.userTag}>@{user.username}</small>
            </h2>

            <p style={styles.userEmail}>{user.email}</p>

            <span style={styles.roleBadge}>{user.role}</span>

            {uploading && (
              <p style={{ color: "#58a6ff", marginTop: 10 }}>
                Uploading avatar…
              </p>
            )}
          </div>
        </div>

        {/* ---------------- STATS ---------------- */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <h3 style={styles.statValue}>{stats.repos}</h3>
            <p style={styles.statLabel}>Repositories</p>
          </div>

          <div style={styles.statBox}>
            <h3 style={styles.statValue}>{stats.commits}</h3>
            <p style={styles.statLabel}>Commits</p>
          </div>

          <div style={styles.statBox}>
            <h3 style={styles.statValue}>{stats.collaborators}</h3>
            <p style={styles.statLabel}>Collaborations</p>
          </div>
        </div>

        {/* ---------------- POWER BI ---------------- */}
        <h3 style={styles.sectionTitle}>📊 Activity Dashboard</h3>

        <div style={styles.biContainer} ref={reportRef}>
          {!embedConfig && !loading && (
            <div style={{ padding: 20, color: "#999" }}>
              Power BI is not configured.
            </div>
          )}
        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer style={styles.footer}>
        © 2025 CodeAmigos • Profile Dashboard
      </footer>
    </div>
  );
}

/* ---------- STYLES (unchanged) ---------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
  },
  navbar: {
    height: "60px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navTitle: { fontSize: 18, fontWeight: 600 },
  navRight: { display: "flex", gap: "10px" },
  navButton: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  container: { width: "900px", margin: "30px auto" },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  avatar: {
    width: "95px",
    height: "95px",
    borderRadius: "50%",
    border: "2px solid #30363d",
    cursor: "pointer",
  },
  username: { margin: 0, fontSize: "28px", fontWeight: 700 },
  userTag: { marginLeft: 10, color: "#8b949e", fontSize: "16px" },
  userEmail: { margin: 0, color: "#8b949e" },
  roleBadge: {
    background: "#58a6ff",
    color: "#0d1117",
    padding: "5px 10px",
    borderRadius: "6px",
    fontWeight: 600,
    marginTop: "8px",
    display: "inline-block",
  },
  statsRow: { display: "flex", gap: "20px", marginBottom: "30px" },
  statBox: {
    flex: 1,
    background: "#161b22",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #30363d",
    textAlign: "center",
  },
  statValue: { fontSize: "26px", fontWeight: 700, color: "#58a6ff" },
  statLabel: { color: "#8b949e", marginTop: 5 },
  sectionTitle: { fontSize: "22px", marginBottom: "10px" },
  biContainer: {
    width: "100%",
    height: "600px",
    border: "1px solid #30363d",
    borderRadius: "10px",
    background: "#111",
    overflow: "hidden",
  },
  footer: {
    marginTop: "40px",
    padding: "20px",
    textAlign: "center",
    color: "#8b949e",
  },
};
