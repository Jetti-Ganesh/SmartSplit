import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import '../styles/Navbar.css'

const Navbar = ({ isDark, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  const navigate = useNavigate()
  const location = useLocation()

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Re-check auth on every route change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [location.pathname])

  // Listen for login/logout events
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('authChange', checkAuth)
    return () => window.removeEventListener('authChange', checkAuth)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('authChange'))
    setIsLoggedIn(false)
    navigate('/')
  }

  const handleNavClick = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">

        {/* Logo */}
        <div className="nav-logo" onClick={() => handleNavClick('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">SplitSmart</span>
        </div>

        {/* Nav Links */}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {isLoggedIn ? (
            <>
              <li><a onClick={() => handleNavClick('/Home')} style={{ cursor: 'pointer' }}>Home</a></li>
              <li><a onClick={() => handleNavClick('/groups')} style={{ cursor: 'pointer' }}>Groups</a></li>
              <li className="mobile-only">
                <a onClick={handleLogout} style={{ cursor: 'pointer', color: '#e53e3e' }}>Logout</a>
              </li>
            </>
          ) : (
            <>
              <li><a href="#features" onClick={() => setMenuOpen(false)|| handleNavClick('/')}>Features</a></li>
              <li><a href="#how-it-works" onClick={() => setMenuOpen(false)|| handleNavClick('/')}>How It Works</a></li>
              <li><a href="#testimonials" onClick={() => setMenuOpen(false) || handleNavClick('/')}>Testimonials</a></li>
              <li><a onClick={() => handleNavClick('/signUp')} style={{ cursor: 'pointer' }}>Sign Up</a></li>
              <li><a onClick={() => handleNavClick('/Login')} style={{ cursor: 'pointer' }}>Login</a></li>
            </>
          )}
        </ul>

        {/* Right side — theme toggle + CTA (hidden on mobile) */}
        <div className="nav-right">

          {isLoggedIn ? (
            <button className="nav-cta" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <a className="nav-cta" onClick={() => handleNavClick('/signUp')} style={{ cursor: 'pointer' }}>
              Get Started
            </a>
          )}
        </div>

          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        {/* Hamburger — mobile only */}
        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  )
}

export default Navbar