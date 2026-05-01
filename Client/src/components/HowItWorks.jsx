import '../styles/Howitworks.css'
import { useNavigate } from 'react-router-dom'
const steps = [
  {
    number: '01',
    icon: '👥',
    title: 'Create a Group',
    description: 'Add your friends, roommates, or travel buddies. Name your group — "Goa Trip", "Flat Mates", whatever fits.',
    color: '#00e5ff',
  },
  {
    number: '02',
    icon: '🧾',
    title: 'Add Expenses',
    description: 'Log expenses manually or snap a receipt. Our AI reads it and splits the items automatically.',
    color: '#7c3aed',
  },
  {
    number: '03',
    icon: '🧠',
    title: 'Smart Split',
    description: 'SplitSmart calculates who owes what and minimizes the number of transactions needed to settle up.',
    color: '#10b981',
  },
  {
    number: '04',
    icon: '✅',
    title: 'Settle via UPI',
    description: 'Pay directly through UPI without leaving the app. One tap and the debt is cleared — for real.',
    color: '#f59e0b',
  },
]

const HowItWorks = () => {
  const navigate = useNavigate()
  return (
    <section className="hiw" id="how-it-works">
      <div className="hiw-container">

        {/* Header */}
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">
            From group to settled
            <span className="title-gradient"> in 4 steps</span>
          </h2>
          <p className="section-subtitle">
            No spreadsheets. No awkward reminders. Just add, split, and done.
          </p>
        </div>

        {/* ── Stepper timeline ── */}
        <div className="hiw-stepper">

          {/* The continuous line running through all nodes */}
          <div className="stepper-track" />

          {steps.map((step, index) => (
            <div
              className="stepper-item"
              key={step.number}
              style={{ '--step-color': step.color, animationDelay: `${index * 0.12}s` }}
            >
              {/* Node circle on the track */}
              <div className="stepper-node" style={{ borderColor: step.color, background: step.color + '18', boxShadow: `0 0 16px ${step.color}44` }}>
                <span className="node-icon">{step.icon}</span>
              </div>

              {/* Card below the node */}
              <div className="stepper-card">
                <div className="stepper-badge" style={{ color: step.color, background: step.color + '15', borderColor: step.color + '40' }}>
                  {step.number}
                </div>
                <h3 className="stepper-title">{step.title}</h3>
                <p className="stepper-desc">{step.description}</p>
                <div className="stepper-card-glow" style={{ background: step.color + '0c' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="hiw-cta">
          <p className="hiw-cta-text">Takes less than 60 seconds to set up your first group.</p>
          <a  className="hiw-btn" onClick={() => navigate('/signUp')} >
            Try It Free <span className="hiw-btn-arrow">→</span>
          </a>
        </div>

      </div>
    </section>
  )
}

export default HowItWorks