// client/src/pages/Explore.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "./logodraft.png";

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/repos/explore?q=${encodeURIComponent(q || "")}`,
      );
      setRepos(res.data.repos || []);
    } catch {
      setRepos([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    doSearch("");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(search);
  };

  const toggleStar = async (repoId) => {
    try {
      const res = await API.post(`/repos/${repoId}/star`);
      setRepos((prev) =>
        prev.map((r) =>
          r._id === repoId
            ? {
                ...r,
                isStarred: res.data.starred,
                starCount: res.data.starCount,
              }
            : r,
        ),
      );
    } catch {}
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={S.page}>
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
          <button
            style={S.navBtnIcon}
            onClick={() => navigate("/notifications")}
          >
            🔔
          </button>
          <div style={S.avatarCircle} onClick={() => navigate("/profile")}>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      <div style={S.container}>
        <h2 style={S.title}>🔍 Explore Repositories</h2>
        <p style={S.subtitle}>
          Discover public repositories built by the community
        </p>

        <form onSubmit={handleSearch} style={S.searchRow}>
          <input
            style={S.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories by name, description, or owner..."
          />
          <button style={S.searchBtn} type="submit">
            Search
          </button>
        </form>

        {loading ? (
          <p style={S.loadingText}>Searching...</p>
        ) : repos.length === 0 ? (
          <div style={S.emptyCard}>
            <span style={S.emptyIcon}>🔍</span>
            <p style={S.emptyText}>
              {searched ? "No repositories found" : "Start exploring"}
            </p>
            <p style={S.emptyDesc}>
              Try a different search term or browse all repos
            </p>
          </div>
        ) : (
          <div style={S.repoList}>
            {repos.map((r) => (
              <div key={r._id} style={S.repoCard}>
                <div
                  style={S.repoMain}
                  onClick={() => navigate(`/repo/${r._id}`)}
                >
                  <div style={S.repoTop}>
                    <span style={S.repoIcon}>
                      {r.visibility === "private" ? "🔒" : "📁"}
                    </span>
                    <span style={S.ownerName}>
                      {r.owner?.username || "user"}
                    </span>
                    <span style={S.slash}>/</span>
                    <span style={S.repoName}>{r.name}</span>
                  </div>
                  {r.description && <p style={S.repoDesc}>{r.description}</p>}
                  <div style={S.repoMeta}>
                    <span style={S.metaItem}>
                      ⭐ {r.starCount || r.stars?.length || 0}
                    </span>
                    <span style={S.metaItem}>
                      🍴 {r.forkCount || r.forks?.length || 0}
                    </span>
                    <span style={S.metaItem}>👁 {r.views || 0}</span>
                    <span style={S.metaTime}>
                      Updated {timeAgo(r.updatedAt || r.createdAt)}
                    </span>
                  </div>
                </div>
                <div style={S.repoActions}>
                  <button
                    style={{ ...S.starBtn, ...(r.isStarred ? S.starred : {}) }}
                    onClick={() => toggleStar(r._id)}
                  >
                    {r.isStarred ? "★ Starred" : "☆ Star"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  navRight: { display: "flex", alignItems: "center", gap: 10 },
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
    padding: "6px 14px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 13,
  },
  navBtnIcon: {
    background: "transparent",
    border: "1px solid #30363d",
    padding: "6px 10px",
    borderRadius: 6,
    color: "#e6edf3",
    cursor: "pointer",
    fontSize: 16,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#238636",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    fontSize: 15,
  },

  container: { maxWidth: 900, margin: "0 auto", padding: "24px 20px" },
  title: { fontSize: 24, fontWeight: 600, margin: "0 0 4px" },
  subtitle: { color: "#8b949e", fontSize: 14, margin: "0 0 20px" },

  searchRow: { display: "flex", gap: 10, marginBottom: 24 },
  searchInput: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 15,
    outline: "none",
  },
  searchBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "10px 24px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },

  repoList: {},
  repoCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: "16px 20px",
    marginBottom: 10,
  },
  repoMain: { flex: 1, cursor: "pointer", minWidth: 0 },
  repoTop: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  repoIcon: { fontSize: 16 },
  ownerName: { color: "#58a6ff", fontSize: 15, fontWeight: 500 },
  slash: { color: "#8b949e" },
  repoName: { color: "#58a6ff", fontSize: 15, fontWeight: 700 },
  repoDesc: {
    color: "#8b949e",
    fontSize: 13,
    margin: "6px 0 0",
    lineHeight: 1.4,
  },
  repoMeta: {
    display: "flex",
    gap: 12,
    marginTop: 8,
    fontSize: 12,
    color: "#484f58",
    flexWrap: "wrap",
  },
  metaItem: {},
  metaTime: { marginLeft: "auto" },
  repoActions: { flexShrink: 0, marginLeft: 16 },
  starBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "5px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  starred: { color: "#e3b341", borderColor: "#e3b341" },

  emptyCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 40,
    textAlign: "center",
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 18, fontWeight: 600, margin: "12px 0 4px" },
  emptyDesc: { color: "#8b949e", fontSize: 14, margin: 0 },
  loadingText: { color: "#8b949e", textAlign: "center" },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#484f58",
    paddingBottom: 30,
    fontSize: 13,
  },
};
