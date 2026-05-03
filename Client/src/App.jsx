import { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom"
import Navbar from './components/Navbar'
import './index.css'

// ── Validate token synchronously (runs before first render) ──────────────────
// If token is expired or malformed, wipe it immediately so no page
// ever flashes the wrong state on load.
function getInitialAuthState() {
  const token = localStorage.getItem('token')
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      // Expired — clean up
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return false
    }
    return true
  } catch {
    // Malformed token — clean up
    localStorage.removeItem('token')
    return false
  }
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

  // ✅ Token is validated synchronously — correct on first render, no flash
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialAuthState)

  // Apply theme class to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  // Listen for login/logout events fired from Login.jsx / Navbar.jsx
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('authChange', checkAuth)
    return () => window.removeEventListener('authChange', checkAuth)
  }, [])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <Outlet context={{ isDark, toggleTheme }} />
    </>
  )
}

export default App