import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "" });

  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const ev = await API.get("/admin/events");
      setEvents(ev.data);

      const us = await API.get("/admin/users");
      setUsers(us.data);
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
      <div style={styles.page}>
        <h2
          style={{ color: "#ff6b6b", textAlign: "center", marginTop: "30px" }}
        >
          Access Denied
        </h2>
      </div>
    );
  }

  const submit = async () => {
    await API.post("/admin/events", form);
    setForm({ title: "", description: "", date: "" });
    load();
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <h2 style={styles.logo}>Admin Panel</h2>

        <div style={styles.headerRight}>
          <span style={styles.username}>{user.username}</span>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              logout();
              window.location.href = "/signin";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.container}>
        <h1 style={styles.heading}>Admin Dashboard</h1>

        {loading && <p style={styles.loading}>Loading...</p>}

        {!loading && (
          <>
            {/* ---- GRID SECTIONS ---- */}
            <div style={styles.grid}>
              {/* Create Event Card */}
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Create New Event</h2>

                <input
                  style={styles.input}
                  placeholder="Event title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <textarea
                  style={{ ...styles.input, height: 90 }}
                  placeholder="Event description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                ></textarea>

                <input
                  type="date"
                  style={styles.input}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />

                <button style={styles.button} onClick={submit}>
                  Add Event
                </button>
              </div>

              {/* Events List */}
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Events</h2>

                {events.length === 0 && (
                  <p style={styles.empty}>No events available.</p>
                )}

                {events.map((e) => (
                  <div key={e._id} style={styles.listItem}>
                    <div>
                      <strong>{e.title}</strong>
                      <p style={{ fontSize: 13, color: "#8b949e" }}>
                        {e.description}
                      </p>
                      <small style={{ color: "#58a6ff" }}>{e.date}</small>
                    </div>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => {
                        if (window.confirm("Delete this event?")) {
                          API.delete(`/admin/events/${e._id}`);
                          load();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Users List */}
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Users</h2>

                {users.length === 0 && (
                  <p style={styles.empty}>No users found.</p>
                )}

                {users.map((u) => (
                  <div key={u._id} style={styles.listItem}>
                    <div>
                      <strong>{u.username}</strong> <br />
                      <span style={{ color: "#8b949e" }}>{u.email}</span>
                    </div>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => {
                        if (window.confirm("Delete this user?")) {
                          API.delete(`/admin/user/${u._id}`);
                          load();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <footer style={styles.footer}>
          © 2025 CodeAmigos — Admin Dashboard
        </footer>
      </main>
    </div>
  );
}

/* ----------- STYLES (RESPONSIVE) ------------- */

const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
  },

  header: {
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
    flexWrap: "wrap",
  },

  logo: { margin: 0, fontSize: "22px", color: "#58a6ff" },

  headerRight: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  username: {
    fontSize: "15px",
    opacity: 0.8,
  },

  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "6px",
    background: "#b42323",
    border: "1px solid #da3633",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },

  container: {
    width: "95%",
    maxWidth: "1100px",
    margin: "30px auto",
  },

  heading: {
    fontSize: "30px",
    marginBottom: "20px",
    textAlign: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "20px",
  },

  sectionTitle: { fontSize: "20px", marginBottom: "10px" },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#0d1117",
    color: "#c9d1d9",
    marginBottom: "10px",
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#238636",
    border: "1px solid #2ea043",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 5,
  },

  listItem: {
    background: "#0d1117",
    border: "1px solid #30363d",
    padding: "14px",
    borderRadius: "6px",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  deleteBtn: {
    background: "#b42323",
    border: "1px solid #da3633",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
  },

  footer: {
    marginTop: "30px",
    textAlign: "center",
    color: "#8b949e",
  },

  loading: { textAlign: "center", padding: "20px" },
};
