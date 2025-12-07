import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../services/api";

export default function Codespace() {
  const { repoId } = useParams();

  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [status, setStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ---------------- Fetch Files -------------------
  const loadFiles = async () => {
    try {
      const res = await API.get(`/files/${repoId}/list`);
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  // ---------------- Open File --------------------
  const openFile = async (file) => {
    const exists = openTabs.find((t) => t.file._id === file._id);

    if (exists) {
      setActiveTab(file._id);
      return;
    }

    try {
      setStatus("Opening file...");

      const res = await API.get(`/files/${repoId}/file/${file._id}`);
      const url = res.data.cloudinaryUrl;

      const content = await (await fetch(url)).text();

      const newTab = { file, content };
      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTab(file._id);
      setStatus("Opened");
    } catch {
      setStatus("Failed to open file");
    }
  };

  // ---------------- Update Editor --------------------
  const updateTabContent = (fileId, text) => {
    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.file._id === fileId ? { ...tab, content: text } : tab
      )
    );
  };

  // ---------------- Save File ------------------------
  const saveFile = async () => {
    const tab = openTabs.find((t) => t.file._id === activeTab);
    if (!tab) return;

    setStatus("Saving...");

    const blob = new Blob([tab.content], { type: "text/plain" });
    const fd = new FormData();
    fd.append("file", blob, tab.file.name);

    try {
      await API.put(`/files/${repoId}/file/${tab.file._id}`, fd);
      setStatus("Saved");
    } catch {
      setStatus("Save Failed");
    }
  };

  // ---------------- Pull Latest ------------------------
  // ---------------- Pull Latest ------------------------
  const pullFile = async () => {
    const tab = openTabs.find((t) => t.file._id === activeTab);
    if (!tab) return;

    setStatus("Pulling latest...");

    try {
      const res = await API.get(`/files/${repoId}/file/${tab.file._id}`);
      const freshContent = await (await fetch(res.data.cloudinaryUrl)).text();

      setOpenTabs((prev) =>
        prev.map((t) =>
          t.file._id === tab.file._id ? { ...t, content: freshContent } : t
        )
      );

      setStatus("Latest version pulled ✔");
    } catch (err) {
      setStatus("Pull failed ❌");
    }
  };

  // ---------------- Close Tab ------------------------
  const closeTab = (fileId) => {
    const newTabs = openTabs.filter((t) => t.file._id !== fileId);
    setOpenTabs(newTabs);

    if (activeTab === fileId) {
      setActiveTab(newTabs.length ? newTabs[0].file._id : null);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [repoId]);

  const active = openTabs.find((t) => t.file._id === activeTab);

  return (
    <div style={styles.wrapper}>
      {/* ---- Top Bar ---- */}
      <div style={styles.topBar}>
        <button
          style={styles.menuBtn}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          Menu
        </button>
        <h3 style={{ margin: 0, color: "#fff" }}>Codespace</h3>
      </div>

      {/* ---- Sidebar ---- */}
      <aside
        style={{
          ...styles.sidebar,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <h4>Files</h4>
        {files.length === 0 && <p>No files yet.</p>}

        {files.map((file) => (
          <div
            key={file._id}
            style={{
              ...styles.fileItem,
              background: activeTab === file._id ? "#3c3c3c" : "transparent",
            }}
            onClick={() => openFile(file)}
          >
            {file.name}
          </div>
        ))}

        <Link to={`/repo/${repoId}`} style={styles.backBtn}>
          Back to Repo
        </Link>
      </aside>

      {/* ---- Editor Area ---- */}
      <main
        style={{
          ...styles.main,
          marginLeft: sidebarOpen ? "250px" : "0", // ← full width when sidebar closed
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Tabs */}
        <div style={styles.tabs}>
          {openTabs.map((tab) => (
            <div
              key={tab.file._id}
              style={{
                ...styles.tab,
                background: activeTab === tab.file._id ? "#1e1e1e" : "#3c3c3c",
              }}
              onClick={() => setActiveTab(tab.file._id)}
            >
              {tab.file.name}
              <span
                style={styles.close}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.file._id);
                }}
              >
                x
              </span>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div style={{ flex: 1 }}>
          {!active ? (
            <h3 style={styles.emptyText}>Select a file to begin editing</h3>
          ) : (
            <Editor
              height="100%"
              theme="vs-dark"
              value={active.content}
              defaultLanguage="javascript"
              onChange={(v) => updateTabContent(activeTab, v)}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          )}
        </div>

        {/* Footer */}
        {active && (
          <div style={styles.footer}>
            <button style={styles.saveBtn} onClick={saveFile}>
              Push
            </button>
            <button style={styles.pullBtn} onClick={pullFile}>
              Pull
            </button>
            <span style={{ marginLeft: 20 }}>{status}</span>
          </div>
        )}
      </main>
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#1e1e1e",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    background: "#2d2d2d",
    borderBottom: "1px solid #444",
  },

  menuBtn: {
    background: "#444",
    color: "#fff",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  sidebar: {
    width: "250px",
    background: "#252526",
    color: "white",
    padding: "10px",
    borderRight: "1px solid #333",
    overflowY: "auto",
    transition: "0.3s",
    position: "absolute",
    top: "50px",
    height: "calc(100vh - 50px)",
    zIndex: 20,
  },

  backBtn: {
    marginTop: "15px",
    display: "block",
    padding: "8px",
    background: "#444",
    textAlign: "center",
    color: "white",
    borderRadius: "6px",
    textDecoration: "none",
  },

  fileItem: {
    padding: "8px",
    cursor: "pointer",
    borderRadius: "4px",
    marginBottom: "6px",
  },

  main: {
    flex: 1,
    marginLeft: "250px",
    display: "flex",
    flexDirection: "column",
  },

  tabs: {
    display: "flex",
    background: "#2d2d2d",
    padding: "5px",
    overflowX: "auto",
    gap: "5px",
  },

  tab: {
    padding: "6px 10px",
    color: "white",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
    display: "inline-flex",
    alignItems: "center",
  },

  close: {
    marginLeft: "8px",
    cursor: "pointer",
    color: "#bbb",
  },

  emptyText: {
    color: "white",
    padding: "20px",
  },

  footer: {
    padding: "10px",
    background: "#252526",
    borderTop: "1px solid #333",
    color: "#9f9",
  },

  saveBtn: {
    background: "#238636",
    border: "none",
    padding: "8px 12px",
    marginRight: "10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  pullBtn: {
    background: "#1f6feb",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};
