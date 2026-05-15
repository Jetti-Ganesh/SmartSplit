import '../styles/LandingPage.css'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

const LandingPage = () => {
  const { isDark, toggleTheme } = useOutletContext()
  const navigate = useNavigate()

  return (
    <>
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