const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

// POST /api/auth/signup
router.post('/signUp', async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Validate fields
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Save user
    const user = new User({ name, email, password: hashedPassword })
    await user.save()

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

module.exports = router;