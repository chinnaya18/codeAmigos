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

  /* -------- Fetch Files -------- */
  const loadFiles = async () => {
    try {
      const res = await API.get(`/files/${repoId}/list`);
      setFiles(Array.isArray(res.data) ? res.data : res.data?.files || []);
    } catch {
      console.error("Failed to load files.");
    }
  };

  useEffect(() => loadFiles(), [repoId]);

  /* -------- Open File -------- */
  const openFile = async (file) => {
    if (openTabs.find((t) => t.file._id === file._id))
      return setActiveTab(file._id);

    try {
      setStatus("Opening...");

      const res = await API.get(`/files/${repoId}/file/${file._id}`);
      const content = await (await fetch(res.data.cloudinaryUrl)).text();

      setOpenTabs((prev) => [...prev, { file, content }]);
      setActiveTab(file._id);
      setStatus("Opened ✓");
    } catch {
      setStatus("Failed to open");
    }
  };

  /* -------- Update on typing -------- */
  const updateTabContent = (fileId, text) =>
    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.file._id === fileId ? { ...tab, content: text } : tab
      )
    );

  /* -------- Save file -------- */
  const saveFile = async () => {
    const tab = openTabs.find((t) => t.file._id === activeTab);
    if (!tab) return;

    setStatus("Saving...");

    const blob = new Blob([tab.content], { type: "text/plain" });
    const fd = new FormData();
    fd.append("file", blob, tab.file.name);

    try {
      await API.put(`/files/${repoId}/file/${tab.file._id}`, fd);
      setStatus("Saved ✓");
    } catch {
      setStatus("Save failed");
    }
  };

  /* -------- Pull new version -------- */
  const pullFile = async () => {
    const tab = openTabs.find((t) => t.file._id === activeTab);
    if (!tab) return;

    setStatus("Pulling...");

    try {
      const res = await API.get(`/files/${repoId}/file/${tab.file._id}`);
      const latest = await (await fetch(res.data.cloudinaryUrl)).text();

      updateTabContent(tab.file._id, latest);
      setStatus("Updated ✓");
    } catch {
      setStatus("Pull failed");
    }
  };

  /* -------- Close tab -------- */
  const closeTab = (id) => {
    const updated = openTabs.filter((t) => t.file._id !== id);
    setOpenTabs(updated);
    if (activeTab === id) setActiveTab(updated[0]?.file._id || null);
  };

  const active = openTabs.find((t) => t.file._id === activeTab);

  return (
    <div style={styles.wrapper}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <button
          style={styles.menuBtn}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? "📁 Hide Files" : "📂 Show Files"}
        </button>
        <h3 style={{ margin: 0 }}>Codespace</h3>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          left: sidebarOpen ? "0" : "-270px",
        }}
      >
        <h4>Files</h4>

        {files.map((file) => (
          <div
            key={file._id}
            onClick={() => openFile(file)}
            style={{
              ...styles.fileItem,
              background: file._id === activeTab ? "#3c3c3c" : "transparent",
            }}
          >
            {file.name}
          </div>
        ))}

        <Link to={`/repo/${repoId}`} style={styles.backBtn}>
          ⬅ Back
        </Link>
      </aside>

      {/* MAIN (Auto resizes when sidebar hides) */}
      <main
        style={{
          ...styles.main,
          marginLeft: sidebarOpen ? 250 : 0,
        }}
      >
        {/* Tabs */}
        <div style={styles.tabs}>
          {openTabs.map((tab) => (
            <div
              key={tab.file._id}
              onClick={() => setActiveTab(tab.file._id)}
              style={{
                ...styles.tab,
                background: activeTab === tab.file._id ? "#1e1e1e" : "#3c3c3c",
              }}
            >
              {tab.file.name}
              <span
                style={styles.close}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.file._id);
                }}
              >
                ✖
              </span>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div style={{ flex: 1 }}>
          {!active ? (
            <div style={styles.emptyMessage}>Open a file to start editing</div>
          ) : (
            <Editor
              height="100%"
              theme="vs-dark"
              value={active.content}
              onChange={(v) => updateTabContent(activeTab, v)}
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                smoothScrolling: true,
              }}
            />
          )}
        </div>

        {/* Actions */}
        {active && (
          <footer style={styles.footer}>
            <button style={styles.saveBtn} onClick={saveFile}>
              Push
            </button>
            <button style={styles.pullBtn} onClick={pullFile}>
              Pull
            </button>
            <span style={{ marginLeft: 15, opacity: 0.7 }}>{status}</span>
          </footer>
        )}
      </main>
    </div>
  );
}

/* -------- Styles -------- */
const styles = {
  wrapper: {
    height: "100vh",
    background: "#1e1e1e",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    padding: "10px",
    background: "#2d2d2d",
    borderBottom: "1px solid #444",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff",
  },
  menuBtn: {
    background: "#444",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
  },
  sidebar: {
    position: "absolute",
    top: 50,
    bottom: 0,
    width: 250,
    background: "#252526",
    borderRight: "1px solid #333",
    padding: 10,
    transition: "0.35s",
    color: "white",
    overflowY: "auto",
    zIndex: 10,
  },
  fileItem: {
    padding: "8px",
    cursor: "pointer",
    borderRadius: 6,
    marginBottom: 6,
    transition: "0.2s",
  },
  backBtn: {
    display: "block",
    marginTop: 12,
    padding: 8,
    textAlign: "center",
    background: "#444",
    borderRadius: 6,
    color: "white",
    textDecoration: "none",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    transition: "0.4s",
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    background: "#2d2d2d",
    padding: 6,
    gap: 5,
    overflowX: "auto",
  },
  tab: {
    padding: "6px 10px",
    borderRadius: "6px 6px 0 0",
    cursor: "pointer",
    color: "#fff",
    whiteSpace: "nowrap",
  },
  close: { marginLeft: 8, cursor: "pointer", opacity: 0.7 },
  emptyMessage: { color: "#ccc", padding: 20, textAlign: "center" },
  footer: {
    padding: 10,
    borderTop: "1px solid #333",
    background: "#202020",
    display: "flex",
    alignItems: "center",
    color: "#ccc",
  },
  saveBtn: {
    background: "#238636",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    color: "#fff",
  },
  pullBtn: {
    background: "#1f6feb",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    marginLeft: 10,
    color: "#fff",
  },
};
