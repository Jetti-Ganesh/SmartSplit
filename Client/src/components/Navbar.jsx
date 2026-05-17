import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../services/authSlice";
import ThemeToggle from "./ThemeToggle";
import SettingsDrawer from "./SettingsDrawer";
import "../styles/Navbar.css";

// Navbar shows on all routes now

const Navbar = ({ isDark, toggleTheme, forceShow }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Scrolled glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Navbar always displays on all routes

  const handleNavClick = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* ── Logo ── */}
          <div
            className="nav-logo"
            onClick={() => handleNavClick("/")}
            style={{ cursor: "pointer" }}
          >
            <span className="logo-icon">💸</span>
            <span className="logo-text">SmartSplit</span>
          </div>

          {/* ── Nav Links ── */}
          <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
            {isLoggedIn ? (
            <>
                 <li>
                  <a 
                    className={location.pathname === "/Dashboard" ? "active" : ""}
                    onClick={() => handleNavClick("/Dashboard")}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a 
                    className={location.pathname === "/Groups" ? "active" : ""}
                    onClick={() => handleNavClick("/Groups")}
                  >
                   Groups
                  </a>
                </li>
                <li>
                  <a 
                    className={location.pathname === "/SettleUp" ? "active" : ""}
                    onClick={() => handleNavClick("/SettleUp")}
                  >
                    Settle Up
                  </a>
                </li>
                <li>
                  <a 
                    className={location.pathname === "/Activity" ? "active" : ""}
                    onClick={() => handleNavClick("/Activity")}
                  >
                    Activity
                  </a>
                </li>

               </>
            ) : (
              <>
                <li>
                  <a href="#features" onClick={() => setMenuOpen(false)}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#testimonials" onClick={() => setMenuOpen(false)}>
                    Testimonials
                  </a>
                </li>

                <li>
                  <a
                    onClick={() => handleNavClick("/signUp")}
                    style={{ cursor: "pointer" }}
                  >
                    Sign Up
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleNavClick("/Login")}
                    style={{ cursor: "pointer" }}
                  >
                    Login
                  </a>
                </li>
              </>
            )}

            {/* Mobile-only extras */}
            <li className="mobile-only mobile-theme-row">
              <span className="mobile-theme-label">Theme</span>
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </li>
            {!isLoggedIn && (
              <li className="mobile-only mobile-menu-cta">
                <a
                  className="nav-cta"
                  onClick={() => handleNavClick("/signUp")}
                  style={{ cursor: "pointer" }}
                >
                  Get Started
                </a>
              </li>
            )}
          </ul>

          {/* ── Right Side (desktop) ── */}
          <div className="nav-right">
            {isLoggedIn ? (
              <>
                <button 
                  className="settings-icon-btn" 
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
                <button 
                  className={`profile-icon-btn ${location.pathname === "/Profile" ? "active" : ""}`} 
                  onClick={() => handleNavClick("/Profile")}
                  aria-label="Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              </>
            ) : (
              <a
                className="nav-cta"
                onClick={() => handleNavClick("/signUp")}
                style={{ cursor: "pointer" }}
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </nav>

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    </>
  );
};

export default Navbar;
