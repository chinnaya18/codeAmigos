// client/src/pages/RepoViewer.js
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
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  /* Fetch Repo Info */
  const loadRepo = async () => {
    try {
      const res = await API.get(`/repos/${repoId}`);
      setRepo(res.data);
      setCollaborators(res.data.collaborators || []);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Unable to load this repository. It may be private or unavailable."
      );
    }
  };

  /* Fetch Files */
  const loadFiles = async () => {
    try {
      const res = await API.get(`/files/${repoId}/list`);
      const output = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.files)
        ? res.data.files
        : [];

      setFiles(output);
    } catch {
      setFiles([]);
    }
  };

  /* Add Collaborator */
  const addCollaborator = async () => {
    if (!inviteInput.trim()) return;

    try {
      const res = await API.post(`/repos/${repoId}/collaborators/add`, {
        collaborator: inviteInput,
      });

      setInviteInput("");
      loadRepo();
      setFlash(res.data.msg);
      setTimeout(() => setFlash(""), 2000);
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to add collaborator.");
    }
  };

  /* Remove Collaborator */
  const removeCollaborator = async (id) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?"))
      return;

    try {
      await API.delete(`/repos/${repoId}/collaborators/${id}`);
      loadRepo();
    } catch {
      alert("Failed to remove collaborator.");
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadRepo();
      await loadFiles();
      setLoading(false);
    };
    load();
  }, [repoId]);

  if (loading)
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading repository...</div>
      </div>
    );

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logodraft} alt="logo" style={{ width: 34 }} />
          <span style={styles.navTitle}>Repository</span>
        </div>

        <div style={styles.navRight}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() => navigate("/home")}
          >
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

      {/* Content */}
      <div style={styles.container}>
        <h2 style={styles.repoName}>
          {repo?.name}{" "}
          {repo && (
            <span style={styles.visibilityBadge}>{repo.visibility}</span>
          )}
        </h2>

        <p style={styles.description}>
          {repo?.description || "No description provided."}
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {flash && <div style={styles.successBox}>{flash}</div>}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() => navigate(`/codespace/${repoId}`)}
          >
            Open in Codespace
          </button>

          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => navigate(`/repo/${repoId}/file/new`)}
          >
            Add File
          </button>
        </div>

        {/* Files */}
        <h3 style={styles.sectionTitle}>Files</h3>

        {files.length === 0 ? (
          <p style={styles.empty}>This repository has no files yet.</p>
        ) : (
          <div style={styles.listBox}>
            {files.map((file) => (
              <div
                key={file._id}
                style={styles.listItem}
                onClick={() => navigate(`/repo/${repoId}/file/${file._id}`)}
              >
                {file.name}
              </div>
            ))}
          </div>
        )}

        {/* Collaborators */}
        <h3 style={styles.sectionTitle}>Collaborators</h3>

        <div style={styles.inviteRow}>
          <input
            placeholder="Enter a username..."
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            style={styles.inviteInput}
          />
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={addCollaborator}
          >
            Add
          </button>
        </div>

        {collaborators.length === 0 ? (
          <p style={styles.empty}>No collaborators assigned.</p>
        ) : (
          collaborators.map((c) => (
            <div key={c._id} style={styles.collabItem}>
              <span>{c.username}</span>

              {repo.owner === user?._id && (
                <button
                  style={{ ...styles.button, ...styles.dangerButton }}
                  onClick={() => removeCollaborator(c._id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} CodeAmigos
      </footer>
    </div>
  );
}

/* ---------- Modern UI Styles ---------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    paddingTop: "70px",
    fontFamily: "Inter, sans-serif",
  },

  navbar: {
    background: "#161b22",
    height: 60,
    borderBottom: "1px solid #30363d",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 100,
  },

  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  navTitle: { fontSize: 20, fontWeight: 600 },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    cursor: "pointer",
  },

  container: { width: "90%", maxWidth: 900, margin: "20px auto" },

  repoName: { fontSize: 28, marginBottom: 10 },
  description: { color: "#8b949e", marginBottom: 20 },

  visibilityBadge: {
    background: "#30363d",
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 14,
    marginLeft: 10,
  },

  button: {
    padding: "10px 18px",
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
    marginRight: 10,
    fontSize: "0.95rem",
    transition: "0.25s",
  },

  primaryButton: { background: "#238636", color: "#fff" },
  secondaryButton: { background: "#30363d", color: "#fff" },
  dangerButton: { background: "#b42323", color: "#fff" },

  actions: { marginBottom: 25 },

  listBox: {
    background: "#161b22",
    borderRadius: 10,
    border: "1px solid #30363d",
    padding: 10,
  },

  listItem: {
    padding: 14,
    cursor: "pointer",
    borderBottom: "1px solid #30363d",
    transition: "0.25s",
  },

  sectionTitle: { marginTop: 30, fontSize: 22 },

  inviteRow: { display: "flex", gap: 10, marginBottom: 20 },
  inviteInput: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#fff",
  },

  collabItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#161b22",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    border: "1px solid #30363d",
  },

  empty: { color: "#8b949e", marginBottom: 15 },

  errorBox: {
    background: "#762c2c",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    color: "#ffdcdc",
  },

  successBox: {
    background: "#1e4425",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    color: "#9df5af",
  },

  footer: {
    marginTop: 50,
    textAlign: "center",
    color: "#8b949e",
    paddingBottom: 30,
  },

  loading: {
    color: "#8b949e",
    textAlign: "center",
    paddingTop: 80,
  },
};
