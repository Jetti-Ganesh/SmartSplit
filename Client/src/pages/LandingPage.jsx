import '../styles/LandingPage.css'
import { Navigate, useOutletContext } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import MobileTopBar from '../components/MobileTopBar'

const LandingPage = () => {
  const { isDark, toggleTheme } = useOutletContext()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)

  if (isLoggedIn) {
    return <Navigate to="/Dashboard" replace />
  }

  return (
    <>
      <MobileTopBar isDark={isDark} toggleTheme={toggleTheme} showHamburger={true} />
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