import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logodraft from "./logodraft.png";

export default function RepoViewer() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [inviteInput, setInviteInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- LOAD REPO ---------------- */
  const loadRepo = async () => {
    try {
      const res = await API.get(`/repos/${repoId}`);
      setRepo(res.data);
      setCollaborators(res.data.collaborators || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load repository");
    }
  };

  /* ---------------- LOAD FILES ---------------- */
  const loadFiles = async () => {
    try {
      const res = await API.get(`/files/${repoId}`);

      const data = res.data;
      const final = Array.isArray(data)
        ? data
        : Array.isArray(data.files)
        ? data.files
        : [];

      setFiles(final);
    } catch (err) {
      console.error("File load error:", err);
      setFiles([]);
    }
  };

  /* ---------------- ADD COLLABORATOR ---------------- */
  const addCollaborator = async () => {
    if (!inviteInput.trim()) return;

    try {
      await API.post(`/repos/${repoId}/collaborators/add`, {
        collaborator: inviteInput,
      });

      setInviteInput("");
      loadRepo();
      alert("Collaborator added!");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add collaborator");
    }
  };

  /* ---------------- DELETE COLLABORATOR ---------------- */
  const removeCollaborator = async (id) => {
    if (!window.confirm("Remove this collaborator?")) return;

    try {
      await API.delete(`/repos/${repoId}/collaborators/${id}`);
      loadRepo();
    } catch (err) {
      alert("Failed to remove collaborator");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await loadRepo();
      await loadFiles();
      setLoading(false);
    };
    loadAll();
  }, [repoId]);

  if (loading) return <div style={styles.loading}>Loading…</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.page}>
      {/* ---------------- NAVBAR ---------------- */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <img
            src={logodraft}
            alt="logo"
            style={{ width: 34, height: 34, borderRadius: "6px" }}
          />
          <span style={styles.navTitle}>CodeAmigos</span>
        </div>

        <div style={styles.navRight}>
          <button style={styles.navButton} onClick={() => navigate("/home")}>
            Home
          </button>

          <img
            src={logodraft}
            alt="profile"
            style={styles.profileIcon}
            onClick={() => navigate("/profile")}
          />
        </div>
      </nav>

      {/* ---------------- CONTENT ---------------- */}
      <div style={styles.container}>
        <h2 style={styles.repoName}>
          {repo?.name}{" "}
          <span style={styles.visibilityBadge}>{repo?.visibility}</span>
        </h2>

        <p style={styles.description}>
          {repo?.description || "No description provided."}
        </p>

        <div style={styles.repoActions}>
          <button
            style={styles.codespaceBtn}
            onClick={() => navigate(`/codespace/${repoId}`)}
          >
            🚀 Open in Codespace
          </button>

          <button
            style={styles.newFileBtn}
            onClick={() => navigate(`/repo/${repoId}/file/new`)}
          >
            ➕ Add File
          </button>
        </div>

        {/* ---------------- COLLABORATORS SECTION ---------------- */}
        <h3 style={styles.sectionTitle}>🤝 Collaborators</h3>

        <div style={styles.inviteBox}>
          <input
            placeholder="Enter username or email"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            style={styles.inviteInput}
          />
          <button style={styles.inviteBtn} onClick={addCollaborator}>
            Invite
          </button>
        </div>

        {collaborators.length === 0 ? (
          <p style={styles.empty}>No collaborators added yet.</p>
        ) : (
          collaborators.map((c) => (
            <div key={c._id} style={styles.collabItem}>
              <span>
                👤 {c.username}{" "}
                <small style={{ color: "#8b949e" }}>{c.email}</small>
              </span>
              <button
                style={styles.removeBtn}
                onClick={() => removeCollaborator(c._id)}
              >
                ✖
              </button>
            </div>
          ))
        )}

        {/* ---------------- FILES SECTION ---------------- */}
        <h3 style={styles.sectionTitle}>📁 Repository Files</h3>

        {files.length === 0 ? (
          <p style={styles.empty}>No files in this repository.</p>
        ) : (
          <div style={styles.fileList}>
            {files.map((file) => (
              <div
                key={file._id}
                style={styles.fileItem}
                onClick={() => navigate(`/repo/${repoId}/file/${file._id}`)}
              >
                📄 {file.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © 2025 CodeAmigos • Repository Viewer
      </footer>
    </div>
  );
}

/* ------------------------------------------
   STYLES (Same Dark GitHub Theme)
------------------------------------------- */

const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
    paddingTop: "70px",
  },

  navbar: {
    height: "60px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  navLeft: { display: "flex", alignItems: "center", gap: "12px" },
  navTitle: { fontSize: 20, fontWeight: 600 },
  navRight: { display: "flex", alignItems: "center", gap: "15px" },

  navButton: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "2px solid #30363d",
    cursor: "pointer",
  },

  container: { width: "900px", margin: "30px auto" },

  repoName: { fontSize: "28px", marginBottom: "10px" },
  visibilityBadge: {
    background: "#30363d",
    padding: "4px 10px",
    borderRadius: "6px",
  },

  description: { color: "#8b949e" },

  repoActions: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  codespaceBtn: {
    background: "#0969da",
    border: "1px solid #1f6feb",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#fff",
  },

  newFileBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#fff",
  },

  /* Collaborators */
  inviteBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },

  inviteInput: {
    flex: 1,
    background: "#0d1117",
    border: "1px solid #30363d",
    padding: "10px",
    borderRadius: "6px",
    color: "#c9d1d9",
  },

  inviteBtn: {
    background: "#1f6feb",
    border: "1px solid #3c82f6",
    padding: "10px 14px",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
  },

  collabItem: {
    background: "#161b22",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #30363d",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
  },

  removeBtn: {
    background: "#da3633",
    border: "1px solid #f85149",
    padding: "4px 10px",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
  },

  fileList: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "10px",
    padding: "10px",
  },

  fileItem: {
    padding: "12px 15px",
    borderBottom: "1px solid #30363d",
    cursor: "pointer",
  },

  empty: { color: "#8b949e" },

  footer: { marginTop: "40px", padding: "15px", textAlign: "center" },

  loading: { padding: 20, color: "#58a6ff" },
  error: { padding: 20, color: "#ff6b6b" },
};
