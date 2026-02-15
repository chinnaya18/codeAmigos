// client/src/pages/Welcome.js
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logodraft.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={S.page}>
      <nav style={S.navbar}>
        <div style={S.navLeft}>
          <img src={logo} alt="CodeAmigos" style={S.navLogoImg} />
          <span style={S.navBrand}>CodeAmigos</span>
        </div>
        <div style={S.navRight}>
          <button style={S.signInBtn} onClick={() => navigate("/signin")}>
            Sign In
          </button>
          <button style={S.signUpBtn} onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroContent}>
          <h1 style={S.heroTitle}>
            Code together,
            <br />
            <span style={S.heroHighlight}>build together.</span>
          </h1>
          <p style={S.heroDesc}>
            CodeAmigos is a collaborative coding platform where developers can
            create repositories, share code, and work together in real-time.
            Think GitHub, but made for amigos.
          </p>
          <div style={S.heroBtns}>
            <button style={S.heroPrimary} onClick={() => navigate("/signup")}>
              Get Started — it's free
            </button>
            <button style={S.heroSecondary} onClick={() => navigate("/signin")}>
              Sign In →
            </button>
          </div>
        </div>
        <div style={S.heroVisual}>
          <div style={S.codeBlock}>
            <div style={S.codeHeader}>
              <span style={S.codeDot} />
              <span style={{ ...S.codeDot, background: "#f1e05a" }} />
              <span style={{ ...S.codeDot, background: "#3fb950" }} />
              <span style={S.codeTitle}>app.js</span>
            </div>
            <pre style={S.codeContent}>
              {`const express = require("express");
const app = express();

// 🚀 Start building with CodeAmigos
app.get("/", (req, res) => {
  res.json({ message: "Hello, Amigo!" });
});

app.listen(3000, () => {
  console.log("Let's code together! 🎉");
});`}
            </pre>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={S.features}>
        <h2 style={S.featuresTitle}>Everything you need to code</h2>
        <div style={S.featureGrid}>
          {[
            {
              icon: "📁",
              title: "Repositories",
              desc: "Create public or private repos to organize your code.",
            },
            {
              icon: "👥",
              title: "Collaboration",
              desc: "Invite collaborators and work on projects together.",
            },
            {
              icon: "⚡",
              title: "Real-time Editing",
              desc: "Edit code simultaneously with live sync via WebSocket.",
            },
            {
              icon: "📝",
              title: "Commit History",
              desc: "Track every change with detailed commit messages.",
            },
            {
              icon: "⭐",
              title: "Stars & Forks",
              desc: "Star your favorite repos and fork them to build upon.",
            },
            {
              icon: "💻",
              title: "Codespace",
              desc: "VS Code-like editor in the browser with syntax highlighting.",
            },
          ].map((f, i) => (
            <div key={i} style={S.featureCard}>
              <span style={S.featureIcon}>{f.icon}</span>
              <h3 style={S.featureCardTitle}>{f.title}</h3>
              <p style={S.featureCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={S.cta}>
        <h2 style={S.ctaTitle}>Ready to start coding?</h2>
        <p style={S.ctaDesc}>
          Join CodeAmigos and start building projects with your friends.
        </p>
        <button style={S.ctaBtn} onClick={() => navigate("/signup")}>
          Create your free account
        </button>
      </div>

      <footer style={S.footer}>
        &copy; {new Date().getFullYear()} CodeAmigos. Built with ❤️ for
        developers.
      </footer>
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
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    borderBottom: "1px solid #21262d",
  },
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navRight: { display: "flex", gap: 10 },
  navLogo: { fontSize: 28, fontWeight: 900, color: "#58a6ff" },
  navLogoImg: { height: 36, width: 36, borderRadius: 6, objectFit: "contain" },
  navBrand: { fontSize: 22, fontWeight: 700, color: "#fff" },
  signInBtn: {
    background: "transparent",
    border: "1px solid #30363d",
    padding: "8px 18px",
    borderRadius: 6,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  signUpBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "8px 18px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },

  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 60,
    padding: "80px 40px",
    maxWidth: 1200,
    margin: "0 auto",
    flexWrap: "wrap",
  },
  heroContent: { flex: 1, minWidth: 320 },
  heroTitle: {
    fontSize: 52,
    fontWeight: 800,
    lineHeight: 1.1,
    margin: "0 0 20px",
  },
  heroHighlight: { color: "#58a6ff" },
  heroDesc: {
    fontSize: 18,
    color: "#8b949e",
    lineHeight: 1.6,
    margin: "0 0 30px",
    maxWidth: 500,
  },
  heroBtns: { display: "flex", gap: 14 },
  heroPrimary: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "14px 28px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
  },
  heroSecondary: {
    background: "transparent",
    border: "1px solid #30363d",
    padding: "14px 28px",
    borderRadius: 8,
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 500,
  },

  heroVisual: { flex: 1, minWidth: 340, maxWidth: 500 },
  codeBlock: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 10,
    overflow: "hidden",
  },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 14px",
    borderBottom: "1px solid #21262d",
  },
  codeDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#f85149",
  },
  codeTitle: { marginLeft: 8, color: "#8b949e", fontSize: 13 },
  codeContent: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#c9d1d9",
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "'Cascadia Code','Fira Code',Consolas,monospace",
    overflow: "auto",
  },

  features: { padding: "60px 40px", maxWidth: 1200, margin: "0 auto" },
  featuresTitle: {
    fontSize: 32,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 40,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300, 1fr))",
    gap: 20,
  },
  featureCard: {
    background: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 8,
    padding: "24px 20px",
  },
  featureIcon: { fontSize: 28 },
  featureCardTitle: { fontSize: 18, fontWeight: 600, margin: "12px 0 8px" },
  featureCardDesc: {
    color: "#8b949e",
    fontSize: 14,
    lineHeight: 1.5,
    margin: 0,
  },

  cta: {
    textAlign: "center",
    padding: "60px 40px",
    background: "#161b22",
    borderTop: "1px solid #21262d",
  },
  ctaTitle: { fontSize: 32, fontWeight: 700, margin: "0 0 10px" },
  ctaDesc: { color: "#8b949e", fontSize: 16, margin: "0 0 24px" },
  ctaBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    padding: "14px 32px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
  },

  footer: {
    padding: "30px 40px",
    textAlign: "center",
    color: "#484f58",
    fontSize: 13,
  },
};
