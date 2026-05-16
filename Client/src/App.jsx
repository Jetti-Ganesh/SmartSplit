import { useEffect } from 'react'
import { Outlet } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from './services/themeSlice'
import Navbar from './components/Navbar'
import './index.css'

function App() {
  const dispatch = useDispatch()
  const { isDark } = useSelector((state) => state.theme)
  const { isLoggedIn } = useSelector((state) => state.auth)

  // Apply theme class to body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light')
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
      document.body.classList.add('light')
    }
  }, [isDark])

  const handleToggleTheme = () => dispatch(toggleTheme())

  return (
    <>
      <Navbar isDark={isDark} toggleTheme={handleToggleTheme} />
      <Outlet context={{ isDark, toggleTheme: handleToggleTheme }} />
    </>
  )
}

export default App