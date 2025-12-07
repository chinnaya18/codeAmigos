import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function FileViewer() {
  const { repoId, fileId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadFile = async () => {
      try {
        const res = await API.get(`/files/${repoId}/file/${fileId}`);

        if (!res.data?.metadata) {
          setError("File metadata missing.");
          return;
        }

        setMeta(res.data.metadata);

        const response = await fetch(res.data.cloudinaryUrl);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError("Failed to load file.");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [repoId, fileId]);

  const saveFile = async () => {
    if (!meta) return;

    setSaving(true);
    setStatus("Saving...");

    try {
      const blob = new Blob([content], { type: meta.mime || "text/plain" });
      const formData = new FormData();
      formData.append("file", blob, meta.name);

      const res = await API.put(`/files/${repoId}/file/${fileId}`, formData);

      setMeta(res.data);
      setStatus("Saved ✔");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.centerMessage}>Loading file...</div>;

  if (error)
    return (
      <div style={{ ...styles.centerMessage, color: "#ff6b6b" }}>{error}</div>
    );

  return (
    <div style={styles.page}>
      {/* --- Top Header --- */}
      <div style={styles.topBar}>
        <button
          style={styles.backBtn}
          onClick={() => navigate(`/repo/${repoId}`)}
        >
          ← Back
        </button>

        <span style={styles.filename}>{meta?.name}</span>

        {status && <span style={styles.status}>{status}</span>}
      </div>

      {/* --- Editor --- */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={styles.editor}
        spellCheck={false}
      />

      {/* --- Bottom Action Bar --- */}
      <div style={styles.actionBar}>
        <button
          onClick={saveFile}
          disabled={saving}
          style={{
            ...styles.saveButton,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "wait" : "pointer",
          }}
        >
           {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Final GitHub Dark UI Styles ---------- */
const styles = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    padding: "20px",
    color: "#e6edf3",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    padding: "10px",
    background: "#161b22",
    borderRadius: "6px",
    border: "1px solid #30363d",
  },

  filename: {
    fontSize: "18px",
    fontWeight: 600,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "0.2s",
  },

  status: {
    fontSize: "14px",
    color: "#9ae29a",
    opacity: 0.9,
  },

  editor: {
    width: "100%",
    flex: 1,
    minHeight: "300px",
    background: "#0f1724",
    color: "#e6edf3",
    border: "1px solid #30363d",
    padding: "14px",
    borderRadius: "8px",
    resize: "vertical",
    fontFamily: "Consolas, Menlo, monospace",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },

  actionBar: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
  },

  saveButton: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "10px 18px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
  },

  centerMessage: {
    textAlign: "center",
    padding: "30px",
    color: "#c9d1d9",
    fontSize: "18px",
  },
};
