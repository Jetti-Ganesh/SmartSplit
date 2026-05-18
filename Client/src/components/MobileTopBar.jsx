import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SettingsDrawer from './SettingsDrawer';
import ThemeToggle from './ThemeToggle';
import '../styles/MobileTopBar.css';

const MobileTopBar = ({ isDark, toggleTheme, showHamburger = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSelector(state => state.auth);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollToHero = () => {
    const heroSection = document.getElementById('home');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navTo = (path) => {
    setMenuOpen(false);
    if (path === '/' && location.pathname === '/') {
      scrollToHero();
      return;
    }
    navigate(path);
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <>
      <div className="mtb-bar" ref={menuRef}>
        {/* Logo */}
        <div className="mtb-logo" onClick={() => navTo('/')}>
          <div className="mtb-logo-icon">💸</div>
          <span className="mtb-logo-text">SmartSplit</span>
        </div>

        {/* Right side — hamburger only shown on landing pre-login */}
        {showHamburger && !isLoggedIn && (
          <div className="mtb-right">
            <button
              className={`mtb-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span className="mtb-bar-line"></span>
              <span className="mtb-bar-line"></span>
              <span className="mtb-bar-line"></span>
            </button>

            {/* Fullscreen overlay */}
            <div
              className={`mtb-overlay ${menuOpen ? 'visible' : ''}`}
              onClick={() => setMenuOpen(false)}
            />

            {/* Slide-in drawer menu */}
            <div className={`mtb-drawer ${menuOpen ? 'open' : ''}`}>
              {/* Drawer header */}
              <div className="mtb-drawer-header">
                <div className="mtb-drawer-logo">
                  <div className="mtb-drawer-logo-icon">⚡</div>
                  <span>SplitSmart</span>
                </div>
                <button
                  className="mtb-drawer-close"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Nav section */}
              <div className="mtb-drawer-section">
                <p className="mtb-drawer-section-label">Navigation</p>
                {navLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="mtb-drawer-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mtb-drawer-link-text">{link.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </a>
                ))}
              </div>

              {/* Settings section */}
              <div className="mtb-drawer-section">
                <p className="mtb-drawer-section-label">Settings</p>
                <div className="mtb-drawer-setting-row">
                  <span className="mtb-drawer-setting-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ marginRight: 8, verticalAlign: 'middle' }}>
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    Theme
                  </span>
                  <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                </div>
              </div>

              {/* Auth CTA at bottom */}
              <div className="mtb-drawer-footer">
                <button
                  className="mtb-drawer-login-btn"
                  onClick={() => navTo('/Login')}
                >
                  Log In
                </button>
                <button
                  className="mtb-drawer-signup-btn"
                  onClick={() => navTo('/signUp')}
                >
                  Get Started Free →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
    </>
  );
};

export default MobileTopBar;
