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

  /* -------- GET USER STATS + REPORT TOKEN -------- */
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

  /* -------- POWER BI EMBED -------- */
  useEffect(() => {
    if (!embedConfig || !reportRef.current) return;

    const service = new powerbi.service.Service(
      powerbi.factories.hpmFactory,
      powerbi.factories.wpmpFactory,
      powerbi.factories.routerFactory
    );

    const report = service.embed(reportRef.current, {
      type: "report",
      id: embedConfig.reportId,
      embedUrl: embedConfig.embedUrl,
      accessToken: embedConfig.embedToken,
      tokenType: powerbi.models.TokenType.Embed,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
      },
    });

    return () => service.reset(reportRef.current);
  }, [embedConfig]);

  /* -------- PROFILE PIC UPLOAD -------- */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await API.post("/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser((prev) => ({ ...prev, avatar: res.data.url }));
    } catch (err) {
      console.error("Avatar upload error:", err);
    }

    setUploading(false);
  };

  if (!user) return <div style={styles.page}>Please sign in.</div>;

  return (
    <div style={styles.page}>
      {/* -------- NAVBAR -------- */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <img src={logodraft} alt="logo" style={styles.logo} />
          <span style={styles.navTitle}>Profile</span>
        </div>

        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate("/home")}>
            Home
          </button>
          <button
            style={styles.navBtn}
            onClick={() => {
              logout();
              navigate("/signin");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* -------- CONTENT -------- */}
      <div style={styles.container}>
        {/* PROFILE HEADER */}
        <div style={styles.profileHeader}>
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

          <div style={{ textAlign: "center" }}>
            <h2 style={styles.username}>
              {user.username}
              <small style={styles.tag}>@{user.username}</small>
            </h2>

            <p style={styles.email}>{user.email}</p>

            <span style={styles.role}>{user.role}</span>

            {uploading && (
              <p style={{ color: "#58a6ff", marginTop: 8 }}>
                Uploading avatar…
              </p>
            )}
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
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

        {/* POWER BI */}
        <h3 style={styles.sectionTitle}>📊 Activity Report</h3>
        <div style={styles.powerBi} ref={reportRef}>
          {!embedConfig && !loading && (
            <p style={{ color: "#777" }}>Power BI not configured.</p>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>© 2025 CodeAmigos • Profile</footer>
    </div>
  );
}

/* -------- RESPONSIVE DESIGN -------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
  },
  nav: {
    height: 60,
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "0 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
  },
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36, borderRadius: "50%" },
  navTitle: { fontSize: 18, fontWeight: 600 },
  navRight: { display: "flex", gap: 10 },
  navBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "6px 12px",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },

  container: {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "0 15px",
  },

  /* Profile Block */
  profileHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
    textAlign: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    border: "2px solid #30363d",
  },
  username: { fontSize: 26, margin: 0 },
  tag: { marginLeft: 8, color: "#8b949e", fontSize: 14 },
  email: { color: "#8b949e", marginTop: 3 },
  role: {
    background: "#58a6ff",
    color: "#0d1117",
    padding: "5px 12px",
    borderRadius: 6,
    marginTop: 8,
    fontWeight: 600,
  },

  /* Stats */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
    gap: 12,
    marginBottom: 30,
  },
  statBox: {
    background: "#161b22",
    border: "1px solid #30363d",
    padding: 20,
    borderRadius: 10,
    textAlign: "center",
  },
  statValue: { fontSize: 28, fontWeight: 700, color: "#58a6ff" },
  statLabel: { color: "#8b949e" },

  /* PowerBI */
  sectionTitle: { fontSize: 22, marginBottom: 10, textAlign: "center" },
  powerBi: {
    width: "100%",
    height: 450,
    background: "#111",
    border: "1px solid #30363d",
    borderRadius: 10,
    overflow: "hidden",
  },

  footer: {
    textAlign: "center",
    padding: 20,
    marginTop: 30,
    color: "#8b949e",
  },
};
