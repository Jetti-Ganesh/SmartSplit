// src/components/ThemeToggle.jsx
import '../styles/ThemeToggle.css'

const ThemeToggle = ({ isDark, toggleTheme }) => {
  return (
    <button
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="toggle-track">
        <span className="toggle-thumb">
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  )
}

export default ThemeToggle