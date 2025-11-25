import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../services/api";

export default function Codespace() {
  const { repoId } = useParams();

  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]); // {file, content}
  const [activeTab, setActiveTab] = useState(null);
  const [status, setStatus] = useState("");

  // -------------------------------------------------------
  // LOAD ALL FILES IN REPO
  // -------------------------------------------------------
  const loadFiles = async () => {
    try {
      const res = await API.get(`/files/${repoId}/list`);
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  // -------------------------------------------------------
  // OPEN FILE -> ADD TO TAB + LOAD CONTENT
  // -------------------------------------------------------
  const openFile = async (file) => {
    const exists = openTabs.find((t) => t.file._id === file._id);

    if (exists) {
      setActiveTab(exists.file._id);
      return;
    }

    try {
      setStatus("Opening file…");

      const res = await API.get(`/files/${repoId}/file/${file._id}`);
      const url = res.data.cloudinaryUrl;

      const raw = await fetch(url);
      const text = await raw.text();

      const newTab = {
        file,
        content: text,
      };

      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTab(file._id);
      setStatus("Opened");
    } catch (err) {
      console.error(err);
      setStatus("Failed to open");
    }
  };

  // -------------------------------------------------------
  // UPDATE EDITOR CONTENT IN TAB
  // -------------------------------------------------------
  const updateTabContent = (fileId, newContent) => {
    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.file._id === fileId ? { ...tab, content: newContent } : tab
      )
    );
  };

  // -------------------------------------------------------
  // PUSH / SAVE FILE
  // -------------------------------------------------------
  const saveFile = async () => {
    const tab = openTabs.find((t) => t.file._id === activeTab);
    if (!tab) return;

    setStatus("Saving…");

    const blob = new Blob([tab.content], { type: "text/plain" });
    const fd = new FormData();
    fd.append("file", blob, tab.file.name);

    try {
      await API.put(`/files/${repoId}/file/${tab.file._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("Saved (Pushed)");
    } catch (err) {
      console.error(err);
      setStatus("Save failed");
    }
  };

  // -------------------------------------------------------
  // PULL / RELOAD FILE FROM CLOUDINARY
  // -------------------------------------------------------
  const pullFile = async () => {
    const tab = openTabs.find((t) => t.file._id === activeTab);
    if (!tab) return;

    setStatus("Pulling latest…");
    openFile(tab.file);
  };

  // -------------------------------------------------------
  // CLOSE TAB
  // -------------------------------------------------------
  const closeTab = (fileId) => {
    setOpenTabs((prev) => prev.filter((t) => t.file._id !== fileId));

    if (activeTab === fileId) {
      const remaining = openTabs.filter((t) => t.file._id !== fileId);
      setActiveTab(remaining.length ? remaining[0].file._id : null);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [repoId]);

  const active = openTabs.find((t) => t.file._id === activeTab);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1e1e1e" }}>
      {/* ------------------------- LEFT SIDEBAR ------------------------- */}
      <div
        style={{
          width: "260px",
          background: "#252526",
          color: "white",
          padding: "10px",
          overflowY: "auto",
          borderRight: "1px solid #333",
        }}
      >
        <h4>Files</h4>
        {files.length === 0 && <p>No files yet.</p>}

        {files.map((file) => (
          <div
            key={file._id}
            style={{
              padding: "8px",
              marginBottom: "4px",
              cursor: "pointer",
              background: activeTab === file._id ? "#3c3c3c" : "transparent",
            }}
            onClick={() => openFile(file)}
          >
            📄 {file.name}
          </div>
        ))}

        <hr className="text-secondary" />
        <Link to={`/repo/${repoId}`} className="btn btn-sm btn-secondary mt-2">
          ← Back to Repo
        </Link>
      </div>

      {/* ----------------------------- MAIN AREA ----------------------------- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ------------------------- TABS ------------------------- */}
        <div
          style={{
            display: "flex",
            background: "#2d2d2d",
            padding: "5px",
            borderBottom: "1px solid #333",
          }}
        >
          {openTabs.map((tab) => (
            <div
              key={tab.file._id}
              style={{
                padding: "8px 12px",
                marginRight: "5px",
                background: activeTab === tab.file._id ? "#1e1e1e" : "#3c3c3c",
                color: "white",
                cursor: "pointer",
                borderRadius: "4px 4px 0 0",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => setActiveTab(tab.file._id)}
            >
              {tab.file.name}
              <span
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.file._id);
                }}
              >
                ❌
              </span>
            </div>
          ))}
        </div>

        {/* ------------------------- MONACO EDITOR ------------------------- */}
        <div style={{ flex: 1 }}>
          {!active ? (
            <h3 style={{ color: "white", padding: "20px" }}>
              Select a file to begin editing
            </h3>
          ) : (
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={active.content}
              onChange={(val) => updateTabContent(activeTab, val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
              }}
            />
          )}
        </div>

        {/* ------------------------- FOOTER BUTTONS ------------------------- */}
        {active && (
          <div
            style={{
              padding: "10px",
              background: "#252526",
              borderTop: "1px solid #333",
              color: "lightgreen",
            }}
          >
            <button className="btn btn-success me-2" onClick={saveFile}>
              Push (Save)
            </button>
            <button className="btn btn-primary" onClick={pullFile}>
              Pull
            </button>

            <span style={{ marginLeft: "20px" }}>{status}</span>
          </div>
        )}
      </div>
    </div>
  );
}
