import '../styles/LandingPage.css'
import { useOutletContext } from 'react-router-dom'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import MobileTopBar from '../components/MobileTopBar'

const LandingPage = () => {
  const { isDark, toggleTheme } = useOutletContext()

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