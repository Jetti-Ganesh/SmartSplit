const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password)
      return res.status(400).json({ message: 'All fields are required.' })

    // Find user
    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' })

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' })

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

module.exports = router
