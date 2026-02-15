// client/src/pages/Profile.js
import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import logo from "./logodraft.png";

function buildHeatmapGrid(heatmap) {
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: heatmap[key] || 0 });
  }
  return days;
}

function heatColor(count) {
  if (count === 0) return "#161b22";
  if (count <= 1) return "#0e4429";
  if (count <= 3) return "#006d32";
  if (count <= 5) return "#26a641";
  return "#39d353";
}

const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  JSON: "#292929",
  Markdown: "#083fa1",
  C: "#555555",
  "C++": "#f34b7d",
  Ruby: "#701516",
  Go: "#00add8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  SQL: "#e38c00",
  Shell: "#89e051",
  YAML: "#cb171e",
  Other: "#8b949e",
};

export default function Profile() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState({});
  const [repos, setRepos] = useState([]);
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const showFlash = (msg, type = "success") => {
    setFlash(msg);
    setFlashType(type);
    setTimeout(() => setFlash(""), 3000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    (async () => {
      try {
        const [statsRes, reposRes] = await Promise.all([
          API.get("/profile/stats"),
          API.get("/repos/myrepos"),
        ]);
        setStats(statsRes.data);
        setHeatmap(statsRes.data.heatmap || {});
        setLanguages(statsRes.data.languages || {});
        setRepos(reposRes.data.repos || reposRes.data || []);
        setEditForm({ username: user.username || "", email: user.email || "" });
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [user]);

  const heatmapDays = useMemo(() => buildHeatmapGrid(heatmap), [heatmap]);
  const totalContributions = useMemo(
    () => heatmapDays.reduce((sum, d) => sum + d.count, 0),
    [heatmapDays],
  );

  const langEntries = useMemo(() => {
    const total = Object.values(languages).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        pct: ((count / total) * 100).toFixed(1),
      }));
  }, [languages]);

  const saveProfile = async () => {
    try {
      const res = await API.put("/profile", editForm);
      if (updateUser) {
        updateUser({
          username: res.data.username,
          email: res.data.email,
        });
      }
      setEditing(false);
      showFlash("Profile updated.");
    } catch (err) {
      showFlash(err.response?.data?.msg || "Update failed.", "error");
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await API.post("/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (updateUser) {
        updateUser({ avatar: res.data.url });
      }
      showFlash("Avatar updated.");
    } catch {
      showFlash("Avatar upload failed.", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.loadingBox}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.navbar}>
        <div style={S.navLeft}>
          <img
            src={logo}
            alt="CodeAmigos"
            style={S.navLogoImg}
            onClick={() => navigate("/home")}
          />
          <span style={S.navBrand} onClick={() => navigate("/home")}>
            CodeAmigos
          </span>
        </div>
        <div style={S.navRight}>
          <button style={S.navBtn} onClick={() => navigate("/home")}>
            Home
          </button>
          <button style={S.navBtn} onClick={() => navigate("/explore")}>
            Explore
          </button>
          <button style={S.navBtnGhost} onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={S.container}>
        {flash && (
          <div style={flashType === "error" ? S.errorBox : S.successBox}>
            {flash}
          </div>
        )}

        <div style={S.profileLayout}>
          {/* Left - Profile Card */}
          <div style={S.profileCard}>
            <div style={S.avatarSection}>
              <div style={S.avatarLarge}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" style={S.avatarImg} />
                ) : (
                  <span style={S.avatarLetter}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label style={S.uploadLabel}>
                📷 Change
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={uploadAvatar}
                  disabled={avatarUploading}
                />
              </label>
            </div>

            {editing ? (
              <div style={S.editSection}>
                <input
                  style={S.editInput}
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  placeholder="Username"
                />
                <input
                  style={S.editInput}
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Email"
                />
                <div style={S.editActions}>
                  <button style={S.saveBtn} onClick={saveProfile}>
                    Save
                  </button>
                  <button style={S.cancelBtn} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={S.profileName}>{user?.username}</h2>
                <p style={S.profileEmail}>{user?.email}</p>
                {user?.role === "admin" && (
                  <span style={S.roleBadge}>Admin</span>
                )}
                <button
                  style={S.editProfileBtn}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            )}

            {/* Stats */}
            <div style={S.statsGrid}>
              <div style={S.statItem}>
                <span style={S.statNum}>
                  {stats?.totalRepos || repos.length}
                </span>
                <span style={S.statLabel}>Repos</span>
              </div>
              <div style={S.statItem}>
                <span style={S.statNum}>{stats?.totalCollabs || 0}</span>
                <span style={S.statLabel}>Collabs</span>
              </div>
              <div style={S.statItem}>
                <span style={S.statNum}>{totalContributions}</span>
                <span style={S.statLabel}>Contributions</span>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div style={S.contentArea}>
            {/* Contribution Heatmap */}
            <div style={S.heatmapCard}>
              <h3 style={S.sectionTitle}>
                {totalContributions} contributions in the last year
              </h3>
              <div style={S.heatmapGrid}>
                {heatmapDays.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      ...S.heatCell,
                      background: heatColor(d.count),
                    }}
                    title={`${d.date}: ${d.count} contributions`}
                  />
                ))}
              </div>
              <div style={S.heatLegend}>
                <span style={S.legendLabel}>Less</span>
                {[0, 1, 3, 5, 7].map((n) => (
                  <div
                    key={n}
                    style={{ ...S.heatCell, background: heatColor(n) }}
                  />
                ))}
                <span style={S.legendLabel}>More</span>
              </div>
            </div>

            {/* Languages */}
            {langEntries.length > 0 && (
              <div style={S.langCard}>
                <h3 style={S.sectionTitle}>Languages</h3>
                <div style={S.langBar}>
                  {langEntries.map((l) => (
                    <div
                      key={l.name}
                      style={{
                        width: `${l.pct}%`,
                        background: LANG_COLORS[l.name] || LANG_COLORS.Other,
                        height: 8,
                        minWidth: 4,
                      }}
                      title={`${l.name} ${l.pct}%`}
                    />
                  ))}
                </div>
                <div style={S.langList}>
                  {langEntries.slice(0, 8).map((l) => (
                    <div key={l.name} style={S.langItem}>
                      <span
                        style={{
                          ...S.langDot,
                          background: LANG_COLORS[l.name] || LANG_COLORS.Other,
                        }}
                      />
                      <span style={S.langName}>{l.name}</span>
                      <span style={S.langPct}>{l.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repositories */}
            <div style={S.reposSection}>
              <h3 style={S.sectionTitle}>📁 Repositories</h3>
              {repos.length === 0 ? (
                <p style={S.empty}>No repositories yet.</p>
              ) : (
                <div style={S.repoGrid}>
                  {repos.map((r) => (
                    <div
                      key={r._id}
                      style={S.repoCard}
                      onClick={() => navigate(`/repo/${r._id}`)}
                    >
                      <div style={S.repoTop}>
                        <span style={S.repoName}>{r.name}</span>
                        <span style={S.visBadge}>{r.visibility}</span>
                      </div>
                      {r.description && (
                        <p style={S.repoDesc}>{r.description}</p>
                      )}
                      <div style={S.repoMeta}>
                        <span>⭐ {r.stars?.length || 0}</span>
                        <span>🍴 {r.forks?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer style={S.footer}>
        &copy; {new Date().getFullYear()} CodeAmigos
      </footer>
    </div>
  );
}

const S = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#e6edf3",
    paddingTop: 64,
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
  },
  navbar: {
    background: "#161b22",
    height: 60,
    borderBottom: "1px solid #30363d",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    boxSizing: "border-box",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  navRight: { display: "flex", alignItems: "center", gap: 8 },
  navLogo: { fontSize: 22, fontWeight: 900, color: "#58a6ff" },
  navLogoImg: {
    height: 32,
    width: 32,
    borderRadius: 6,
    objectFit: "contain",
    cursor: "pointer",
  },
  navBrand: { fontSize: 18, fontWeight: 700, color: "#fff" },
  navBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "6px 12px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 13,
  },
  navBtnGhost: {
    background: "transparent",
    border: "none",
    color: "#8b949e",
    cursor: "pointer",
    fontSize: 13,
  },

  container: { maxWidth: 1200, margin: "0 auto", padding: "24px 20px" },

  profileLayout: { display: "flex", gap: 24 },
  profileCard: {
    width: 300,
    flexShrink: 0,
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 20,
  },
  contentArea: { flex: 1, minWidth: 0 },

  avatarSection: { textAlign: "center", marginBottom: 16 },
  avatarLarge: {
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "#30363d",
    margin: "0 auto 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarLetter: { fontSize: 72, fontWeight: 700, color: "#e6edf3" },
  uploadLabel: {
    cursor: "pointer",
    color: "#58a6ff",
    fontSize: 13,
    fontWeight: 500,
  },

  profileName: { fontSize: 24, fontWeight: 700, margin: "0 0 4px" },
  profileEmail: { color: "#8b949e", fontSize: 14, margin: "0 0 8px" },
  roleBadge: {
    background: "#1f6feb33",
    color: "#58a6ff",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  editProfileBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "6px 0",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    width: "100%",
    marginTop: 12,
  },

  editSection: { marginTop: 12 },
  editInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 14,
    outline: "none",
    marginBottom: 8,
    boxSizing: "border-box",
  },
  editActions: { display: "flex", gap: 8 },
  saveBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    flex: 1,
  },
  cancelBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "6px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    flex: 1,
  },

  statsGrid: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 20,
    padding: "16px 0 0",
    borderTop: "1px solid #21262d",
  },
  statItem: { textAlign: "center" },
  statNum: {
    display: "block",
    fontSize: 20,
    fontWeight: 700,
    color: "#e6edf3",
  },
  statLabel: { fontSize: 12, color: "#8b949e" },

  heatmapCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, margin: "0 0 12px" },
  heatmapGrid: { display: "flex", flexWrap: "wrap", gap: 2 },
  heatCell: { width: 10, height: 10, borderRadius: 2 },
  heatLegend: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  legendLabel: { fontSize: 11, color: "#8b949e", marginRight: 4 },

  langCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  langBar: {
    display: "flex",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  langList: { display: "flex", flexWrap: "wrap", gap: 12 },
  langItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  langDot: { width: 10, height: 10, borderRadius: "50%" },
  langName: { color: "#c9d1d9", fontWeight: 500 },
  langPct: { color: "#8b949e" },

  reposSection: { marginBottom: 20 },
  repoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  repoCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: "12px 14px",
    cursor: "pointer",
  },
  repoTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  repoName: { color: "#58a6ff", fontWeight: 600, fontSize: 14 },
  visBadge: {
    background: "transparent",
    border: "1px solid #30363d",
    color: "#8b949e",
    padding: "0 8px",
    borderRadius: 12,
    fontSize: 11,
  },
  repoDesc: { color: "#8b949e", fontSize: 12, margin: "4px 0 0" },
  repoMeta: {
    display: "flex",
    gap: 10,
    marginTop: 8,
    fontSize: 12,
    color: "#484f58",
  },

  empty: { color: "#484f58", fontSize: 14 },
  errorBox: {
    background: "#3d1a1a",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 14,
    color: "#f85149",
    border: "1px solid #f85149",
    fontSize: 14,
  },
  successBox: {
    background: "#1b4332",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 14,
    color: "#3fb950",
    border: "1px solid #3fb950",
    fontSize: 14,
  },
  loadingBox: { textAlign: "center", color: "#8b949e", paddingTop: 80 },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#484f58",
    paddingBottom: 30,
    fontSize: 13,
  },
};
