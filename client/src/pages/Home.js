import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import logodraft from "./logodraft.png";

export default function Home() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [repos, setRepos] = useState([]);
  const [popularRepos, setPopularRepos] = useState([]);
  const [events, setEvents] = useState([]);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const headerHeight = 60;

  /* Detect screen responsiveness live */
  const [mobile, setMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const resizeCheck = () => setMobile(window.innerWidth < 992);
    window.addEventListener("resize", resizeCheck);
    return () => window.removeEventListener("resize", resizeCheck);
  }, []);

  /* Load Everything */
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const myRepos = await API.get("/repos/myrepos");
        setRepos(myRepos.data.repos || myRepos.data);

        const popular = await API.get("/repos/popular/all");
        setPopularRepos(popular.data.repos || popular.data);

        const ev = await API.get("/events");
        setEvents(ev.data.events);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    })();
  }, [location.key, token]);

  return (
    <div style={styles.page}>
      {/* ---------- NAVBAR ---------- */}
      <nav style={styles.navbar}>
        {/* LEFT AREA */}
        <div style={styles.navLeft}>
          {mobile && (
            <button style={styles.iconButton} onClick={() => setLeftOpen(true)}>
              ☰
            </button>
          )}

          <img
            src={logodraft}
            width="36"
            height="36"
            alt="logo"
            style={styles.logo}
          />

          {!mobile && (
            <input placeholder="Search repositories..." style={styles.search} />
          )}
        </div>

        {/* RIGHT AREA */}
        <div style={styles.navRight}>
          {/* Create Repo (+ Button) */}
          <button
            style={styles.iconButton}
            title="New Repository"
            onClick={() => navigate("/newrepo")}
          >
            ➕
          </button>

          {/* Bell Notification Button */}
          <button
            style={styles.iconButton}
            title="Notifications"
            onClick={() => navigate("/notifications")}
          >
            🔔
          </button>

          {/* Profile */}
          <img
            src={logodraft}
            width="35"
            height="35"
            alt="profile"
            style={styles.profile}
            onClick={() => navigate("/profile")}
          />
        </div>
      </nav>

      {/* ---------- MAIN LAYOUT ---------- */}
      <div style={styles.layout(mobile, headerHeight)}>
        {/* -------- LEFT SIDEBAR -------- */}
        {(leftOpen || !mobile) && (
          <aside style={styles.leftSidebar(mobile, headerHeight)}>
            <h5 style={styles.sidebarHeader}>Your Repositories</h5>

            {repos.map((repo) => (
              <div
                key={repo._id}
                style={styles.sidebarItem}
                onClick={() => {
                  navigate(`/repo/${repo._id}`);
                  setLeftOpen(false);
                }}
              >
                {repo.name}
              </div>
            ))}

            {mobile && (
              <button
                style={styles.closeButton}
                onClick={() => setLeftOpen(false)}
              >
                Close
              </button>
            )}
          </aside>
        )}

        {/* -------- MAIN CONTENT -------- */}
        <main style={styles.main(mobile, headerHeight)}>
          <h2 style={styles.title}> Welcome to CodeAmigos</h2>
          <p style={styles.subText}>Collaborate, code and share together.</p>

          <h3 style={styles.section}>📅 Upcoming Events</h3>

          {events.length === 0 && (
            <p style={styles.placeholder}>No events scheduled.</p>
          )}

          {events.map((ev) => (
            <div key={ev._id} style={styles.eventCard}>
              <h5>{ev.title}</h5>
              <p>{ev.description}</p>
              <small style={{ color: "#58a6ff" }}>{ev.date}</small>
            </div>
          ))}
        </main>

        {/* -------- RIGHT SIDEBAR -------- */}
        {(rightOpen || !mobile) && (
          <aside style={styles.rightSidebar(mobile, headerHeight)}>
            <h5 style={styles.sidebarHeader}> Popular Repositories</h5>

            {popularRepos.map((repo) => (
              <div
                key={repo._id}
                style={styles.sidebarItem}
                onClick={() => {
                  navigate(`/repo/${repo._id}`);
                  setRightOpen(false);
                }}
              >
                {repo.name} — {repo.views} views
              </div>
            ))}

            {mobile && (
              <button
                style={styles.closeButton}
                onClick={() => setRightOpen(false)}
              >
                Close
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const styles = {
  page: { background: "#0d1117", minHeight: "100vh", color: "#fff" },

  navbar: {
    height: 60,
    background: "#161b22",
    padding: "0 16px",
    borderBottom: "1px solid #30363d",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navRight: { display: "flex", gap: 10, alignItems: "center" },

  logo: { borderRadius: "50%" },

  iconButton: {
    fontSize: 20,
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    color: "#fff",
  },

  search: {
    width: 230,
    padding: "6px 10px",
    borderRadius: 6,
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#fff",
  },

  profile: {
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #30363d",
  },

  layout: (mobile, h) => ({
    display: "flex",
    flexDirection: mobile ? "column" : "row",
  }),

  leftSidebar: (mobile, h) => ({
    width: mobile ? "100%" : 280,
    position: mobile ? "fixed" : "sticky",
    top: h,
    height: `calc(100vh - ${h}px)`,
    background: "#161b22",
    borderRight: "1px solid #30363d",
    padding: 15,
    overflowY: "auto",
    zIndex: 99,
  }),

  rightSidebar: (mobile, h) => ({
    width: mobile ? "100%" : 280,
    position: mobile ? "fixed" : "sticky",
    top: h,
    height: `calc(100vh - ${h}px)`,
    background: "#161b22",
    borderLeft: "1px solid #30363d",
    padding: 15,
    overflowY: "auto",
    zIndex: 99,
  }),

  sidebarHeader: {
    borderBottom: "1px solid #30363d",
    paddingBottom: 6,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 600,
  },

  sidebarItem: {
    background: "#21262d",
    padding: 10,
    marginTop: 6,
    cursor: "pointer",
    borderRadius: 6,
  },

  closeButton: {
    background: "#b42323",
    border: "1px solid #da3633",
    padding: 10,
    marginTop: 15,
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },

  main: (mobile, h) => ({
    flex: 1,
    padding: 25,
    marginTop: mobile ? h : 0,
  }),

  title: { fontSize: 26, marginBottom: 4 },
  subText: { opacity: 0.7 },
  section: { marginTop: 30, fontSize: 20 },

  eventCard: {
    background: "#161b22",
    padding: 15,
    borderRadius: 10,
    border: "1px solid #30363d",
    marginTop: 10,
  },

  placeholder: { opacity: 0.6, marginTop: 5 },
};
