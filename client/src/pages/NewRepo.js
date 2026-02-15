// client/src/pages/NewRepo.js
import React, { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "./logodraft.png";

export default function NewRepo() {
  const [form, setForm] = useState({
    name: "",
    visibility: "public",
    description: "",
    readme: "",
  });
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [addReadme, setAddReadme] = useState(false);

  const createRepo = async (e) => {
    e.preventDefault();
    if (creating) return;
    setErr("");
    setCreating(true);
    try {
      const payload = { ...form };
      if (addReadme && !payload.readme) {
        payload.readme = `# ${form.name}\n\nA new CodeAmigos repository.`;
      }
      const res = await API.post("/repos/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newId = res.data.repo?._id || res.data._id;
      navigate(newId ? `/repo/${newId}` : "/home");
    } catch (error) {
      setErr(error.response?.data?.msg || "Error creating repository.");
      setCreating(false);
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
        <button style={S.navBtn} onClick={() => navigate("/home")}>
          ← Home
        </button>
      </nav>

      <div style={S.container}>
        <h2 style={S.title}>Create a new repository</h2>
        <p style={S.subtitle}>
          A repository contains all project files, including the revision
          history.
        </p>

        {err && <div style={S.errorBox}>{err}</div>}

        <form onSubmit={createRepo} style={S.form}>
          <div style={S.row}>
            <div style={S.ownerBox}>
              <label style={S.label}>Owner</label>
              <div style={S.ownerDisplay}>{user?.username}</div>
            </div>
            <span style={S.slashSep}>/</span>
            <div style={S.nameBox}>
              <label style={S.label}>Repository name *</label>
              <input
                style={S.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="my-awesome-project"
                required
              />
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Description (optional)</label>
            <input
              style={S.input}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description of your repository"
            />
          </div>

          <div style={S.visSection}>
            <label style={S.label}>Visibility</label>
            <div style={S.visOptions}>
              <label
                style={{
                  ...S.visOption,
                  ...(form.visibility === "public" ? S.visActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={form.visibility === "public"}
                  onChange={() => setForm({ ...form, visibility: "public" })}
                  style={{ display: "none" }}
                />
                <span style={S.visIcon}>📁</span>
                <div>
                  <span style={S.visLabel}>Public</span>
                  <span style={S.visDesc}>Anyone can see this repository.</span>
                </div>
              </label>
              <label
                style={{
                  ...S.visOption,
                  ...(form.visibility === "private" ? S.visActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={form.visibility === "private"}
                  onChange={() => setForm({ ...form, visibility: "private" })}
                  style={{ display: "none" }}
                />
                <span style={S.visIcon}>🔒</span>
                <div>
                  <span style={S.visLabel}>Private</span>
                  <span style={S.visDesc}>
                    Only you and collaborators can see this.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div style={S.initSection}>
            <label style={S.label}>Initialize this repository with:</label>
            <label style={S.checkbox}>
              <input
                type="checkbox"
                checked={addReadme}
                onChange={() => setAddReadme(!addReadme)}
              />
              <span style={S.checkLabel}>Add a README file</span>
            </label>
          </div>

          <div style={S.actions}>
            <button
              style={S.cancelBtn}
              type="button"
              onClick={() => navigate("/home")}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...S.createBtn, opacity: creating ? 0.6 : 1 }}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create repository"}
            </button>
          </div>
        </form>
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

  container: { maxWidth: 640, margin: "0 auto", padding: "30px 20px" },
  title: { fontSize: 24, fontWeight: 600, margin: "0 0 4px" },
  subtitle: {
    color: "#8b949e",
    fontSize: 14,
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  errorBox: {
    background: "#3d1a1a",
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 14,
    color: "#f85149",
    border: "1px solid #f85149",
    fontSize: 14,
  },

  form: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: 24,
  },

  row: { display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 },
  ownerBox: { flex: 0 },
  nameBox: { flex: 1 },
  slashSep: { fontSize: 24, color: "#484f58", paddingBottom: 6 },
  ownerDisplay: {
    background: "#21262d",
    padding: "8px 12px",
    borderRadius: 6,
    color: "#c9d1d9",
    fontSize: 14,
    border: "1px solid #30363d",
    whiteSpace: "nowrap",
  },

  field: { marginBottom: 16 },
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

  visSection: { marginBottom: 16 },
  visOptions: { display: "flex", flexDirection: "column", gap: 8 },
  visOption: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 6,
    border: "1px solid #21262d",
    cursor: "pointer",
  },
  visActive: { border: "1px solid #58a6ff", background: "#0d1117" },
  visIcon: { fontSize: 20 },
  visLabel: { fontWeight: 600, fontSize: 14, display: "block" },
  visDesc: { color: "#8b949e", fontSize: 12 },

  initSection: {
    marginBottom: 20,
    padding: "12px 0",
    borderTop: "1px solid #21262d",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    marginTop: 8,
  },
  checkLabel: { fontSize: 14, color: "#c9d1d9" },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 16,
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
  createBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "8px 20px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};
