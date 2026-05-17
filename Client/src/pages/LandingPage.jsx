import '../styles/LandingPage.css'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import SettingsDrawer from '../components/SettingsDrawer'
import { useState } from 'react'

const LandingPage = () => {
  const { isDark, toggleTheme } = useOutletContext()
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
       {/* ── MOBILE TOP BAR ── */} 
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => setIsSettingsOpen(true)}>
          ⚙️
        </button>
      </div>
      <main className="landing-page-main">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    </>
  )
}

export default LandingPage