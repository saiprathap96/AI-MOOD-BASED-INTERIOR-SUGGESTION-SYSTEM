const rateLimit = require('express-rate-limit');

// Rate limiting on AI endpoint: max 10 requests per minute
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, 
  message: {
    success: false,
    message: 'Too many requests. Sri Venkata Sai Furniture AI assistant allows a maximum of 10 requests per minute. Please try again in a moment.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable deprecated headers
});

module.exports = {
  aiLimiter
};
