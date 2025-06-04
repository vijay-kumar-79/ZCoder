import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem("jwtoken");
    if (!jwtoken) {
      navigate("/login");
    }
  }, [navigate]);

  // Helper function to handle navigation
  const handleFeatureClick = (route) => {
    navigate(route);
  };

  return (
    <div className="home-page">
      <main className="main">
        <section className="hero">
          <h1>Welcome to Zcoder</h1>
          <p>Practice coding, join chat rooms, track contests, and get AI help—all in one place!</p>
          <button className="cta-btn" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </section>

        <section className="features">
          <div
            className="feature"
            onClick={() => handleFeatureClick("/profile")}
          >
            <h3>Profile</h3>
            <p>Manage your personal information, track your progress, and customize your Zcoder experience.</p>
          </div>

          <div
            className="feature"
            onClick={() => handleFeatureClick("/rooms")}
          >
            <h3>Chat Rooms</h3>
            <p>Collaborate and discuss with other coders.</p>
          </div>
          <div
            className="feature"
            onClick={() => handleFeatureClick("/calendar")}
          >
            <h3>Contest Calendar</h3>
            <p>Never miss an upcoming coding contest.</p>
          </div>
          <div
            className="feature"
            onClick={() => handleFeatureClick("/askAI")}
          >
            <h3>Ask AI</h3>
            <p>Get instant help from our AI assistant.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Zcoder. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
