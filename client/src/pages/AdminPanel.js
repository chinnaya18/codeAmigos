import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
  });

  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const ev = await API.get("/admin/events");
      setEvents(ev.data);

      const us = await API.get("/admin/users");
      setUsers(us.data);
    } catch (err) {
      console.error("Admin load error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div style={styles.page}>
        <h2 style={{ color: "#ff6b6b" }}>❌ Access Denied</h2>
      </div>
    );
  }

  if (loading)
    return (
      <div style={styles.page}>
        <h3>Loading admin data...</h3>
      </div>
    );

  const submit = async () => {
    await API.post("/admin/events", form);
    setForm({ title: "", description: "", date: "" });
    load();
  };

  const deleteEvent = async (id) => {
    if (window.confirm("Delete event?")) {
      await API.delete(`/admin/events/${id}`);
      load();
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      await API.delete(`/admin/user/${id}`);
      load();
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.logo}>Admin Panel</h2>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.username}>{user.username}</span>

          <button
            style={styles.logoutBtn}
            onClick={() => {
              logout();
              window.location.href = "/signin";
            }}
          >
            ⎋ Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        <h1 style={styles.heading}>🛠 Admin Dashboard</h1>

        {/* CREATE EVENT */}
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
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>

          <input
            type="date"
            style={styles.input}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <button style={styles.button} onClick={submit}>
            ➕ Add Event
          </button>
        </div>

        {/* EVENTS LIST */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📅 Events</h2>

          {events.length === 0 && (
            <p style={styles.empty}>No events created yet.</p>
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
                onClick={() => deleteEvent(e._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* USERS LIST */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>👥 Users</h2>

          {users.length === 0 && <p style={styles.empty}>No users found.</p>}

          {users.map((u) => (
            <div key={u._id} style={styles.listItem}>
              <div>
                <strong>{u.username}</strong> <br />
                <span style={{ color: "#8b949e" }}>{u.email}</span>
              </div>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteUser(u._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <footer style={styles.footer}>
          © 2025 CodeAmigos • Admin Dashboard
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------------
   DARK THEME GITHUB STYLE + HEADER
---------------------------------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
  },

  /* HEADER */
  header: {
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "14px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#58a6ff",
  },
  headerLeft: {},
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
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

  /* MAIN ADMIN CONTENT */
  container: {
    width: "900px",
    margin: "40px auto",
  },

  heading: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "25px",
  },

  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    background: "#0d1117",
    color: "#c9d1d9",
    marginTop: "8px",
    marginBottom: "12px",
    fontSize: "15px",
  },

  button: {
    padding: "10px 16px",
    background: "#238636",
    border: "1px solid #2ea043",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },

  listItem: {
    background: "#0d1117",
    border: "1px solid #30363d",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deleteBtn: {
    background: "#b42323",
    border: "1px solid #da3633",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    color: "#8b949e",
  },

  footer: {
    textAlign: "center",
    padding: "25px",
    color: "#8b949e",
  },
};
