import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import Logo from '../assets/logo-noBg.png';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Auth pages have their own focused layout - no global nav needed there
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleHamburgerClick = () => {
    setMenuOpen((prev) => !prev);
  };

  // Close the mobile menu after clicking a link
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <nav>
        <img
          src={Logo}
          alt="Logo"
          className="nav-logo"
          onClick={() => navigate("/")}
        />
        <button
          className={`hamburger${menuOpen ? " active" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={handleHamburgerClick}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-links${menuOpen ? " show" : ""}`}>
          <li><NavLink to="/" onClick={handleLinkClick} end>Home</NavLink></li>
          <li><NavLink to="/dashboard" onClick={handleLinkClick}>Dashboard</NavLink></li>
          <li><NavLink to="/rooms" onClick={handleLinkClick}>Rooms</NavLink></li>
          <li><NavLink to="/calendar" onClick={handleLinkClick}>Calendar</NavLink></li>
          <li><NavLink to="/askAi" onClick={handleLinkClick}>Ask AI</NavLink></li>
          <li><NavLink to="/bookmarks" onClick={handleLinkClick}>Bookmarks</NavLink></li>
          <li><NavLink to="/profile" onClick={handleLinkClick}>Profile</NavLink></li>
          <li className="logout-btn">
            <button
              type="button"
              className="logout-link"
              onClick={() => { handleLogout(); handleLinkClick(); }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;