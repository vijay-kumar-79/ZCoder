import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuGithub,
  LuSearch,
  LuUser,
  LuMessagesSquare,
  LuCalendarDays,
  LuSparkles,
  LuChartColumnIncreasing,
} from "react-icons/lu";
import "../styles/Home.css";
import logo from "../assets/logo-noBg.png";

function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const jwtoken = localStorage.getItem("jwtoken");
    if (!jwtoken) {
      navigate("/login");
    }
  }, [navigate]);

  const backend = process.env.REACT_APP_BACKEND_URL;

  // Debounced search: only fires 800ms after the user stops typing
  useEffect(() => {
    if (searchQuery.trim().length <= 2) {
      setUsers([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${backend}/users/${encodeURIComponent(searchQuery.trim())}`
        );
        if (!response.ok) {
          setUsers([]);
          return;
        }
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 800);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, backend]);

  const searched = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFeatureClick = (route) => {
    navigate(route);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <span className="hero-eyebrow">ZCoder</span>
            <h1>
              <span className="hero-accent">Elevate</span> Your Coding Journey
            </h1>
            <p className="hero-subtitle">
              Practice, collaborate, compete and learn, all in one platform
              built for developers.
            </p>
            <div className="hero-cta">
              <button
                className="cta-btn primary"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </button>
              <button
                className="cta-btn secondary"
                onClick={() => navigate("/rooms")}
              >
                Join a Room
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="code-window">
              <div className="code-window-bar">
                <span className="window-dot"></span>
                <span className="window-dot"></span>
                <span className="window-dot"></span>
                <span className="window-title">welcome.js</span>
              </div>
              <pre>
                <code>
                  <span className="tok-comment">{"// Welcome to Zcoder"}</span>
                  {"\n"}
                  <span className="tok-keyword">{"function"}</span>{" "}
                  <span className="tok-fn">{"greet"}</span>
                  {"() {"}
                  {"\n  "}
                  <span className="tok-keyword">{"console"}</span>
                  {"."}
                  <span className="tok-fn">{"log"}</span>
                  {"("}
                  <span className="tok-string">{"\"Happy coding!\""}</span>
                  {");"}
                  {"\n}"}
                  {"\n\n"}
                  <span className="tok-fn">{"greet"}</span>
                  {"();"}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <h2 className="section-title">Everything you need to level up</h2>
          <div className="features-grid">
            <div className="feature-card search-feature feature-wide">
              <div className="feature-icon">
                <LuSearch />
              </div>
              <h3>Find Coders</h3>
              <input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={searched}
                className="user-search"
              />
              {users.length > 0 ? (
                <ul className="search-results">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => navigate(`/user/${user.id}`)}
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
              ) : searchQuery.length > 2 ? (
                <p className="no-results">No users found</p>
              ) : (
                <p className="feature-hint">
                  Search the community and explore other profiles.
                </p>
              )}
            </div>

            <div
              className="feature-card"
              onClick={() => handleFeatureClick("/profile")}
            >
              <div className="feature-icon">
                <LuUser />
              </div>
              <h3>Personal Profile</h3>
              <p>Track your progress and showcase your coding achievements.</p>
            </div>

            <div
              className="feature-card"
              onClick={() => handleFeatureClick("/rooms")}
            >
              <div className="feature-icon">
                <LuMessagesSquare />
              </div>
              <h3>Collaborative Rooms</h3>
              <p>Real-time coding and chat with other developers.</p>
            </div>

            <div
              className="feature-card"
              onClick={() => handleFeatureClick("/calendar")}
            >
              <div className="feature-icon">
                <LuCalendarDays />
              </div>
              <h3>Contest Calendar</h3>
              <p>Never miss important coding competitions and hackathons.</p>
            </div>

            <div
              className="feature-card"
              onClick={() => handleFeatureClick("/askAI")}
            >
              <div className="feature-icon">
                <LuSparkles />
              </div>
              <h3>AI Assistant</h3>
              <p>Get instant help with your coding questions.</p>
            </div>

            <div
              className="feature-card"
              onClick={() => handleFeatureClick("/dashboard")}
            >
              <div className="feature-icon">
                <LuChartColumnIncreasing />
              </div>
              <h3>Progress Dashboard</h3>
              <p>Visualize your coding journey and growth.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-item">
            <h3>600+</h3>
            <p>Practice Problems</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Active Rooms</p>
          </div>
          <div className="stat-item">
            <h3>Live</h3>
            <p>Contest Calendar</p>
          </div>
          <div className="stat-item">
            <h3>Instant</h3>
            <p>AI Responses</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="ZCoder logo" />
          </div>
          <button
            className="social-icon"
            aria-label="View ZCoder on GitHub"
            onClick={() => {
              window.open("https://github.com/vijay-kumar-79/ZCoder", "_blank", "noopener,noreferrer");
            }}
          >
            <LuGithub />
          </button>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2025 Zcoder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;