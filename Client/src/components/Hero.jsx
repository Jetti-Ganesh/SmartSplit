import '../styles/Hero.css'
import { useNavigate } from 'react-router-dom'
const Hero = () => {
  const navigate = useNavigate()
  return (
    <section className="hero" id="home">
      {/* Background orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            New — UPI Integration is Live
          </div>

          <h1 className="hero-title">
            Stop Fighting
            <span className="title-gradient"> Over Bills</span>
          </h1>

          <p className="hero-subtitle">
            Track expenses, split costs, and settle debts —
            all in one beautifully simple place.
          </p>

          <div className="hero-actions">
            <a  className="btn-primary"  onClick={() => navigate('/signup')}>
              Get Started <span className="btn-arrow">→</span>
            </a>
            <a href="#how-it-works" className="btn-secondary">
              ▶ See How It Works
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">₹2Cr+</span>
              <span className="stat-label">Settled</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="app-preview">
                <div className="preview-header">
                  <span>Trip to Goa 🏖️</span>
                  <span className="preview-amount">₹8,400</span>
                </div>
                <div className="preview-list">
                  {[
                    { name: 'Ravi', amount: '₹2,100', color: '#00e5ff' },
                    { name: 'Sneha', amount: '₹1,800', color: '#7c3aed' },
                    { name: 'Arjun', amount: '₹2,400', color: '#10b981' },
                    { name: 'Priya', amount: '₹2,100', color: '#f59e0b' },
                  ].map((person) => (
                    <div className="preview-item" key={person.name}>
                      <div className="preview-avatar" style={{ background: person.color + '22', border: `1px solid ${person.color}44` }}>
                        {person.name[0]}
                      </div>
                      <span className="preview-name">{person.name}</span>
                      <span className="preview-person-amount">{person.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="preview-btn">Settle All via UPI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero