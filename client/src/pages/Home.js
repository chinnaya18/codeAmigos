import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FaBell, FaPlus } from "react-icons/fa";
import logodraft from "./logodraft.png";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [repos, setRepos] = useState([]);
  const [popularRepos, setPopularRepos] = useState([]);
  const [events, setEvents] = useState([]);

  const headerHeight = "60px";

  // Load Repositories
  const loadRepos = async () => {
    try {
      const resp = await API.get("/repos/myrepos");
      setRepos(resp.data.repos || resp.data);

      const popular = await API.get("/repos/popular/all");
      setPopularRepos(popular.data.repos || popular.data);
    } catch (err) {
      console.error("Failed to load repos:", err);
    }
  };

  // Load Events
  const loadEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data.events);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadRepos();
      loadEvents();
    }
  }, [location.key]);

  return (
    <div
      className="bg-dark text-light"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ---------------- TOP NAVBAR ---------------- */}
      <nav
        className="navbar navbar-dark bg-dark border-bottom border-secondary px-4 shadow-sm"
        style={{ height: headerHeight }}
      >
        {/* Left Group */}
        <div className="d-flex align-items-center gap-3">
          <img
            src={logodraft}
            width="36"
            height="36"
            className="rounded-circle shadow"
            alt="logo"
          />

          <input
            type="text"
            placeholder="Search repositories..."
            className="form-control form-control-sm bg-secondary text-light border-0 px-3"
            style={{ width: "260px", borderRadius: "20px" }}
          />
        </div>

        {/* Right Group */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-2 px-3 shadow"
            style={{ borderRadius: "20px" }}
            onClick={() => navigate("/newrepo")}
          >
            <FaPlus /> New
          </button>

          <button
            className="btn btn-outline-light btn-sm rounded-circle p-2 shadow-sm"
            onClick={() => navigate("/notifications")}
          >
            <FaBell />
          </button>

          <img
            src={logodraft}
            width="36"
            height="36"
            className="rounded-circle border border-secondary shadow"
            alt="profile"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          />
        </div>
      </nav>

      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <div
        className="position-fixed bg-dark text-light border-end border-secondary"
        style={{
          top: headerHeight,
          left: 0,
          width: "300px",
          height: `calc(100vh - ${headerHeight})`,
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h5 className="pb-2 border-bottom border-secondary fw-bold">
          Your Repositories
        </h5>

        {repos.length === 0 ? (
          <p className="text-secondary mt-3">No repositories yet.</p>
        ) : (
          repos.map((repo) => (
            <div
              key={repo._id}
              className="py-2 px-3 border-bottom border-secondary repo-item"
              style={{
                cursor: "pointer",
                transition: "0.2s",
                borderRadius: "6px",
              }}
              onClick={() => navigate(`/repo/${repo._id}`)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#2d2d2d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {repo.name}
            </div>
          ))
        )}
      </div>

      {/* ---------------- RIGHT SIDEBAR ---------------- */}
      <div
        className="position-fixed bg-dark text-light border-start border-secondary"
        style={{
          top: headerHeight,
          right: 0,
          width: "300px",
          height: `calc(100vh - ${headerHeight})`,
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h5 className="pb-2 border-bottom border-secondary fw-bold">
          Popular Repos
        </h5>

        {popularRepos.length === 0 ? (
          <p className="text-secondary mt-3">No popular repositories.</p>
        ) : (
          popularRepos.map((repo) => (
            <div
              key={repo._id}
              className="py-3 px-3 mb-2 bg-secondary bg-opacity-25 border border-secondary rounded shadow-sm"
              style={{ cursor: "pointer", transition: "0.2s" }}
              onClick={() => navigate(`/repo/${repo._id}`)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#3a3a3a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2d2d2d")
              }
            >
              <strong className="fw-bold">{repo.name}</strong>
              <div className="text-secondary small">{repo.views} views</div>
            </div>
          ))
        )}
      </div>

      {/* ---------------- CENTER CONTENT ---------------- */}
      <div
        className="bg-secondary text-light"
        style={{
          marginLeft: "310px",
          marginRight: "310px",
          marginTop: headerHeight,
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        <h2 className="fw-bold">Welcome to CodeAmigos</h2>
        <p className="text-light opacity-75">
          Your collaborative coding dashboard.
        </p>

        {/* EVENTS */}
        <h3 className="mt-4 fw-bold">Upcoming Events</h3>

        {events.length === 0 ? (
          <p className="text-light mt-3">No events posted yet.</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev._id}
              className="p-4 mt-3 bg-dark rounded border border-secondary shadow"
            >
              <h5 className="fw-bold">{ev.title}</h5>
              <p>{ev.description}</p>
              <small className="text-secondary">{ev.date}</small>
            </div>
          ))
        )}
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer
        className="bg-dark text-center text-secondary py-3 border-top border-secondary"
        style={{ marginLeft: "300px", marginRight: "300px" }}
      >
        <p className="mb-0" style={{ fontSize: "0.9rem" }}>
          © {new Date().getFullYear()} <strong>CodeAmigos</strong> — Built for
          developers ❤️
        </p>
      </footer>
    </div>
  );
}
