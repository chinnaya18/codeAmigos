import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import logodraft from "./logodraft.png";

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sections = document.querySelectorAll("section");

    const handleScroll = () => {
      const trigger = window.innerHeight / 1.2;
      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top < trigger) section.classList.add("visible");
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="bg-dark text-light position-relative"
      style={{ minHeight: "100vh", fontFamily: "Inter, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary sticky-top shadow-sm px-3">
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold d-flex align-items-center"
            href="#top"
          >
            <img
              src={logodraft}
              alt="Logo"
              width="40"
              height="40"
              className="me-2 rounded-circle"
            />
            CodeAmigos
          </a>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse justify-content-end"
            id="navMenu"
          >
            <button
              className="btn btn-outline-light me-2 mb-2 mb-lg-0"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>

            <button
              className="btn btn-outline-light me-2 mb-2 mb-lg-0"
              onClick={() => scrollToSection("explore")}
            >
              Explore
            </button>

            <button
              className="btn btn-success"
              onClick={() => navigate("/signin")}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="d-flex flex-column align-items-center justify-content-center text-center px-3"
        style={{ height: "85vh" }}
      >
        <h1 className="fw-bold display-4 mb-3">
          Collaborative Coding Made Easy
        </h1>

        <p className="lead text-secondary mb-4 col-md-7">
          Create repositories, upload files, edit code in-browser, and
          collaborate in real time — powered by MongoDB, Cloudinary &
          Codespaces.
        </p>

        <div className="d-flex gap-3 flex-wrap justify-content-center">
          <button
            className="btn btn-success btn-lg px-4"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>

          <button
            className="btn btn-outline-light btn-lg px-4"
            onClick={() => scrollToSection("features")}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Explore Section */}
      <section
        id="explore"
        className="bg-secondary bg-opacity-50 py-5 text-center"
      >
        <div className="container">
          <h2 className="fw-bold mb-3">Explore Workspaces</h2>
          <p className="text-light">
            Access repositories, preview files, collaborate with other
            developers — all online.
          </p>

          <button
            className="btn btn-outline-light mt-3"
            onClick={() => navigate("/home")}
          >
            Go to Dashboard
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-secondary bg-opacity-50 py-5 text-center"
      >
        <div className="container">
          <h2 className="fw-bold mb-4">Core Features</h2>

          <div className="row g-4">
            {[
              {
                title: "Cloudinary Storage",
                desc: "All uploaded files sync to Cloudinary automatically.",
              },
              {
                title: "MongoDB Repo Metadata",
                desc: "Handles users, repos, files, and collaboration.",
              },
              {
                title: "Built-in Codespace",
                desc: "Edit files live with syntax highlighting and autosave.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="col-md-4">
                <div className="p-3 border rounded shadow-sm bg-dark text-light">
                  <h4 className="fw-bold">{feature.title}</h4>
                  <p className="text-secondary">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section
        id="login"
        className="bg-secondary bg-opacity-50 py-5 text-center"
      >
        <div className="container">
          <h2 className="fw-bold mb-3">Join CodeAmigos</h2>
          <p className="text-light">
            Sign up and start building your developer workspace today.
          </p>

          <button
            className="btn btn-outline-light mt-3"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-center py-3 text-light">
        © {new Date().getFullYear()} CodeAmigos — Developer Collaboration
        Platform
      </footer>

      {/* Scroll Animation */}
      <style>{`
        section {
          opacity: 0;
          transform: translateY(40px);
        }
        .visible {
          opacity: 1 !important;
          transform: translateY(0px) !important;
          transition: 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
