import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import ThemeToggle from "./ThemeToggle";
import "../styles/SettingsDrawer.css";

const SettingsDrawer = ({ isOpen, onClose, isDark, toggleTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Close drawer when pressing Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate("/");
  };

  return (
    <>
      <div className={`settings-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div className={`settings-drawer ${isOpen ? "open" : ""}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'currentColor', display: 'block' }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {user && (
            <div className="settings-section">
              <h3>Account</h3>
              <div className="settings-item">
                <span className="settings-label">Email</span>
                <span className="settings-value">{user.email}</span>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="settings-item theme-item">
              <span className="settings-label">App Theme</span>
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>
            <div className="settings-item">
              <span className="settings-label">Notifications</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="settings-item">
              <span className="settings-label">Currency</span>
              <select className="settings-select">
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Security</h3>
            <div className="settings-item clickable">
              <span className="settings-label">Change Password</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
            <div className="settings-item clickable">
              <span className="settings-label">Two-Factor Auth</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-logout-btn" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Secure Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
