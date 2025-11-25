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
      style={{ minHeight: "100vh" }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary sticky-top shadow-sm z-3">
        <div className="container">
          <a
            className="navbar-brand fw-bold d-flex align-items-center"
            href="/"
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

          <div>
            <button
              className="btn btn-outline-light me-2"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>

            <button
              className="btn btn-outline-light me-2"
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
      <section className="hero d-flex flex-column align-items-center justify-content-center text-center vh-100 z-1">
        <h1 className="fw-bold display-4 mb-3">
          Collaborative Coding Made Easy
        </h1>

        <p className="lead text-secondary mb-4">
          Create repositories, upload your files to Cloudinary, edit code
          straight from your browser, and collaborate in real time — all powered
          by MongoDB + Cloudinary.
        </p>

        <div className="d-flex gap-3">
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
            Navigate repositories, preview code files, and open a full Codespace
            powered by Cloudinary for file storage and MongoDB for metadata.
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
          <h2 className="fw-bold mb-3">Core Features</h2>

          <div className="row mt-4">
            <div className="col-md-4">
              <h4 className="fw-bold">Cloudinary File Storage</h4>
              <p className="text-light">
                All code files uploaded are stored securely in Cloudinary and
                fetched dynamically when viewed or edited.
              </p>
            </div>

            <div className="col-md-4">
              <h4 className="fw-bold">MongoDB Repo Metadata</h4>
              <p className="text-light">
                Repository structure, file references, collaborators, and logs
                are all managed using MongoDB.
              </p>
            </div>

            <div className="col-md-4">
              <h4 className="fw-bold">Built-in Codespace Editor</h4>
              <p className="text-light">
                Edit files directly within your Codespace. Changes sync back to
                Cloudinary instantly on save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section
        id="login"
        className="bg-secondary bg-opacity-50 py-5 text-center"
      >
        <div className="container">
          <h2 className="fw-bold mb-3">Join CodeAmigos</h2>
          <p className="text-light">
            Sign up to unlock full workspace controls, collaboration tools, and
            repository access.
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
      <footer className="bg-secondary text-center py-3 text-light z-3">
        © 2025 CodeAmigos — Developer Collaboration Platform
      </footer>

      {/* Reveal Animation */}
      <style>{`
        section {
          opacity: 0;
          transform: translateY(40px);
        }
        section.visible {
          opacity: 1 !important;
          transform: translateY(0px) !important;
          transition: 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
