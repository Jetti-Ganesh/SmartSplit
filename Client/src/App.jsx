import { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom"
import Navbar from './components/Navbar'  // import Navbar here
import './index.css'
function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <>
      {/* Navbar now lives here — appears on ALL pages automatically */}
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <Outlet />
    </>
  )
}

export default App