import '../styles/LandingPage.css'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

const LandingPage = ({ isDark, toggleTheme }) => {
  const navigate = useNavigate()

  return (
    <>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />

       {/* ── MOBILE TOP BAR ── */} 
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">⚡</span>
          <span>SplitSmart</span>
        </div>
        <button className="mobile-top-settings" onClick={() => navigate("/Settings")}>
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

    </>
  )
}

export default LandingPage