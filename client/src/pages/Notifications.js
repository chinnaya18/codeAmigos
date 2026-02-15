// client/src/pages/Notifications.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "./logodraft.png";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, invites
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success");

  const showFlash = (msg, type = "success") => {
    setFlash(msg);
    setFlashType(type);
    setTimeout(() => setFlash(""), 3000);
  };

  const load = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || res.data || []);
    } catch {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch {
      showFlash("Failed to mark as read", "error");
    }
  };

  const acceptInvite = async (id) => {
    try {
      await API.post(`/notifications/${id}/accept`);
      load();
      showFlash("Invitation accepted!");
    } catch (err) {
      showFlash(err.response?.data?.msg || "Failed to accept", "error");
    }
  };

  const declineInvite = async (id) => {
    try {
      await API.post(`/notifications/${id}/decline`);
      load();
      showFlash("Invitation declined.");
    } catch {
      showFlash("Failed to decline", "error");
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "invites")
      return n.type === "collab_invite" && n.status === "pending";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const inviteCount = notifications.filter(
    (n) => n.type === "collab_invite" && n.status === "pending",
  ).length;

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getIcon = (type) => {
    if (type === "collab_invite") return "👥";
    if (type === "repo_update") return "📁";
    if (type === "star") return "⭐";
    if (type === "fork") return "🍴";
    return "🔔";
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
          <div style={S.avatarCircle} onClick={() => navigate("/profile")}>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      <div style={S.container}>
        <h2 style={S.title}>🔔 Notifications</h2>

        {flash && (
          <div style={flashType === "error" ? S.errorBox : S.successBox}>
            {flash}
          </div>
        )}

        {/* Filters */}
        <div style={S.filterRow}>
          {[
            { id: "all", label: "All", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "invites", label: "Invitations", count: inviteCount },
          ].map((f) => (
            <button
              key={f.id}
              style={{
                ...S.filterBtn,
                ...(filter === f.id ? S.filterActive : {}),
              }}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              {f.count > 0 && <span style={S.filterCount}>{f.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={S.loadingText}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={S.emptyCard}>
            <span style={S.emptyIcon}>🔔</span>
            <p style={S.emptyText}>No notifications</p>
            <p style={S.emptyDesc}>You're all caught up!</p>
          </div>
        ) : (
          <div style={S.list}>
            {filtered.map((n) => (
              <div
                key={n._id}
                style={{
                  ...S.notifCard,
                  ...(n.read ? {} : S.unreadCard),
                }}
              >
                <div style={S.notifLeft}>
                  <span style={S.notifIcon}>{getIcon(n.type)}</span>
                  <div style={S.notifContent}>
                    <p style={S.notifMsg}>{n.message}</p>
                    <div style={S.notifMeta}>
                      {n.from?.username && (
                        <span style={S.fromUser}>from {n.from.username}</span>
                      )}
                      <span style={S.notifTime}>{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div style={S.notifActions}>
                  {n.type === "collab_invite" && n.status === "pending" && (
                    <>
                      <button
                        style={S.acceptBtn}
                        onClick={() => acceptInvite(n._id)}
                      >
                        Accept
                      </button>
                      <button
                        style={S.declineBtn}
                        onClick={() => declineInvite(n._id)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {!n.read && n.status !== "pending" && (
                    <button style={S.readBtn} onClick={() => markRead(n._id)}>
                      Mark Read
                    </button>
                  )}
                  {n.status === "accepted" && (
                    <span style={S.acceptedBadge}>✓ Accepted</span>
                  )}
                  {n.status === "declined" && (
                    <span style={S.declinedBadge}>✕ Declined</span>
                  )}
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

  container: { maxWidth: 800, margin: "0 auto", padding: "24px 20px" },
  title: { fontSize: 22, fontWeight: 600, margin: "0 0 16px" },

  filterRow: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid #21262d",
    marginBottom: 16,
  },
  filterBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#8b949e",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  filterActive: {
    color: "#e6edf3",
    borderBottom: "2px solid #f78166",
    fontWeight: 600,
  },
  filterCount: {
    background: "#30363d",
    padding: "0 7px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    color: "#c9d1d9",
  },

  list: {},
  notifCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: "12px 16px",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 10,
  },
  unreadCard: { borderLeft: "3px solid #58a6ff" },
  notifLeft: {
    display: "flex",
    gap: 12,
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
  },
  notifIcon: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  notifContent: { flex: 1, minWidth: 0 },
  notifMsg: {
    margin: "0 0 4px",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  notifMeta: { display: "flex", gap: 10, fontSize: 12, color: "#8b949e" },
  fromUser: { color: "#58a6ff" },
  notifTime: {},
  notifActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  acceptBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "5px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  declineBtn: {
    background: "transparent",
    border: "1px solid #f85149",
    color: "#f85149",
    padding: "5px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  readBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#8b949e",
    padding: "4px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  acceptedBadge: { color: "#3fb950", fontSize: 12, fontWeight: 500 },
  declinedBadge: { color: "#8b949e", fontSize: 12 },

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
  loadingText: { color: "#8b949e", textAlign: "center" },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#484f58",
    paddingBottom: 30,
    fontSize: 13,
  },
};
