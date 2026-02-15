// client/src/pages/RepoViewer.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "./logodraft.png";

export default function RepoViewer() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteInput, setInviteInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [editingReadme, setEditingReadme] = useState(false);
  const [readmeText, setReadmeText] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descText, setDescText] = useState("");

  const isOwner = repo?.isOwner;
  const isCollaborator = repo?.isCollaborator;
  const canEdit = isOwner || isCollaborator;

  const showFlash = (msg, type = "success") => {
    setFlash(msg);
    setFlashType(type);
    setTimeout(() => setFlash(""), 3500);
  };

  const loadRepo = async () => {
    try {
      const res = await API.get(`/repos/${repoId}`);
      setRepo(res.data);
      setCollaborators(res.data.collaborators || []);
      setPendingInvites(res.data.pendingInvites || []);
      setReadmeText(res.data.readme || "");
      setDescText(res.data.description || "");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load repository.");
    }
  };

  const loadFiles = async () => {
    try {
      const res = await API.get(`/files/${repoId}/list`);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFiles([]);
    }
  };

  const loadCommits = async () => {
    try {
      const res = await API.get(`/repos/${repoId}/commits`);
      setCommits(res.data.commits || []);
    } catch {
      setCommits([]);
    }
  };

  const toggleStar = async () => {
    try {
      const res = await API.post(`/repos/${repoId}/star`);
      setRepo((prev) => ({
        ...prev,
        isStarred: res.data.starred,
        starCount: res.data.starCount,
      }));
    } catch {
      showFlash("Failed to star", "error");
    }
  };

  const forkRepo = async () => {
    try {
      const res = await API.post(`/repos/${repoId}/fork`);
      showFlash("Repository forked! Redirecting...");
      setTimeout(() => navigate(`/repo/${res.data.repo._id}`), 1000);
    } catch (err) {
      showFlash(err.response?.data?.msg || "Fork failed", "error");
    }
  };

  const deleteRepo = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete this repository and all its files.",
      )
    )
      return;
    try {
      await API.delete(`/repos/${repoId}`);
      showFlash("Repository deleted.");
      setTimeout(() => navigate("/home"), 800);
    } catch {
      showFlash("Failed to delete repository.", "error");
    }
  };

  const sendInvitation = async () => {
    if (!inviteInput.trim()) return;
    setInviting(true);
    try {
      const res = await API.post(`/repos/${repoId}/collaborators/add`, {
        collaborator: inviteInput.trim(),
      });
      setInviteInput("");
      loadRepo();
      showFlash(res.data.msg);
    } catch (err) {
      showFlash(
        err.response?.data?.msg || "Unable to send invitation.",
        "error",
      );
    }
    setInviting(false);
  };

  const removeCollaborator = async (id) => {
    if (!window.confirm("Remove this collaborator?")) return;
    try {
      await API.delete(`/repos/${repoId}/collaborators/${id}`);
      loadRepo();
      showFlash("Collaborator removed.");
    } catch {
      showFlash("Failed to remove collaborator.", "error");
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      await API.delete(`/files/${repoId}/file/${fileId}`);
      loadFiles();
      loadCommits();
      showFlash(`"${fileName}" deleted.`);
    } catch {
      showFlash("Failed to delete file.", "error");
    }
  };

  const saveReadme = async () => {
    try {
      await API.put(`/repos/${repoId}`, { readme: readmeText });
      setEditingReadme(false);
      loadRepo();
      showFlash("README updated.");
    } catch {
      showFlash("Failed to update README.", "error");
    }
  };

  const saveDescription = async () => {
    try {
      await API.put(`/repos/${repoId}`, { description: descText });
      setEditingDesc(false);
      loadRepo();
      showFlash("Description updated.");
    } catch {
      showFlash("Failed to update description.", "error");
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([loadRepo(), loadFiles(), loadCommits()]);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [repoId]);

  if (loading)
    return (
      <div style={S.page}>
        <div style={S.loading}>Loading repository...</div>
      </div>
    );

  const fileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["js", "jsx", "ts", "tsx"].includes(ext)) return "📄";
    if (["py"].includes(ext)) return "🐍";
    if (["html", "css", "scss"].includes(ext)) return "🎨";
    if (["json", "yml", "yaml"].includes(ext)) return "⚙️";
    if (["md", "txt"].includes(ext)) return "📝";
    if (["java"].includes(ext)) return "☕";
    return "📄";
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.navbar}>
        <div style={S.navLeft}>
          <img
            src={logo}
            alt="CodeAmigos"
            style={S.navLogoImg}
            onClick={() => navigate("/home")}
          />
          <span style={S.navBrand} onClick={() => navigate("/home")}>
            CodeAmigos
          </span>
        </div>
        <div style={S.navRight}>
          <button style={S.navBtn} onClick={() => navigate("/explore")}>
            Explore
          </button>
          <button style={S.navBtn} onClick={() => navigate("/home")}>
            Home
          </button>
          <button
            style={S.navBtnIcon}
            onClick={() => navigate("/notifications")}
          >
            🔔
          </button>
          <div style={S.avatarCircle} onClick={() => navigate("/profile")}>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      <div style={S.container}>
        {error && <div style={S.errorBox}>{error}</div>}
        {flash && (
          <div style={flashType === "error" ? S.errorBox : S.successBox}>
            {flash}
          </div>
        )}

        {/* Repo Header */}
        <div style={S.repoHeaderRow}>
          <div style={S.repoTitleRow}>
            <span style={S.repoIcon}>
              {repo?.visibility === "private" ? "🔒" : "📁"}
            </span>
            <span style={S.ownerName} onClick={() => navigate("/profile")}>
              {repo?.owner?.username || "user"}
            </span>
            <span style={S.slash}>/</span>
            <span style={S.repoName}>{repo?.name}</span>
            <span style={S.visibilityBadge}>{repo?.visibility}</span>
          </div>
          <div style={S.actionButtons}>
            <button style={S.headerActionBtn} onClick={toggleStar}>
              <span>{repo?.isStarred ? "★" : "☆"}</span> Star
              <span style={S.countBadge}>{repo?.starCount || 0}</span>
            </button>
            {!isOwner && (
              <button style={S.headerActionBtn} onClick={forkRepo}>
                🍴 Fork
                <span style={S.countBadge}>{repo?.forkCount || 0}</span>
              </button>
            )}
            <span style={S.viewBadge}>👁 {repo?.views || 0}</span>
          </div>
        </div>

        {repo?.forkedFrom && (
          <p style={S.forkedNotice}>
            Forked from <span style={S.link}>{repo.forkedFrom.name}</span>
          </p>
        )}

        {/* Description */}
        <div style={S.descriptionRow}>
          {editingDesc ? (
            <div style={S.editDescRow}>
              <input
                style={S.editDescInput}
                value={descText}
                onChange={(e) => setDescText(e.target.value)}
                placeholder="Description..."
              />
              <button style={S.smallBtn} onClick={saveDescription}>
                Save
              </button>
              <button
                style={S.smallBtnCancel}
                onClick={() => setEditingDesc(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p style={S.description}>
              {repo?.description || "No description provided."}
              {isOwner && (
                <button style={S.editBtn} onClick={() => setEditingDesc(true)}>
                  ✏️
                </button>
              )}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={S.tabNav}>
          {[
            { id: "code", label: "📄 Code", count: files.length },
            { id: "commits", label: "📝 Commits", count: commits.length },
            {
              id: "collab",
              label: "👥 Collaborators",
              count: collaborators.length,
            },
            ...(isOwner ? [{ id: "settings", label: "⚙️ Settings" }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                ...S.tabBtn,
                ...(activeTab === tab.id ? S.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={S.tabCount}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div style={S.tabContent}>
          {/* CODE TAB */}
          {activeTab === "code" && (
            <>
              <div style={S.codeActions}>
                <div style={S.codeActionsLeft}>
                  <span style={S.branchBadge}>
                    🌿 {repo?.defaultBranch || "main"}
                  </span>
                </div>
                <div style={S.codeActionsRight}>
                  {canEdit && (
                    <>
                      <button
                        style={S.actionBtnPrimary}
                        onClick={() => navigate(`/codespace/${repoId}`)}
                      >
                        &lt;/&gt; Open Codespace
                      </button>
                      <button
                        style={S.actionBtnSecondary}
                        onClick={() => navigate(`/repo/${repoId}/file/new`)}
                      >
                        + Add File
                      </button>
                    </>
                  )}
                </div>
              </div>

              {commits.length > 0 && (
                <div style={S.latestCommit}>
                  <div style={S.commitLeft}>
                    <span style={S.commitAvatar}>
                      {commits[0].author?.username?.[0]?.toUpperCase() || "?"}
                    </span>
                    <span style={S.commitAuthor}>
                      {commits[0].author?.username || "unknown"}
                    </span>
                    <span style={S.commitMsg}>{commits[0].message}</span>
                  </div>
                  <span style={S.commitTime}>
                    {timeAgo(commits[0].createdAt)}
                  </span>
                </div>
              )}

              <div style={S.fileTable}>
                {files.length === 0 ? (
                  <div style={S.emptyBox}>
                    <p style={S.empty}>
                      This repository is empty. Add a file to get started.
                    </p>
                  </div>
                ) : (
                  files.map((file, idx) => (
                    <div
                      key={file._id}
                      style={{
                        ...S.fileRow,
                        borderBottom:
                          idx < files.length - 1 ? "1px solid #21262d" : "none",
                      }}
                    >
                      <div
                        style={S.fileInfo}
                        onClick={() =>
                          navigate(`/repo/${repoId}/file/${file._id}`)
                        }
                      >
                        <span style={S.fileIconSpan}>
                          {fileIcon(file.name)}
                        </span>
                        <span style={S.fileName}>{file.name}</span>
                      </div>
                      <div style={S.fileMeta}>
                        {file.version > 1 && (
                          <span style={S.versionBadge}>v{file.version}</span>
                        )}
                        <span style={S.fileTime}>
                          {timeAgo(file.lastModified)}
                        </span>
                        {isOwner && (
                          <button
                            style={S.deleteFileBtn}
                            onClick={() => deleteFile(file._id, file.name)}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* README */}
              <div style={S.readmeSection}>
                <div style={S.readmeHeader}>
                  <h3 style={S.readmeTitle}>📄 README.md</h3>
                  {isOwner && !editingReadme && (
                    <button
                      style={S.editBtn}
                      onClick={() => setEditingReadme(true)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
                {editingReadme ? (
                  <div>
                    <textarea
                      style={S.readmeEditor}
                      value={readmeText}
                      onChange={(e) => setReadmeText(e.target.value)}
                      placeholder="Write your README..."
                      rows={12}
                    />
                    <div style={S.readmeActions}>
                      <button style={S.actionBtnPrimary} onClick={saveReadme}>
                        Save README
                      </button>
                      <button
                        style={S.actionBtnSecondary}
                        onClick={() => setEditingReadme(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={S.readmeContent}>
                    {repo?.readme ? (
                      <pre style={S.readmeText}>{repo.readme}</pre>
                    ) : (
                      <p style={S.empty}>
                        No README yet.{isOwner && " Click edit to add one."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* COMMITS TAB */}
          {activeTab === "commits" && (
            <div>
              <h3 style={S.sectionTitle}>📝 Commits</h3>
              {commits.length === 0 ? (
                <p style={S.empty}>No commits yet.</p>
              ) : (
                commits.map((c, i) => (
                  <div key={c._id || i} style={S.commitItem}>
                    <div style={S.commitItemLeft}>
                      <span style={S.commitAvatar}>
                        {c.author?.username?.[0]?.toUpperCase() || "?"}
                      </span>
                      <div>
                        <p style={S.commitItemMsg}>{c.message}</p>
                        <p style={S.commitItemMeta}>
                          {c.author?.username || "unknown"} committed{" "}
                          {timeAgo(c.createdAt)}
                        </p>
                        {c.files && c.files.length > 0 && (
                          <div style={S.commitFiles}>
                            {c.files.map((f, j) => (
                              <span key={j} style={S.commitFileBadge}>
                                {f.action === "added"
                                  ? "+"
                                  : f.action === "deleted"
                                    ? "-"
                                    : "~"}{" "}
                                {f.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={S.commitHash}>
                      {(c._id || "").toString().slice(-7)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* COLLABORATORS TAB */}
          {activeTab === "collab" && (
            <div>
              <h3 style={S.sectionTitle}>👥 Collaborators</h3>
              {isOwner && (
                <div style={S.inviteRow}>
                  <input
                    placeholder="Username or email..."
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    style={S.inviteInput}
                    onKeyDown={(e) => e.key === "Enter" && sendInvitation()}
                  />
                  <button
                    style={{
                      ...S.actionBtnPrimary,
                      opacity: inviting ? 0.6 : 1,
                    }}
                    onClick={sendInvitation}
                    disabled={inviting}
                  >
                    {inviting ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              )}
              {isOwner && pendingInvites.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={S.smallLabel}>Pending Invitations</p>
                  {pendingInvites.map((p) => (
                    <div key={p._id} style={S.pendingItem}>
                      <span>⏳ {p.username}</span>
                      <span style={S.pendingBadge}>Pending</span>
                    </div>
                  ))}
                </div>
              )}
              {collaborators.length === 0 ? (
                <p style={S.empty}>No collaborators yet.</p>
              ) : (
                collaborators.map((c) => (
                  <div key={c._id} style={S.collabItem}>
                    <div style={S.collabInfo}>
                      <span style={S.collabAvatar}>
                        {c.username?.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <span style={S.collabName}>{c.username}</span>
                        <span style={S.collabEmail}>{c.email}</span>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        style={S.removeBtn}
                        onClick={() => removeCollaborator(c._id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && isOwner && (
            <div>
              <h3 style={S.sectionTitle}>⚙️ Settings</h3>
              <div style={S.dangerZone}>
                <div>
                  <p style={S.dangerTitle}>Delete this repository</p>
                  <p style={S.dangerDesc}>
                    Once deleted, it cannot be recovered.
                  </p>
                </div>
                <button style={S.dangerBtn} onClick={deleteRepo}>
                  Delete Repository
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={S.footer}>
        &copy; {new Date().getFullYear()} CodeAmigos
      </footer>
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
    width: "100%",
    zIndex: 100,
    boxSizing: "border-box",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  navRight: { display: "flex", alignItems: "center", gap: 10 },
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
  navBrand: { fontSize: 18, fontWeight: 700, color: "#fff", cursor: "pointer" },
  navBtn: {
    background: "transparent",
    border: "1px solid #30363d",
    padding: "6px 14px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 13,
  },
  navBtnIcon: {
    background: "transparent",
    border: "1px solid #30363d",
    padding: "6px 10px",
    borderRadius: 6,
    color: "#e6edf3",
    cursor: "pointer",
    fontSize: 16,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#238636",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    fontSize: 15,
  },

  container: { width: "90%", maxWidth: 1012, margin: "20px auto" },
  repoHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 4,
  },
  repoTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  repoIcon: { fontSize: 20 },
  ownerName: {
    color: "#58a6ff",
    fontSize: 20,
    fontWeight: 600,
    cursor: "pointer",
  },
  slash: { color: "#8b949e", fontSize: 20 },
  repoName: { color: "#58a6ff", fontSize: 20, fontWeight: 700 },
  visibilityBadge: {
    background: "transparent",
    border: "1px solid #30363d",
    color: "#8b949e",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 12,
  },
  actionButtons: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  headerActionBtn: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "5px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  countBadge: {
    background: "#30363d",
    padding: "0 6px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 2,
  },
  viewBadge: {
    color: "#8b949e",
    fontSize: 13,
    background: "#21262d",
    padding: "5px 10px",
    borderRadius: 12,
  },
  forkedNotice: { color: "#8b949e", fontSize: 13, marginBottom: 8 },
  link: { color: "#58a6ff", cursor: "pointer" },

  descriptionRow: { marginBottom: 16 },
  description: {
    color: "#8b949e",
    fontSize: 15,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  editDescRow: { display: "flex", gap: 8, alignItems: "center" },
  editDescInput: {
    flex: 1,
    padding: "6px 12px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 14,
    outline: "none",
  },
  editBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#8b949e",
    padding: "2px 6px",
  },
  smallBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  smallBtnCancel: {
    background: "#21262d",
    border: "1px solid #30363d",
    color: "#c9d1d9",
    padding: "4px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },

  tabNav: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid #21262d",
    marginBottom: 16,
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#8b949e",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tabBtnActive: {
    color: "#e6edf3",
    borderBottom: "2px solid #f78166",
    fontWeight: 600,
  },
  tabCount: {
    background: "#30363d",
    padding: "0 7px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    color: "#c9d1d9",
  },
  tabContent: { minHeight: 300 },

  codeActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  codeActionsLeft: { display: "flex", gap: 8, alignItems: "center" },
  codeActionsRight: { display: "flex", gap: 8 },
  branchBadge: {
    background: "#1f6feb22",
    color: "#58a6ff",
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    border: "1px solid #1f6feb44",
  },
  actionBtnPrimary: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "7px 16px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  actionBtnSecondary: {
    background: "#21262d",
    border: "1px solid #30363d",
    padding: "7px 16px",
    borderRadius: 6,
    color: "#e6edf3",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },

  latestCommit: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "6px 6px 0 0",
    padding: "8px 16px",
    fontSize: 13,
  },
  commitLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  commitAvatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#30363d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
    color: "#e6edf3",
    flexShrink: 0,
  },
  commitAuthor: { fontWeight: 600, color: "#c9d1d9", flexShrink: 0 },
  commitMsg: {
    color: "#8b949e",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  commitTime: { color: "#484f58", fontSize: 12, flexShrink: 0, marginLeft: 12 },

  fileTable: {
    background: "#161b22",
    borderRadius: "0 0 8px 8px",
    border: "1px solid #30363d",
    borderTop: "none",
    overflow: "hidden",
  },
  fileRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    flex: 1,
  },
  fileIconSpan: { fontSize: 16 },
  fileName: { color: "#58a6ff", fontWeight: 500, fontSize: 14 },
  fileMeta: { display: "flex", alignItems: "center", gap: 8 },
  versionBadge: {
    background: "#21262d",
    color: "#8b949e",
    padding: "1px 6px",
    borderRadius: 6,
    fontSize: 11,
  },
  fileTime: { color: "#484f58", fontSize: 12 },
  deleteFileBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    opacity: 0.6,
  },

  readmeSection: {
    marginTop: 20,
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 8,
  },
  readmeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    borderBottom: "1px solid #21262d",
  },
  readmeTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
  readmeEditor: {
    width: "100%",
    minHeight: 200,
    padding: 16,
    background: "#0d1117",
    color: "#e6edf3",
    border: "none",
    fontSize: 14,
    fontFamily: "monospace",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  readmeActions: {
    display: "flex",
    gap: 8,
    padding: "10px 16px",
    borderTop: "1px solid #21262d",
  },
  readmeContent: { padding: 16 },
  readmeText: {
    color: "#c9d1d9",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
    margin: 0,
  },

  sectionTitle: { fontSize: 18, fontWeight: 600, margin: "0 0 16px" },
  commitItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: "12px 16px",
    marginBottom: 8,
  },
  commitItemLeft: { display: "flex", gap: 10, flex: 1 },
  commitItemMsg: {
    fontSize: 15,
    fontWeight: 600,
    margin: "0 0 4px",
    color: "#58a6ff",
  },
  commitItemMeta: { fontSize: 12, color: "#8b949e", margin: 0 },
  commitFiles: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 },
  commitFileBadge: {
    background: "#21262d",
    padding: "1px 8px",
    borderRadius: 4,
    fontSize: 11,
    color: "#8b949e",
    fontFamily: "monospace",
  },
  commitHash: {
    color: "#58a6ff",
    fontSize: 12,
    fontFamily: "monospace",
    background: "#0d1117",
    padding: "2px 8px",
    borderRadius: 6,
    border: "1px solid #21262d",
  },

  inviteRow: { display: "flex", gap: 10, marginBottom: 16 },
  inviteInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 6,
    background: "#0d1117",
    border: "1px solid #30363d",
    color: "#e6edf3",
    fontSize: 14,
    outline: "none",
  },
  smallLabel: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  },
  pendingItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#161b22",
    padding: "8px 12px",
    borderRadius: 6,
    marginBottom: 4,
    border: "1px solid #21262d",
    color: "#8b949e",
    fontSize: 14,
  },
  pendingBadge: {
    background: "#3d2c00",
    color: "#d29922",
    padding: "1px 8px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
  },
  collabItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#161b22",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 8,
    border: "1px solid #21262d",
  },
  collabInfo: { display: "flex", alignItems: "center", gap: 10 },
  collabAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#30363d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    color: "#e6edf3",
  },
  collabName: { fontWeight: 600, fontSize: 14, display: "block" },
  collabEmail: { color: "#484f58", fontSize: 12 },
  removeBtn: {
    background: "transparent",
    border: "1px solid #f85149",
    color: "#f85149",
    padding: "4px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
  },

  dangerZone: {
    background: "#161b22",
    border: "1px solid #f85149",
    borderRadius: 6,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dangerTitle: { fontWeight: 600, margin: "0 0 4px", fontSize: 14 },
  dangerDesc: { color: "#8b949e", fontSize: 13, margin: 0 },
  dangerBtn: {
    background: "#da3633",
    border: "1px solid #f85149",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  emptyBox: { background: "#161b22", padding: 24, textAlign: "center" },
  empty: { color: "#484f58", fontSize: 14, margin: 0 },
  errorBox: {
    background: "#3d1a1a",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 14,
    color: "#f85149",
    border: "1px solid #f85149",
    fontSize: 14,
  },
  successBox: {
    background: "#1b4332",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 14,
    color: "#3fb950",
    border: "1px solid #3fb950",
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#484f58",
    paddingBottom: 30,
    fontSize: 13,
  },
  loading: { color: "#8b949e", textAlign: "center", paddingTop: 80 },
};
