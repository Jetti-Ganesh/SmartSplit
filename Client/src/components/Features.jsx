import '../styles/Features.css'

const features = [
  {
    icon: '📷',
    title: 'Receipt Scanning',
    description: 'Snap any receipt and let our AI auto-detect items and amounts. Split line by line in seconds.',
    tag: 'AI Powered',
    tagColor: '#00e5ff',
  },
  {
    icon: '💸',
    title: 'UPI Integration',
    description: 'Settle dues directly via UPI without leaving the app. Zero friction, instant transfers.',
    tag: 'Instant',
    tagColor: '#10b981',
  },
  {
    icon: '🧠',
    title: 'Smart Simplification',
    description: 'Automatically minimizes the number of transactions needed to settle a group — no back-and-forth.',
    tag: 'Smart',
    tagColor: '#7c3aed',
  },
  {
    icon: '🧳',
    title: 'Trip Mode',
    description: 'Create a trip, add members, and track all group expenses in one shared board. Perfect for travel.',
    tag: 'Groups',
    tagColor: '#f59e0b',
  },
]

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="features-container">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">
            Everything you need to
            <span className="title-gradient"> split smart</span>
          </h2>
          <p className="section-subtitle">
            Powerful tools that make group payments effortless — built for the way you actually live.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              className="feature-card"
              key={feature.title}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-top">
                <div className="feature-icon">{feature.icon}</div>
                <span
                  className="feature-tag"
                  style={{
                    background: feature.tagColor + '18',
                    color: feature.tagColor,
                    border: `1px solid ${feature.tagColor}33`
                  }}
                >
                  {feature.tag}
                </span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
              <div
                className="card-glow"
                style={{ background: feature.tagColor + '10' }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features