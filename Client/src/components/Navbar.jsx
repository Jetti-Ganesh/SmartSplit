import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import ThemeToggle from "./ThemeToggle";
import "../styles/Navbar.css";

const APP_ROUTES = [
  "/Dashboard",
  "/Profile",
  "/Groups",
  "/Activity",
  "/SettleUp",
];

const Navbar = ({ isDark, toggleTheme, forceShow }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Hide navbar on app shell routes (sidebar/bottom nav takes over there)
  if (!forceShow && APP_ROUTES.includes(location.pathname)) return null;

  const handleNavClick = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* ── Logo ── */}
        <div
          className="nav-logo"
          onClick={() => handleNavClick("/")}
          style={{ cursor: "pointer" }}
        >
          <span className="logo-icon">⚡</span>
          <span className="logo-text">SplitSmart</span>
        </div>

        {/* ── Nav Links ── */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {isLoggedIn ? (
          <>
               <li>
                <a href="#features" onClick={() => handleNavClick("/Dashboard")}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={() => handleNavClick("/Groups")}>
                 Groups
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={() => handleNavClick("/SettleUp")}>
                  Settle Up
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={() => handleNavClick("/Activity")}>
                  Activity
                </a>
              </li>

              <li>
                <a
                  onClick={() => handleNavClick("/Profile")}
                  style={{ cursor: "pointer" }}
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleNavClick("/settings")}
                  style={{ cursor: "pointer" }}
                >
                  settings
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
           ""
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
  );
};

export default Navbar;
