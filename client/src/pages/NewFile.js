// client/src/pages/NewFile.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "./logodraft.png";

export default function NewFile() {
  const { repoId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [commitMsg, setCommitMsg] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!file) return setError("Please select a file.");
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (commitMsg.trim()) fd.append("commitMessage", commitMsg.trim());
      await API.post(`/files/${repoId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/repo/${repoId}`);
    } catch (err) {
      setError(err.response?.data?.msg || "Upload failed.");
    } finally {
      setUploading(false);
    }
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
          <span style={S.navBrand}>CodeAmigos</span>
        </div>
        <button style={S.navBtn} onClick={() => navigate(`/repo/${repoId}`)}>
          ← Back to Repo
        </button>
      </nav>

      <div style={S.container}>
        <h2 style={S.title}>Add a new file</h2>
        <p style={S.subtitle}>Upload a file to your repository</p>

        {error && <div style={S.errorBox}>{error}</div>}

        <div style={S.card}>
          <div style={S.dropZone}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={S.fileInput}
              id="fileUpload"
            />
            <label htmlFor="fileUpload" style={S.dropLabel}>
              <span style={S.dropIcon}>📁</span>
              <span style={S.dropText}>
                {file ? file.name : "Click to choose a file"}
              </span>
              {file && (
                <span style={S.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
            </label>
          </div>

          <div style={S.commitSection}>
            <label style={S.label}>Commit message</label>
            <input
              style={S.input}
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder={file ? `Add ${file.name}` : "Add new file"}
            />
          </div>

          <div style={S.actions}>
            <button
              style={S.cancelBtn}
              onClick={() => navigate(`/repo/${repoId}`)}
            >
              Cancel
            </button>
            <button
              style={{ ...S.submitBtn, opacity: uploading ? 0.6 : 1 }}
              onClick={upload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "📤 Upload File"}
            </button>
          </div>
        </div>
      </div>
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
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navLogoImg: {
    height: 32,
    width: 32,
    borderRadius: 6,
    objectFit: "contain",
    cursor: "pointer",
  },
  navLogo: {
    fontSize: 22,
    fontWeight: 900,
    color: "#58a6ff",
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

  container: { maxWidth: 600, margin: "0 auto", padding: "30px 20px" },
  title: { fontSize: 24, fontWeight: 600, margin: "0 0 4px" },
  subtitle: { color: "#8b949e", fontSize: 14, margin: "0 0 20px" },
  errorBox: {
    background: "#3d1a1a",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 14,
    color: "#f85149",
    border: "1px solid #f85149",
    fontSize: 14,
  },

  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: 24,
  },
  dropZone: { marginBottom: 20 },
  fileInput: { display: "none" },
  dropLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 30,
    border: "2px dashed #30363d",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "center",
  },
  dropIcon: { fontSize: 32 },
  dropText: { color: "#58a6ff", fontSize: 14, fontWeight: 500 },
  fileSize: { color: "#8b949e", fontSize: 12 },

  commitSection: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#c9d1d9",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 10,
    borderTop: "1px solid #21262d",
  },
  cancelBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "8px 18px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 14,
  },
  submitBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "8px 18px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};
