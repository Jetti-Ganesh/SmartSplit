const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to protect routes
 * Extracts userId from JWT token and attaches to req.user
 */
exports.protect = async (req, res, next) => {
  try {
    // 1. Get token from request header
    let token;
    console.log(req.headers.authorization);
    // Check if Authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token found, return error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }
    
    // 2. Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded",decoded);
    
    // decoded = {
    //   id: "67abcd12345678",
    //   phone: "9876543210",
    //   iat: 1730000000,  // issued at
    //   exp: 1730604800   // expiry
    // }
    
    // 3. Find user by ID from decoded token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }
    
    // 4. Attach user to request object
    req.user = user;  // Full user object
    // Now you can access:
    // - req.user.id
    // - req.user._id (same as id)
    // - req.user.name
    // - req.user.phone
    // - req.user.email
    
    // 5. Continue to next middleware/controller
    next();
    
  } catch (error) {
    // Token verification failed
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};