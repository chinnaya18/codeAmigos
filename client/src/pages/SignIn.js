import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "./logodraft.png";

export default function SignIn() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await API.post("/auth/signin", form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin" : "/home");
    } catch (e) {
      setErr(e.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Top bar */}
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

      {/* Center card */}
      <div style={S.center}>
        <div style={S.card}>
          <h1 style={S.title}>Sign in to CodeAmigos</h1>

          {err && <div style={S.error}>{err}</div>}

          <form onSubmit={submit}>
            <label style={S.label}>Username or email address</label>
            <input
              style={S.input}
              value={form.emailOrUsername}
              onChange={(e) =>
                setForm({ ...form, emailOrUsername: e.target.value })
              }
              required
              autoComplete="username"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <label style={S.label}>Password</label>
              <Link to="/forgot-password" style={S.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              style={S.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            <button type="submit" disabled={loading} style={S.btn}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <div style={S.bottomCard}>
          New to CodeAmigos?{" "}
          <Link to="/signup" style={S.link}>
            Create an account
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
  topBar: {
    padding: "24px 0",
    textAlign: "center",
  },
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
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#f0f6fc",
  },
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
  forgotLink: {
    fontSize: 12,
    color: "#58a6ff",
    textDecoration: "none",
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
  link: {
    color: "#58a6ff",
    textDecoration: "none",
  },
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
  footer: {
    padding: "24px 0",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    gap: 16,
    fontSize: 12,
  },
  footLink: {
    color: "#58a6ff",
    textDecoration: "none",
  },
};
