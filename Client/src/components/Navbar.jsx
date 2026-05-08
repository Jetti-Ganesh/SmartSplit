import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import ThemeToggle from './ThemeToggle'
import '../styles/Navbar.css'

const Navbar = ({ isDark, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const location = useLocation()

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const handleNavClick = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  const authRoutes = ['/Dashboard', '/Profile', '/Groups', '/Activity', '/SettleUp']
  const isAppRoute = authRoutes.includes(location.pathname)

    if (isLoggedIn) return null

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
           "" /* No links when logged in, or you can add Dashboard/Profile here */
          ) : (
            <>
              <li><a href="#features" onClick={() => setMenuOpen(false)|| handleNavClick('/')}>Features</a></li>
              <li><a href="#how-it-works" onClick={() => setMenuOpen(false)|| handleNavClick('/')}>How It Works</a></li>
              <li><a href="#testimonials" onClick={() => setMenuOpen(false) || handleNavClick('/')}>Testimonials</a></li>
              <li><a onClick={() => handleNavClick('/signUp')} style={{ cursor: 'pointer' }}>Sign Up</a></li>
              <li><a onClick={() => handleNavClick('/Login')} style={{ cursor: 'pointer' }}>Login</a></li>
              
              {/* Mobile Only Extras */}
              <li className="mobile-only mobile-theme-row">
                <span className="mobile-theme-label">Theme</span>
                <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
              </li>
              <li className="mobile-only mobile-menu-cta">
                <a className="nav-cta" onClick={() => handleNavClick('/signUp')} style={{ cursor: 'pointer' }}>
                  Get Started
                </a>
              </li>
            </>
          )}
        </ul>

        {/* Right side — theme toggle + CTA (hidden on mobile) */}
        <div className="nav-right">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          {isLoggedIn ? (
           ""
          ) : (
            <a className="nav-cta" onClick={() => handleNavClick('/signUp')} style={{ cursor: 'pointer' }}>
              Get Started
            </a>
          )}
        </div>

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