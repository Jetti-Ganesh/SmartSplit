// src/pages/SignupPage.jsx
import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import '../styles/Signup.css'

function SignupPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')

  // Handle normal input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle normal form signup
  const handleSignup = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    // 🔁 Replace this with your real API call
    console.log('Signing up with:', form)
    alert('Signup successful!')
  }

  // Handle Google signup
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Use the access token to get user info from Google
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
      const userInfo = await res.json()
      console.log('Google user:', userInfo)

      // 🔁 Send userInfo to your backend here
      // Example: POST /api/auth/google with { name, email, picture }
      alert(`Welcome, ${userInfo.name}!`)
      navigate('/')
    },
    onError: () => {
      setError('Google sign-up failed. Try again.')
    },
  })

  return (
    <div className="signup-container">
      <div className="signup-card">

        {/* Logo / Brand */}
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join us today — it's free</p>
        </div>

        {/* Google Signup Button */}
        <button className="google-btn" onClick={handleGoogleSignup}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="google-icon"
          />
          Sign up with Google
        </button>

        {/* Divider */}
        <div className="divider">
          <span>or sign up with email</span>
        </div>

        {/* Error message */}
        {error && <p className="error-msg">{error}</p>}

        {/* Manual Signup Form */}
        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        {/* Login redirect */}
        <p className="login-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log in</span>
        </p>

      </div>
    </div>
  )
}

export default SignupPage