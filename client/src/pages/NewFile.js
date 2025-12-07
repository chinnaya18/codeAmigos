import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import logodraft from "./logodraft.png";

export default function NewFile() {
  const { repoId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const upload = async () => {
    if (!file) return setError("Please select a file.");
    setError("");
    setUploading(true);
    setStatus("Uploading...");

    try {
      const fd = new FormData();
      fd.append("file", file);

      await API.post(`/files/${repoId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("Upload complete.");
      setTimeout(() => navigate(`/repo/${repoId}`), 800);
    } catch (err) {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ---------- NAVBAR ---------- */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logodraft} alt="logo" style={styles.logo} />
          <span style={styles.navTitle}>CodeAmigos</span>
        </div>

        <button style={styles.navButton} onClick={() => navigate("/home")}>
          Home
        </button>
      </nav>

      {/* ---------- CONTENT ---------- */}
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Upload File</h2>

          {error && <p style={styles.error}>{error}</p>}
          {status && <p style={styles.status}>{status}</p>}

          <input
            type="file"
            style={styles.fileInput}
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            style={{
              ...styles.uploadBtn,
              opacity: uploading ? 0.7 : 1,
              cursor: uploading ? "wait" : "pointer",
            }}
            onClick={upload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <footer style={styles.footer}>
        © 2025 CodeAmigos — File Upload Panel
      </footer>
    </div>
  );
}

/* ---------- PROFESSIONAL UI STYLE ---------- */

const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
    paddingTop: 80,
  },

  navbar: {
    height: 60,
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

  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navTitle: { fontSize: 20, fontWeight: 600 },
  logo: { width: 34, height: 34, borderRadius: "6px" },

  navButton: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "8px 18px",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },

  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "25px",
  },

  title: { fontSize: "22px", marginBottom: 20, fontWeight: 600 },

  fileInput: {
    width: "100%",
    padding: "12px",
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "6px",
    color: "#c9d1d9",
    marginBottom: 20,
  },

  uploadBtn: {
    width: "100%",
    padding: "12px",
    background: "#238636",
    border: "1px solid #2ea043",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "15px",
    color: "#fff",
  },

  status: {
    background: "#1b472b",
    padding: "10px",
    borderRadius: "6px",
    color: "#8bf59b",
    marginBottom: 15,
    fontSize: "14px",
    textAlign: "center",
  },

  error: {
    background: "#612525",
    border: "1px solid #da3633",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: 15,
    color: "#ffb3b3",
    textAlign: "center",
  },

  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#8b949e",
    paddingBottom: 30,
  },
};
