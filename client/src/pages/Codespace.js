// client/src/pages/Codespace.js
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useContext,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "./logodraft.png";

/* ── helpers ── */
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

function getFileIcon(filename) {
  const ext = (filename || "").split(".").pop().toLowerCase();
  if (["js", "jsx"].includes(ext)) return "⬡";
  if (["ts", "tsx"].includes(ext)) return "◆";
  if (["py"].includes(ext)) return "🐍";
  if (["html"].includes(ext)) return "◈";
  if (["css", "scss"].includes(ext)) return "🎨";
  if (["json"].includes(ext)) return "{ }";
  if (["md", "txt"].includes(ext)) return "📄";
  return "📄";
}

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ══════════════════════════════════════════════════════ */

export default function Codespace() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const width = useWindowWidth();
  const isMobile = width < 768;

  /* state */
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(!isMobile);
  const [status, setStatus] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success");
  const [repo, setRepo] = useState(null);

  /* websocket */
  const [wsConnected, setWsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const wsRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  const showFlash = (msg, type = "success") => {
    setFlash(msg);
    setFlashType(type);
    setTimeout(() => setFlash(""), 3000);
  };

  /* ── load repo + files ── */
  useEffect(() => {
    (async () => {
      try {
        const [repoRes, filesRes] = await Promise.all([
          API.get(`/repos/${repoId}`),
          API.get(`/files/${repoId}/list`),
        ]);
        setRepo(repoRes.data);
        const list = Array.isArray(filesRes.data) ? filesRes.data : [];
        setFiles(list);
        if (list.length > 0) openFile(list[0]);
      } catch {
        setStatus("Failed to load codespace.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [repoId]);

  /* ── auto-close sidebar on small screens ── */
  useEffect(() => {
    if (isMobile) setSideOpen(false);
  }, [isMobile]);

  /* ── WebSocket ── */
  useEffect(() => {
    if (!user || !repoId) return;

    const wsUrl =
      (process.env.REACT_APP_API_URL || "http://localhost:5050")
        .replace(/^http/, "ws")
        .replace(/\/api$/, "") + "/ws/collab";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(
        JSON.stringify({
          type: "join",
          room: repoId,
          user: { id: user.id, username: user.username },
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "users":
            setConnectedUsers(Array.isArray(msg.users) ? msg.users : []);
            break;
          case "sync":
            break;
          case "edit":
            if (msg.user?.id !== user.id) {
              isRemoteChange.current = true;
              setContent(msg.content || "");
              isRemoteChange.current = false;
            }
            break;
          case "cursor":
            break;
          case "chat":
            setChatMessages((p) => [...p, msg]);
            break;
          case "user_joined":
            setConnectedUsers((prev) => {
              const arr = Array.isArray(prev) ? prev : [];
              if (!msg.user) return arr;
              if (arr.find((u) => u.id === msg.user.id)) return arr;
              return [...arr, msg.user];
            });
            break;
          case "user_left":
            setConnectedUsers((prev) => {
              const arr = Array.isArray(prev) ? prev : [];
              if (Array.isArray(msg.users)) return msg.users;
              return arr.filter((u) => u.id !== msg.userId);
            });
            break;
          default:
            break;
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    return () => ws.close();
    // eslint-disable-next-line
  }, [repoId, user]);

  /* ── open file ── */
  const openFile = async (file) => {
    try {
      setStatus("Loading file...");
      const res = await API.get(`/files/${repoId}/file/${file._id}`);
      const resp = await fetch(res.data.cloudinaryUrl);
      const text = await resp.text();
      setContent(text);
      setOriginalContent(text);
      setSelected(file);
      setDirty(false);
      setStatus("");
      if (isMobile) setSideOpen(false);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "edit",
            room: repoId,
            fileId: file._id,
            content: text,
            user: { id: user.id, username: user.username },
          }),
        );
      }
    } catch {
      setStatus("Failed to load file.");
    }
  };

  /* ── editor change ── */
  const handleEditorChange = useCallback(
    (value) => {
      if (isRemoteChange.current) return;
      setContent(value || "");
      setDirty(value !== originalContent);

      if (wsRef.current?.readyState === WebSocket.OPEN && selected) {
        wsRef.current.send(
          JSON.stringify({
            type: "edit",
            room: repoId,
            fileId: selected._id,
            content: value || "",
            user: { id: user?.id, username: user?.username },
          }),
        );
      }
    },
    // eslint-disable-next-line
    [originalContent, repoId, selected, user],
  );

  /* ── save ── */
  const saveFile = async () => {
    if (!selected || !dirty) return;
    setSaving(true);
    setStatus("Saving...");
    try {
      const blob = new Blob([content], { type: selected.mime || "text/plain" });
      const fd = new FormData();
      fd.append("file", blob, selected.name);
      if (commitMsg.trim()) fd.append("commitMessage", commitMsg.trim());
      await API.put(`/files/${repoId}/file/${selected._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOriginalContent(content);
      setDirty(false);
      setCommitMsg("");
      setStatus("Saved!");
      showFlash("File saved successfully.");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Save failed.");
      showFlash("Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── chat ── */
  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        room: repoId,
        message: chatInput.trim(),
        user: { id: user.id, username: user.username },
      }),
    );
    setChatInput("");
  };

  /* ── editor mount ── */
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.addAction({
      id: "save-file",
      label: "Save File",
      keybindings: [2048 | 49],
      run: () => saveFile(),
    });
  };

  /* ─────────── RENDER ─────────── */

  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.spinner} />
        <p style={{ color: "#8b949e", marginTop: 16 }}>Loading codespace…</p>
      </div>
    );
  }

  const safeUsers = Array.isArray(connectedUsers) ? connectedUsers : [];

  return (
    <div style={S.page}>
      {/* ── Top Bar ── */}
      <header style={{ ...S.topBar, ...(isMobile ? S.topBarMobile : {}) }}>
        <div style={S.topBarLeft}>
          <button
            style={S.backBtn}
            onClick={() => navigate(`/repo/${repoId}`)}
            title="Back to repository"
          >
            ←
          </button>
          <button
            style={S.iconBtn}
            onClick={() => setSideOpen(!sideOpen)}
            title="Toggle sidebar"
          >
            ☰
          </button>
          {!isMobile && (
            <>
              <img
                src={logo}
                alt="CodeAmigos"
                style={S.topLogoImg}
                onClick={() => navigate("/home")}
              />
              <span style={S.topBrand}>CodeAmigos</span>
              <span style={S.topSep}>|</span>
            </>
          )}
          <span style={S.topRepo} onClick={() => navigate(`/repo/${repoId}`)}>
            {repo?.name || "Repo"}
          </span>
          {selected && !isMobile && (
            <span style={S.topFile}>/ {selected.name}</span>
          )}
          {dirty && <span style={S.unsavedDot}>●</span>}
        </div>

        <div style={S.topBarRight}>
          {/* Connected users */}
          {!isMobile && (
            <div style={S.usersRow}>
              {safeUsers.map((u, i) => (
                <span
                  key={u.id || i}
                  style={{
                    ...S.userDot,
                    background: u.id === user?.id ? "#238636" : "#f78166",
                  }}
                  title={u.username}
                >
                  {(u.username || "?")[0].toUpperCase()}
                </span>
              ))}
              <span style={S.wsStatus}>
                {wsConnected ? "🟢 Live" : "⚪ Offline"}
              </span>
            </div>
          )}

          <button
            style={S.chatToggle}
            onClick={() => setChatOpen(!chatOpen)}
            title="Chat"
          >
            💬
            {chatMessages.length > 0 && (
              <span style={S.chatBadge}>{chatMessages.length}</span>
            )}
          </button>

          <button
            style={S.saveBtn}
            onClick={saveFile}
            disabled={!dirty || saving}
          >
            {saving
              ? "…"
              : dirty
                ? isMobile
                  ? "💾"
                  : "💾 Save"
                : isMobile
                  ? "✓"
                  : "✓ Saved"}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={S.body}>
        {/* Overlay for mobile sidebar */}
        {isMobile && sideOpen && (
          <div style={S.overlay} onClick={() => setSideOpen(false)} />
        )}

        {/* Sidebar */}
        {sideOpen && (
          <aside
            style={{
              ...S.sidebar,
              ...(isMobile ? S.sidebarMobile : {}),
            }}
          >
            <div style={S.sideHeader}>
              <span style={S.sideTitle}>EXPLORER</span>
              <div style={{ display: "flex", gap: 8 - 0 }}>
                <button
                  style={S.sideNewBtn}
                  onClick={() => navigate(`/repo/${repoId}/file/new`)}
                  title="New File"
                >
                  +
                </button>
                {isMobile && (
                  <button
                    style={S.sideCloseBtn}
                    onClick={() => setSideOpen(false)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div style={S.fileList}>
              {files.map((f) => (
                <div
                  key={f._id}
                  style={{
                    ...S.fileItem,
                    ...(selected?._id === f._id ? S.fileItemActive : {}),
                  }}
                  onClick={() => openFile(f)}
                >
                  <span style={S.fIcon}>{getFileIcon(f.name)}</span>
                  <span style={S.fName}>{f.name}</span>
                </div>
              ))}
              {files.length === 0 && <p style={S.empty}>No files yet</p>}
            </div>

            {/* Mobile connected-users strip */}
            {isMobile && safeUsers.length > 0 && (
              <div style={S.mobileUsersStrip}>
                <span
                  style={{ fontSize: 11, color: "#8b949e", marginRight: 6 }}
                >
                  {wsConnected ? "🟢" : "⚪"} Users:
                </span>
                {safeUsers.map((u, i) => (
                  <span
                    key={u.id || i}
                    style={{
                      ...S.userDot,
                      width: 22,
                      height: 22,
                      fontSize: 10,
                      background: u.id === user?.id ? "#238636" : "#f78166",
                    }}
                  >
                    {(u.username || "?")[0].toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Commit message */}
            <div style={S.commitSection}>
              <p style={S.commitLabel}>COMMIT MESSAGE</p>
              <input
                style={S.commitInput}
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="Update file…"
              />
            </div>
          </aside>
        )}

        {/* Editor */}
        <main style={S.editorArea}>
          {flash && (
            <div style={flashType === "error" ? S.errorFlash : S.successFlash}>
              {flash}
            </div>
          )}
          {status && <div style={S.statusBar}>{status}</div>}

          {selected ? (
            <Editor
              height="100%"
              language={getLanguage(selected.name)}
              value={content}
              theme="vs-dark"
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: isMobile ? 13 : 14,
                minimap: { enabled: !isMobile },
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10 },
                lineNumbers: isMobile ? "off" : "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                glyphMargin: !isMobile,
                folding: !isMobile,
              }}
            />
          ) : (
            <div style={S.noFile}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📝</div>
              <p style={S.noFileTitle}>No file selected</p>
              <p style={S.noFileDesc}>
                Select a file from the sidebar or create a new one
              </p>
              <button
                style={S.noFileBtn}
                onClick={() => navigate(`/repo/${repoId}/file/new`)}
              >
                + Create File
              </button>
            </div>
          )}
        </main>

        {/* Chat Panel */}
        {chatOpen && (
          <aside
            style={{ ...S.chatPanel, ...(isMobile ? S.chatPanelMobile : {}) }}
          >
            <div style={S.chatHeader}>
              <span style={{ fontWeight: 600 }}>💬 Chat</span>
              <button style={S.chatClose} onClick={() => setChatOpen(false)}>
                ✕
              </button>
            </div>
            <div style={S.chatMessages}>
              {chatMessages.length === 0 && (
                <p style={S.empty}>No messages yet</p>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} style={S.chatMsg}>
                  <span style={S.chatUser}>{m.user?.username || "anon"}:</span>{" "}
                  <span style={S.chatText}>{m.message}</span>
                </div>
              ))}
            </div>
            <div style={S.chatInputRow}>
              <input
                style={S.chatInputField}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message…"
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button style={S.chatSendBtn} onClick={sendChat}>
                Send
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile bottom bar — selected file name */}
      {isMobile && selected && (
        <div style={S.mobileBottomBar}>
          <span style={{ color: "#8b949e", fontSize: 12 }}>
            {getFileIcon(selected.name)} {selected.name}
          </span>
          {dirty && (
            <span style={{ color: "#e8ab53", fontSize: 12, marginLeft: 4 }}>
              ● unsaved
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ STYLES ═══════════════════ */

const S = {
  /* layout */
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#1e1e1e",
    color: "#d4d4d4",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    overflow: "hidden",
  },
  loadingPage: {
    background: "#1e1e1e",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #30363d",
    borderTop: "3px solid #58a6ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  /* top bar */
  topBar: {
    height: 48,
    minHeight: 48,
    background: "#333333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
    borderBottom: "1px solid #252526",
    flexShrink: 0,
    gap: 8,
  },
  topBarMobile: {
    height: 44,
    minHeight: 44,
    padding: "0 8px",
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    overflow: "hidden",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#ccc",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "1px solid #30363d",
    color: "#58a6ff",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: 6,
    flexShrink: 0,
    fontWeight: 600,
  },
  topLogo: {
    fontSize: 16,
    fontWeight: 900,
    color: "#569cd6",
    cursor: "pointer",
    flexShrink: 0,
  },
  topLogoImg: {
    height: 24,
    width: 24,
    borderRadius: 4,
    objectFit: "contain",
    cursor: "pointer",
    flexShrink: 0,
  },
  topBrand: { fontSize: 14, fontWeight: 600, color: "#e6edf3", flexShrink: 0 },
  topSep: { color: "#555", fontSize: 14, flexShrink: 0 },
  topRepo: {
    color: "#58a6ff",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  topFile: { color: "#8b949e", fontSize: 13, whiteSpace: "nowrap" },
  unsavedDot: { color: "#e8ab53", fontSize: 16, flexShrink: 0 },

  /* users */
  usersRow: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
  userDot: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  wsStatus: {
    fontSize: 11,
    color: "#8b949e",
    marginLeft: 4,
    whiteSpace: "nowrap",
  },

  /* chat toggle */
  chatToggle: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  chatBadge: {
    background: "#f85149",
    color: "#fff",
    padding: "0 5px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 700,
  },

  /* save */
  saveBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "5px 14px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  /* body */
  body: { display: "flex", flex: 1, overflow: "hidden", position: "relative" },

  /* overlay (mobile) */
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 20,
  },

  /* sidebar */
  sidebar: {
    width: 260,
    maxWidth: 260,
    background: "#252526",
    borderRight: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    zIndex: 25,
  },
  sidebarMobile: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "80%",
    maxWidth: 300,
    boxShadow: "4px 0 24px rgba(0,0,0,0.6)",
  },
  sideHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    fontSize: 11,
    letterSpacing: 1,
    color: "#8b949e",
    fontWeight: 700,
    borderBottom: "1px solid #333",
  },
  sideNewBtn: {
    background: "transparent",
    border: "none",
    color: "#58a6ff",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
  },
  sideCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#8b949e",
    cursor: "pointer",
    fontSize: 16,
  },
  sideTitle: {},
  fileList: { flex: 1, overflow: "auto", padding: "4px 0" },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: "#ccc",
    borderLeft: "3px solid transparent",
    transition: "background 0.15s",
  },
  fileItemActive: {
    background: "#37373d",
    color: "#fff",
    borderLeftColor: "#58a6ff",
  },
  fIcon: { fontSize: 14, flexShrink: 0 },
  fName: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  /* mobile users strip */
  mobileUsersStrip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "8px 14px",
    borderTop: "1px solid #333",
    flexWrap: "wrap",
  },

  /* commit */
  commitSection: { padding: "10px 14px", borderTop: "1px solid #333" },
  commitLabel: {
    fontSize: 11,
    color: "#8b949e",
    margin: "0 0 6px",
    fontWeight: 700,
    letterSpacing: 0.6,
  },
  commitInput: {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 4,
    background: "#1e1e1e",
    border: "1px solid #3c3c3c",
    color: "#ccc",
    fontSize: 12,
    outline: "none",
    boxSizing: "border-box",
  },

  /* editor */
  editorArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    minWidth: 0,
  },
  statusBar: {
    background: "#3c3c3c",
    color: "#ccc",
    padding: "4px 12px",
    fontSize: 12,
    textAlign: "center",
    flexShrink: 0,
  },

  noFile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
    padding: 24,
    textAlign: "center",
  },
  noFileTitle: { fontSize: 18, color: "#8b949e", fontWeight: 600, margin: 0 },
  noFileDesc: { fontSize: 13, color: "#555", margin: 0 },
  noFileBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "8px 20px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    marginTop: 8,
  },

  /* chat */
  chatPanel: {
    width: 280,
    maxWidth: 280,
    background: "#252526",
    borderLeft: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    zIndex: 25,
  },
  chatPanelMobile: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "80%",
    maxWidth: 300,
    boxShadow: "-4px 0 24px rgba(0,0,0,0.6)",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #333",
    fontSize: 14,
  },
  chatClose: {
    background: "transparent",
    border: "none",
    color: "#8b949e",
    cursor: "pointer",
    fontSize: 16,
  },
  chatMessages: { flex: 1, overflow: "auto", padding: "8px 12px" },
  chatMsg: { marginBottom: 8, fontSize: 13, lineHeight: 1.5 },
  chatUser: { color: "#58a6ff", fontWeight: 600, marginRight: 4 },
  chatText: { color: "#ccc" },
  chatInputRow: {
    display: "flex",
    gap: 6,
    padding: "8px 12px",
    borderTop: "1px solid #333",
  },
  chatInputField: {
    flex: 1,
    padding: "6px 8px",
    borderRadius: 4,
    background: "#1e1e1e",
    border: "1px solid #3c3c3c",
    color: "#ccc",
    fontSize: 12,
    outline: "none",
    minWidth: 0,
  },
  chatSendBtn: {
    background: "#238636",
    border: "none",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },

  /* flash */
  errorFlash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    background: "#3d1a1a",
    color: "#f85149",
    padding: "8px 14px",
    fontSize: 13,
    zIndex: 10,
    textAlign: "center",
    flexShrink: 0,
  },
  successFlash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    background: "#1b4332",
    color: "#3fb950",
    padding: "8px 14px",
    fontSize: 13,
    zIndex: 10,
    textAlign: "center",
    flexShrink: 0,
  },

  /* mobile bottom bar */
  mobileBottomBar: {
    background: "#007acc",
    padding: "4px 12px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  empty: { color: "#555", fontSize: 12, textAlign: "center", padding: 12 },
};
