// client/src/pages/Home.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import logo from "./logodraft.png";

export default function Home() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [repos, setRepos] = useState([]);
  const [popularRepos, setPopularRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }
    (async () => {
      try {
        const [myRepos, popular, ev] = await Promise.all([
          API.get("/repos/myrepos"),
          API.get("/repos/popular/all").catch(() => ({ data: { repos: [] } })),
          API.get("/events").catch(() => ({ data: { events: [] } })),
        ]);
        setRepos(myRepos.data.repos || myRepos.data || []);
        setPopularRepos(popular.data.repos || popular.data || []);
        setEvents(ev.data.events || ev.data || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.key, token, navigate]);

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (!token) return null;

  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.navbar}>
        <div style={S.navLeft}>
          <img src={logo} alt="CodeAmigos" style={S.navLogoImg} />
          <span style={S.navBrand}>CodeAmigos</span>
        </div>
        <div style={S.navCenter}>
          <input
            style={S.searchInput}
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={S.navRight}>
          <button style={S.navBtn} onClick={() => navigate("/explore")}>
            🔍 Explore
          </button>
          <button
            style={S.navBtnIcon}
            onClick={() => navigate("/notifications")}
          >
            🔔
          </button>
          <button style={S.navBtn} onClick={() => navigate("/newrepo")}>
            + New
          </button>
          <div style={S.avatarCircle} onClick={() => navigate("/profile")}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              user?.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>
        </div>
      </nav>

      {loading ? (
        <div style={S.loadingBox}>Loading...</div>
      ) : (
        <div style={S.body}>
          {/* Left Column - My Repos */}
          <div style={S.leftCol}>
            <div style={S.sectionHeader}>
              <h3 style={S.sectionTitle}>📁 My Repositories</h3>
            </div>

            {filteredRepos.length === 0 ? (
              <div style={S.emptyCard}>
                <p style={S.emptyText}>
                  {searchTerm
                    ? "No repos match your search."
                    : "You have no repositories yet."}
                </p>
                {!searchTerm && (
                  <button
                    style={S.createBtn}
                    onClick={() => navigate("/newrepo")}
                  >
                    Create Your First Repo
                  </button>
                )}
              </div>
            ) : (
              filteredRepos.map((r) => (
                <div
                  key={r._id}
                  style={S.repoCard}
                  onClick={() => navigate(`/repo/${r._id}`)}
                >
                  <div style={S.repoCardTop}>
                    <span style={S.repoIcon}>
                      {r.visibility === "private" ? "🔒" : "📁"}
                    </span>
                    <span style={S.repoCardName}>{r.name}</span>
                    <span style={S.visBadge}>{r.visibility}</span>
                  </div>
                  {r.description && (
                    <p style={S.repoCardDesc}>{r.description}</p>
                  )}
                  <div style={S.repoCardMeta}>
                    <span style={S.metaItem}>⭐ {r.stars?.length || 0}</span>
                    <span style={S.metaItem}>🍴 {r.forks?.length || 0}</span>
                    <span style={S.metaItem}>👁 {r.views || 0}</span>
                    <span style={S.metaTime}>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column */}
          <div style={S.rightCol}>
            {/* Welcome Card */}
            <div style={S.welcomeCard}>
              <h2 style={S.welcomeTitle}>
                Welcome back, {user?.username || "User"}! 👋
              </h2>
              <p style={S.welcomeDesc}>
                Start coding, collaborate with friends, and build amazing
                projects.
              </p>
              <div style={S.quickActions}>
                <button style={S.quickBtn} onClick={() => navigate("/explore")}>
                  🔍 Explore
                </button>
                <button style={S.quickBtn} onClick={() => navigate("/profile")}>
                  👤 Profile
                </button>
              </div>
            </div>

            {/* Popular Repos */}
            {popularRepos.length > 0 && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>🔥 Popular Repositories</h3>
                {popularRepos.slice(0, 5).map((r) => (
                  <div
                    key={r._id}
                    style={S.popularCard}
                    onClick={() => navigate(`/repo/${r._id}`)}
                  >
                    <div style={S.popularTop}>
                      <span style={S.popularOwner}>
                        {r.owner?.username || "user"} /
                      </span>
                      <span style={S.popularName}>{r.name}</span>
                    </div>
                    {r.description && (
                      <p style={S.popularDesc}>{r.description}</p>
                    )}
                    <div style={S.popularMeta}>
                      <span style={S.metaItem}>⭐ {r.stars?.length || 0}</span>
                      <span style={S.metaItem}>👁 {r.views || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Events */}
            {events.length > 0 && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>📅 Upcoming Events</h3>
                {events.slice(0, 5).map((e) => (
                  <div key={e._id} style={S.eventCard}>
                    <div style={S.eventDate}>
                      <span style={S.eventMonth}>
                        {new Date(e.date).toLocaleString("default", {
                          month: "short",
                        })}
                      </span>
                      <span style={S.eventDay}>
                        {new Date(e.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p style={S.eventTitle}>{e.title}</p>
                      <p style={S.eventDesc}>{e.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
    paddingTop: 64,
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
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navCenter: { flex: 1, maxWidth: 400, margin: "0 20px" },
  navRight: { display: "flex", alignItems: "center", gap: 8 },
  navLogo: { fontSize: 22, fontWeight: 900, color: "#58a6ff" },
  navLogoImg: { height: 32, width: 32, borderRadius: 6, objectFit: "contain" },
  navBrand: { fontSize: 18, fontWeight: 700, color: "#fff" },
  searchInput: {
    width: "100%",
    padding: "7px 14px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 14,
    outline: "none",
  },
  navBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "6px 12px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
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
  navBtnGhost: {
    background: "transparent",
    border: "none",
    color: "#8b949e",
    cursor: "pointer",
    fontSize: 13,
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
    overflow: "hidden",
  },

  body: {
    display: "flex",
    gap: 24,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 20px",
  },
  leftCol: { width: 350, flexShrink: 0 },
  rightCol: { flex: 1, minWidth: 0 },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, margin: 0, color: "#e6edf3" },
  newRepoBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "4px 12px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },

  repoCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  repoCardTop: { display: "flex", alignItems: "center", gap: 8 },
  repoIcon: { fontSize: 14 },
  repoCardName: { fontWeight: 600, fontSize: 14, color: "#58a6ff" },
  visBadge: {
    background: "transparent",
    border: "1px solid #30363d",
    color: "#8b949e",
    padding: "0 8px",
    borderRadius: 12,
    fontSize: 11,
  },
  repoCardDesc: {
    color: "#8b949e",
    fontSize: 13,
    margin: "6px 0 0",
    lineHeight: 1.4,
  },
  repoCardMeta: {
    display: "flex",
    gap: 12,
    marginTop: 8,
    fontSize: 12,
    color: "#484f58",
  },
  metaItem: { display: "flex", alignItems: "center", gap: 3 },
  metaTime: { marginLeft: "auto" },

  emptyCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 24,
    textAlign: "center",
  },
  emptyText: { color: "#484f58", fontSize: 14, margin: "0 0 12px" },
  createBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "8px 20px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },

  welcomeCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: { fontSize: 20, fontWeight: 600, margin: "0 0 8px" },
  welcomeDesc: { color: "#8b949e", fontSize: 14, margin: "0 0 14px" },
  quickActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  quickBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "8px 14px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },

  section: { marginBottom: 20 },
  popularCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: "10px 14px",
    marginTop: 8,
    cursor: "pointer",
  },
  popularTop: { display: "flex", alignItems: "center", gap: 4 },
  popularOwner: { color: "#8b949e", fontSize: 13 },
  popularName: { color: "#58a6ff", fontSize: 14, fontWeight: 600 },
  popularDesc: { color: "#8b949e", fontSize: 12, margin: "4px 0 0" },
  popularMeta: {
    display: "flex",
    gap: 10,
    marginTop: 6,
    fontSize: 12,
    color: "#484f58",
  },

  eventCard: {
    display: "flex",
    gap: 14,
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: "10px 14px",
    marginTop: 8,
  },
  eventDate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#21262d",
    borderRadius: 6,
    padding: "6px 12px",
    minWidth: 50,
  },
  eventMonth: {
    fontSize: 11,
    color: "#f78166",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  eventDay: { fontSize: 20, fontWeight: 700, color: "#e6edf3" },
  eventTitle: { fontWeight: 600, fontSize: 14, margin: "0 0 4px" },
  eventDesc: { color: "#8b949e", fontSize: 12, margin: 0 },

  loadingBox: { textAlign: "center", color: "#8b949e", paddingTop: 80 },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#484f58",
    paddingBottom: 30,
    fontSize: 13,
  },
};
