import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import logo from "./logodraft.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (form.password !== form.confirmPassword)
      return setErr("Passwords do not match.");
    if (form.password.length < 6)
      return setErr("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", {
        emailOrUsername: form.emailOrUsername,
        password: form.password,
      });
      setMsg(res.data.msg);
      setTimeout(() => navigate("/signin"), 1500);
    } catch (e) {
      setErr(e.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <Link to="/" style={S.logoLink}>
          <img
            src={logo}
            alt="CodeAmigos"
            style={{
              height: 32,
              width: 32,
              borderRadius: 6,
              objectFit: "contain",
            }}
          />
          <span style={{ marginLeft: 8, fontWeight: 600, fontSize: 20 }}>
            CodeAmigos
          </span>
        </Link>
      </header>

      <div style={S.center}>
        <div style={S.card}>
          <h1 style={S.title}>Reset your password</h1>

          {err && <div style={S.error}>{err}</div>}
          {msg && <div style={S.success}>{msg}</div>}

          <form onSubmit={submit}>
            <label style={S.label}>Username or email address</label>
            <input
              style={S.input}
              value={form.emailOrUsername}
              onChange={(e) =>
                setForm({ ...form, emailOrUsername: e.target.value })
              }
              required
            />

            <label style={{ ...S.label, marginTop: 16, display: "block" }}>
              New password
            </label>
            <input
              type="password"
              style={S.input}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <label style={{ ...S.label, marginTop: 16, display: "block" }}>
              Confirm new password
            </label>
            <input
              type="password"
              style={S.input}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />

            <button type="submit" disabled={loading} style={S.btn}>
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>

        <div style={S.bottomCard}>
          Remembered your password?{" "}
          <Link to="/signin" style={S.link}>
            Sign in
          </Link>
          .
        </div>
      </div>

      <footer style={S.footer}>
        <Link to="/" style={S.footLink}>
          Terms
        </Link>
        <Link to="/" style={S.footLink}>
          Privacy
        </Link>
        <span style={{ color: "#8b949e" }}>
          © {new Date().getFullYear()} CodeAmigos
        </span>
      </footer>
    </div>
  );
}

const S = {
  page: {
    background: "#0d1117",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    color: "#f0f6fc",
  },
  topBar: { padding: "24px 0", textAlign: "center" },
  logoLink: {
    color: "#fff",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
  },
  card: {
    width: "100%",
    maxWidth: 308,
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: "20px",
  },
  title: {
    fontSize: 24,
    fontWeight: 300,
    textAlign: "center",
    marginBottom: 20,
    color: "#f0f6fc",
  },
  label: { fontSize: 14, fontWeight: 600, color: "#f0f6fc" },
  input: {
    width: "100%",
    padding: "5px 12px",
    fontSize: 14,
    lineHeight: "20px",
    color: "#f0f6fc",
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 6,
    marginTop: 4,
    outline: "none",
    boxSizing: "border-box",
    height: 32,
  },
  btn: {
    width: "100%",
    marginTop: 20,
    padding: "5px 16px",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    color: "#fff",
    background: "#238636",
    border: "1px solid rgba(240,246,252,0.1)",
    borderRadius: 6,
    cursor: "pointer",
    height: 32,
  },
  bottomCard: {
    width: "100%",
    maxWidth: 308,
    marginTop: 16,
    padding: "16px 20px",
    fontSize: 14,
    textAlign: "center",
    border: "1px solid #30363d",
    borderRadius: 6,
    color: "#f0f6fc",
  },
  link: { color: "#58a6ff", textDecoration: "none" },
  error: {
    background: "rgba(248,81,73,0.1)",
    border: "1px solid #f85149",
    color: "#f85149",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  success: {
    background: "rgba(46,160,67,0.15)",
    border: "1px solid #2ea043",
    color: "#3fb950",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  footer: {
    padding: "24px 0",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    gap: 16,
    fontSize: 12,
  },
  footLink: { color: "#58a6ff", textDecoration: "none" },
};
