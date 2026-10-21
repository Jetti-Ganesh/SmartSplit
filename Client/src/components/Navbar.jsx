import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../services/authSlice";
import ThemeToggle from "./ThemeToggle";
import SettingsDrawer from "./SettingsDrawer";
import "../styles/Navbar.css";

const Navbar = ({ isDark, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { isLoggedIn, user: authUser } = useSelector((state) => state.auth);
  const { user: profileUser } = useSelector((state) => state.profile);
  const currentUser = profileUser || authUser;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for enhanced glass shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLandingScroll = (elementId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${elementId}`);
      return;
    }
    const elem = document.getElementById(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    dispatch(logout());
    navigate("/Login");
  };

  const getInitial = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const isActive = (path) => location.pathname.toLowerCase() === path.toLowerCase();

  return (
    <>
      <header className={`smart-navbar ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav-container">
          {/* ── Brand Logo ── */}
          <div
            className="nav-brand"
            onClick={() => handleNavClick(isLoggedIn ? "/Dashboard" : "/")}
            role="button"
            tabIndex={0}
          >
            <div className="brand-icon-wrapper">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="brand-name">
              Smart<span className="brand-highlight">Split</span>
            </span>
          </div>

          {/* ── Center Navigation (Desktop) ── */}
          <nav className="nav-menu-desktop" aria-label="Main Navigation">
            {isLoggedIn ? (
              // Authenticated App Navigation
              <div className="nav-pill-group">
                <button
                  type="button"
                  className={`nav-pill-item ${isActive("/Dashboard") ? "active" : ""}`}
                  onClick={() => handleNavClick("/Dashboard")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                  <span>Dashboard</span>
                </button>

                <button
                  type="button"
                  className={`nav-pill-item ${isActive("/Groups") ? "active" : ""}`}
                  onClick={() => handleNavClick("/Groups")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Groups</span>
                </button>

                <button
                  type="button"
                  className={`nav-pill-item ${isActive("/SettleUp") ? "active" : ""}`}
                  onClick={() => handleNavClick("/SettleUp")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="m21 8-4-4-4 4" />
                    <path d="M17 4v16" />
                  </svg>
                  <span>Settle Up</span>
                </button>

                <button
                  type="button"
                  className={`nav-pill-item ${isActive("/Activity") ? "active" : ""}`}
                  onClick={() => handleNavClick("/Activity")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  <span>Activity</span>
                </button>
              </div>
            ) : (
              // Marketing Navigation
              <div className="nav-pill-group">
                <button
                  type="button"
                  className="nav-link-subtle"
                  onClick={() => handleLandingScroll("features")}
                >
                  Features
                </button>
                <button
                  type="button"
                  className="nav-link-subtle"
                  onClick={() => handleLandingScroll("how-it-works")}
                >
                  How It Works
                </button>
                <button
                  type="button"
                  className="nav-link-subtle"
                  onClick={() => handleLandingScroll("testimonials")}
                >
                  Testimonials
                </button>
              </div>
            )}
          </nav>

          {/* ── Right Actions (Desktop) ── */}
          <div className="nav-actions-desktop">
            <div className="nav-theme-wrapper">
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>

            {isLoggedIn ? (
              <div className="user-action-cluster">
                {/* Settings Quick Trigger */}
                <button
                  type="button"
                  className={`icon-action-btn ${isSettingsOpen ? "active" : ""}`}
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="Settings"
                  title="Settings"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>

                {/* Profile Pill */}
                <button
                  type="button"
                  className={`user-profile-pill ${isActive("/Profile") ? "active" : ""}`}
                  onClick={() => handleNavClick("/Profile")}
                  title="My Profile"
                >
                  <div className="user-avatar-circle">
                    {getInitial(currentUser?.name || currentUser?.username)}
                  </div>
                  <span className="user-display-name">
                    {currentUser?.name || currentUser?.username || "Account"}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  className="icon-action-btn logout-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="auth-action-cluster">
                <button
                  type="button"
                  className={`auth-btn-ghost ${isActive("/Login") ? "active" : ""}`}
                  onClick={() => handleNavClick("/Login")}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="auth-btn-primary"
                  onClick={() => handleNavClick("/signUp")}
                >
                  <span>Get Started</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile Controls (Theme Toggle + Hamburger) ── */}
          <div className="nav-mobile-trigger">
            <div className="mobile-header-theme">
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>
            <button
              type="button"
              className={`hamburger-toggle ${mobileMenuOpen ? "is-active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>

        {/* ── Mobile Slide-down Drawer ── */}
        <div className={`nav-mobile-drawer ${mobileMenuOpen ? "is-open" : ""}`}>
          <div className="mobile-drawer-inner">
            {isLoggedIn ? (
              <>
                <div
                  className="mobile-user-card"
                  onClick={() => handleNavClick("/Profile")}
                >
                  <div className="user-avatar-circle large">
                    {getInitial(currentUser?.name || currentUser?.username)}
                  </div>
                  <div className="mobile-user-info">
                    <span className="mobile-user-name">
                      {currentUser?.name || currentUser?.username || "My Account"}
                    </span>
                    <span className="mobile-user-email">
                      {currentUser?.email || "View & Edit Profile"}
                    </span>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                <div className="mobile-nav-list">
                  <button
                    type="button"
                    className={`mobile-nav-item ${isActive("/Dashboard") ? "active" : ""}`}
                    onClick={() => handleNavClick("/Dashboard")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="7" height="9" x="3" y="3" rx="1" />
                      <rect width="7" height="5" x="14" y="3" rx="1" />
                      <rect width="7" height="9" x="14" y="12" rx="1" />
                      <rect width="7" height="5" x="3" y="16" rx="1" />
                    </svg>
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${isActive("/Groups") ? "active" : ""}`}
                    onClick={() => handleNavClick("/Groups")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Groups</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${isActive("/SettleUp") ? "active" : ""}`}
                    onClick={() => handleNavClick("/SettleUp")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m3 16 4 4 4-4" />
                      <path d="M7 20V4" />
                      <path d="m21 8-4-4-4 4" />
                      <path d="M17 4v16" />
                    </svg>
                    <span>Settle Up</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${isActive("/Activity") ? "active" : ""}`}
                    onClick={() => handleNavClick("/Activity")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <span>Activity</span>
                  </button>

                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Settings</span>
                  </button>
                </div>

                <div className="mobile-drawer-footer">
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mobile-nav-list">
                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => handleLandingScroll("features")}
                  >
                    <span>Features</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => handleLandingScroll("how-it-works")}
                  >
                    <span>How It Works</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => handleLandingScroll("testimonials")}
                  >
                    <span>Testimonials</span>
                  </button>
                </div>

                <div className="mobile-drawer-footer">
                  <div className="mobile-auth-actions">
                    <button
                      type="button"
                      className="auth-btn-ghost w-full"
                      onClick={() => handleNavClick("/Login")}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      className="auth-btn-primary w-full"
                      onClick={() => handleNavClick("/signUp")}
                    >
                      <span>Get Started Free</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="nav-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Settings Drawer */}
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
