import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "./logodraft.png";

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("events");
  const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0 });

  const load = async () => {
    try {
      setLoading(true);
      const [ev, us] = await Promise.all([
        API.get("/admin/events"),
        API.get("/admin/users"),
      ]);
      setEvents(ev.data);
      setUsers(us.data);
      setStats({ totalUsers: us.data.length, totalEvents: ev.data.length });
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div style={S.page}>
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <h2 style={{ color: "#f85149" }}>Access Denied</h2>
          <p style={{ color: "#8b949e" }}>You don't have admin permissions.</p>
        </div>
      </div>
    );
  }

  const submitEvent = async () => {
    if (!form.title || !form.date) return;
    await API.post("/admin/events", form);
    setForm({ title: "", description: "", date: "" });
    load();
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await API.delete(`/admin/events/${id}`);
    load();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await API.delete(`/admin/user/${id}`);
    load();
  };

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navL}>
          <img
            src={logo}
            alt="CodeAmigos"
            style={{
              height: 28,
              width: 28,
              borderRadius: 4,
              objectFit: "contain",
            }}
          />
          <span
            style={{
              marginLeft: 8,
              fontWeight: 600,
              fontSize: 16,
              color: "#f0f6fc",
            }}
          >
            Admin Dashboard
          </span>
        </div>
        <div style={S.navR}>
          <span style={{ color: "#8b949e", fontSize: 14 }}>
            {user.username}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/signin");
            }}
            style={{
              ...S.navBtn,
              background: "#da3633",
              borderColor: "#f85149",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={S.main}>
        {/* Stats */}
        <div style={S.statsRow}>
          <div style={S.stat}>
            <span style={S.statNum}>{stats.totalUsers}</span>
            <span style={S.statLabel}>Users</span>
          </div>
          <div style={S.stat}>
            <span style={S.statNum}>{stats.totalEvents}</span>
            <span style={S.statLabel}>Events</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {["events", "users", "create"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}
            >
              {t === "events"
                ? "Events"
                : t === "users"
                  ? "Users"
                  : "Create Event"}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ color: "#8b949e", textAlign: "center", padding: 40 }}>
            Loading...
          </p>
        )}

        {!loading && tab === "create" && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>Create New Event</h3>
            <input
              style={S.input}
              placeholder="Event title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              style={{ ...S.input, height: 80, resize: "vertical" }}
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              type="date"
              style={S.input}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <button style={S.greenBtn} onClick={submitEvent}>
              Create Event
            </button>
          </div>
        )}

        {!loading && tab === "events" && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>All Events ({events.length})</h3>
            {events.length === 0 && (
              <p style={{ color: "#8b949e" }}>No events yet.</p>
            )}
            {events.map((e) => (
              <div key={e._id} style={S.row}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#f0f6fc" }}>
                    {e.title}
                  </div>
                  {e.description && (
                    <div
                      style={{ fontSize: 13, color: "#8b949e", marginTop: 2 }}
                    >
                      {e.description}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#58a6ff", marginTop: 4 }}>
                    {e.date ? new Date(e.date).toLocaleDateString() : "No date"}
                  </div>
                </div>
                <button style={S.delBtn} onClick={() => deleteEvent(e._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "users" && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>All Users ({users.length})</h3>
            {users.length === 0 && (
              <p style={{ color: "#8b949e" }}>No users found.</p>
            )}
            {users.map((u) => (
              <div key={u._id} style={S.row}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <div style={S.avatar}>
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#30363d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          color: "#8b949e",
                        }}
                      >
                        {u.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#f0f6fc" }}>
                      {u.username}
                    </div>
                    <div style={{ fontSize: 13, color: "#8b949e" }}>
                      {u.email}
                    </div>
                  </div>
                  {u.role === "admin" && <span style={S.badge}>admin</span>}
                </div>
                {u._id !== user.id && (
                  <button style={S.delBtn} onClick={() => deleteUser(u._id)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  nav: {
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  navL: { display: "flex", alignItems: "center" },
  navR: { display: "flex", alignItems: "center", gap: 12 },
  navBtn: {
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: 500,
    color: "#f0f6fc",
    background: "#21262d",
    border: "1px solid #30363d",
    borderRadius: 6,
    cursor: "pointer",
  },
  main: {
    maxWidth: 800,
    margin: "24px auto",
    padding: "0 16px",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: "20px",
    textAlign: "center",
  },
  statNum: {
    display: "block",
    fontSize: 32,
    fontWeight: 600,
    color: "#58a6ff",
  },
  statLabel: {
    fontSize: 14,
    color: "#8b949e",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #30363d",
    marginBottom: 16,
  },
  tab: {
    padding: "8px 16px",
    fontSize: 14,
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#8b949e",
    cursor: "pointer",
    fontWeight: 500,
  },
  tabActive: {
    color: "#f0f6fc",
    borderBottomColor: "#f78166",
  },
  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#f0f6fc",
    marginTop: 0,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: "5px 12px",
    fontSize: 14,
    color: "#f0f6fc",
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 6,
    marginBottom: 12,
    outline: "none",
    boxSizing: "border-box",
  },
  greenBtn: {
    padding: "5px 16px",
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    background: "#238636",
    border: "1px solid #2ea043",
    borderRadius: 6,
    cursor: "pointer",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #21262d",
    gap: 12,
  },
  delBtn: {
    padding: "3px 12px",
    fontSize: 12,
    color: "#f85149",
    background: "transparent",
    border: "1px solid #f85149",
    borderRadius: 6,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  badge: {
    padding: "0 7px",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
    borderRadius: 10,
    border: "1px solid #30363d",
    color: "#8b949e",
  },
  avatar: {},
};
