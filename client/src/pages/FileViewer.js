// client/src/pages/FileViewer.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../services/api";

function getLanguage(filename) {
  const ext = (filename || "").split(".").pop().toLowerCase();
  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    md: "markdown",
    xml: "xml",
    yml: "yaml",
    yaml: "yaml",
    sql: "sql",
    sh: "shell",
    rb: "ruby",
    go: "go",
    rs: "rust",
    php: "php",
    txt: "plaintext",
  };
  return map[ext] || "plaintext";
}

export default function FileViewer() {
  const { repoId, fileId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [dirty, setDirty] = useState(false);

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
        setOriginalContent(text);
      } catch {
        setError("Failed to load file.");
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [repoId, fileId]);

  const handleChange = (value) => {
    setContent(value || "");
    setDirty(value !== originalContent);
  };

  const saveFile = async () => {
    if (!meta || !dirty) return;
    setSaving(true);
    setStatus("Saving...");
    try {
      const blob = new Blob([content], { type: meta.mime || "text/plain" });
      const fd = new FormData();
      fd.append("file", blob, meta.name);
      if (commitMsg.trim()) fd.append("commitMessage", commitMsg.trim());
      const res = await API.put(`/files/${repoId}/file/${fileId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMeta(res.data);
      setOriginalContent(content);
      setDirty(false);
      setCommitMsg("");
      setStatus("Saved ✔");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={S.center}>Loading file...</div>;
  if (error)
    return <div style={{ ...S.center, color: "#f85149" }}>{error}</div>;

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <div style={S.topLeft}>
          <button style={S.backBtn} onClick={() => navigate(`/repo/${repoId}`)}>
            ← Back
          </button>
          <span style={S.fileName}>{meta?.name}</span>
          {dirty && <span style={S.unsaved}>● unsaved</span>}
        </div>
        <div style={S.topRight}>
          {status && <span style={S.status}>{status}</span>}
          <button
            style={S.openCodespace}
            onClick={() => navigate(`/codespace/${repoId}`)}
          >
            Open in Codespace
          </button>
        </div>
      </div>

      <div style={S.editorWrap}>
        <Editor
          height="100%"
          language={getLanguage(meta?.name)}
          value={content}
          theme="vs-dark"
          onChange={handleChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 },
            lineNumbers: "on",
            renderLineHighlight: "all",
          }}
        />
      </div>

      <div style={S.actionBar}>
        <input
          style={S.commitInput}
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Commit message (optional)..."
        />
        <button
          onClick={saveFile}
          disabled={!dirty || saving}
          style={{ ...S.saveBtn, opacity: dirty ? 1 : 0.5 }}
        >
          {saving ? "Saving..." : "💾 Save changes"}
        </button>
      </div>
    </div>
  );
}

const S = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    color: "#e6edf3",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
  },
  topLeft: { display: "flex", alignItems: "center", gap: 12 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: {
    background: "transparent",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  fileName: { fontSize: 16, fontWeight: 600 },
  unsaved: { color: "#e8ab53", fontSize: 12 },
  status: { fontSize: 13, color: "#3fb950" },
  openCodespace: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#58a6ff",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  editorWrap: { flex: 1, minHeight: 400 },
  actionBar: {
    display: "flex",
    gap: 10,
    padding: "12px 20px",
    background: "#161b22",
    borderTop: "1px solid #30363d",
  },
  commitInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 14,
    outline: "none",
  },
  saveBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "8px 18px",
    borderRadius: 6,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  center: {
    textAlign: "center",
    padding: 40,
    color: "#8b949e",
    fontSize: 16,
    background: "#0d1117",
    minHeight: "100vh",
  },
};
