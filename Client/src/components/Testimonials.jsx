import '../styles/Testimonials.css'

const testimonials = [
  {
    name: 'Ravi Kumar',
    role: 'College Student, VIT',
    text: "Never argued over bills again! SplitSmart literally saved our friend group. The UPI settlement is so smooth.",
    avatar: 'R',
    color: '#00e5ff',
    stars: 5,
  },
  {
    name: 'Sneha Reddy',
    role: 'Software Engineer, Hyderabad',
    text: "Best app for group trips. We used it for our Goa trip and settling ₹40,000 in expenses took less than 2 minutes.",
    avatar: 'S',
    color: '#7c3aed',
    stars: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Freelancer, Bangalore',
    text: "The smart simplification feature is a game changer. Instead of 12 transactions, we needed just 3.",
    avatar: 'A',
    color: '#10b981',
    stars: 5,
  },
]

const Testimonials = () => {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-container">
        <div className="section-header">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">
            Loved by friend groups
            <span className="title-gradient"> across India</span>
          </h2>
          <p className="section-subtitle">
            Real people. Real trips. Real savings on awkward money conversations.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, index) => (
            <div
              className="testimonial-card"
              key={t.name}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="stars">
                {'★'.repeat(t.stars)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{
                    background: t.color + '22',
                    border: `1px solid ${t.color}55`,
                    color: t.color
                  }}
                >
                  {t.avatar}
                </div>
                <div className="author-info">
                  <span className="author-name">{t.name}</span>
                  <span className="author-role">{t.role}</span>
                </div>
              </div>

              {/* Decorative quote mark */}
              <div className="quote-mark">"</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials