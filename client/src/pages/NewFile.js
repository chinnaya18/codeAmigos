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

  const upload = async () => {
    if (!file) return setError("Please select a file.");
    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      await API.post(`/files/${repoId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/repo/${repoId}`);
    } catch (err) {
      setError("Upload failed");
      console.error(err);
    }

    setUploading(false);
  };

  return (
    <div style={styles.page}>
      {/* ---------------- HEADER ---------------- */}
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
        </div>
      </nav>

      {/* ---------------- CONTENT ---------------- */}
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Upload New File</h2>

          {error && <p style={styles.error}>{error}</p>}

          <input
            type="file"
            style={styles.fileInput}
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            style={styles.uploadBtn}
            onClick={upload}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload File"}
          </button>
        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer style={styles.footer}>© 2025 CodeAmigos • File Upload</footer>
    </div>
  );
}

/* ------------------------------------------
   DARK GITHUB UI — INLINE STYLE SHEET
------------------------------------------- */

const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#c9d1d9",
    fontFamily: "Inter, sans-serif",
    paddingTop: "80px", // space for navbar
  },

  /* NAVBAR */
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

  navRight: { display: "flex", gap: "10px", alignItems: "center" },

  navButton: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },

  /* CONTENT */
  container: {
    width: "900px",
    margin: "0 auto",
    marginTop: "40px",
  },

  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
  },

  title: { fontSize: "24px", marginBottom: "20px" },

  fileInput: {
    background: "#0d1117",
    border: "1px solid #30363d",
    padding: "12px",
    width: "100%",
    borderRadius: "6px",
    color: "#c9d1d9",
    marginBottom: "20px",
  },

  uploadBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "white",
    padding: "12px",
    width: "100%",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: 600,
  },

  error: {
    background: "#3b0a0a",
    border: "1px solid #ff6b6b",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "15px",
    color: "#ffb3b3",
  },

  footer: {
    textAlign: "center",
    marginTop: "40px",
    padding: "15px",
    color: "#8b949e",
  },
};
