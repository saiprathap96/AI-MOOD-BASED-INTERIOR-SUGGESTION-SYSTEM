const express = require('express');
const router = express.Router();
const controller = require('../controllers/suggestionController');
const { aiLimiter } = require('../middleware/rateLimiter');

// Suggestion endpoints
router.post('/generate', aiLimiter, controller.generateSuggestion);
router.get('/history', controller.getHistory);
router.delete('/:id', controller.deleteSuggestion);
router.post('/:id/rate', controller.rateSuggestion);
router.get('/analytics', controller.getAnalytics);

module.exports = router;
