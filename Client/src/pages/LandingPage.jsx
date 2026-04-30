import '../styles/LandingPage.css'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

const LandingPage = ({ isDark, toggleTheme }) => {
  return (
    <>
      <Navbar isDark={isDark} toggleTheme={toggleTheme}  />
      <main>
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