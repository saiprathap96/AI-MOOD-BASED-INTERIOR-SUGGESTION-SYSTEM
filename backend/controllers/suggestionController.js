const db = require('../utils/db');
const aiClient = require('../utils/aiClient');

// Generate a new suggestion
exports.generateSuggestion = async (req, res) => {
  try {
    const { roomType, colourPreference, budget } = req.body;

    if (!roomType) {
      return res.status(400).json({ success: false, message: 'Room type is required.' });
    }
    if (!colourPreference) {
      return res.status(400).json({ success: false, message: 'Colour preference is required.' });
    }
    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid budget in ₹ is required.' });
    }

    // Call AI to generate structured recommendation
    const recommendation = await aiClient.generateSuggestion(roomType, colourPreference, budget);

    // Save suggestion to database
    const savedSuggestion = await db.saveSuggestion(roomType, colourPreference, budget, recommendation);

    return res.status(201).json({
      success: true,
      message: 'Furniture recommendation generated successfully.',
      data: savedSuggestion
    });
  } catch (error) {
    console.error('Error generating suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate furniture suggestion. Please try again.',
      error: error.message
    });
  }
};

// Fetch suggestion history
exports.getHistory = async (req, res) => {
  try {
    const history = await db.getAllSuggestions();
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions history.',
      error: error.message
    });
  }
};

// Delete a suggestion
exports.deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteSuggestion(id);
    
    if (deleted) {
      return res.status(200).json({
        success: true,
        message: 'Suggestion deleted successfully.'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found or could not be deleted.'
      });
    }
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete suggestion.',
      error: error.message
    });
  }
};

// Rate a suggestion
exports.rateSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'A valid rating between 1 and 5 is required.'
      });
    }

    const updated = await db.rateSuggestion(id, rating);
    if (updated) {
      return res.status(200).json({
        success: true,
        message: 'Rating recorded. Thank you for your feedback!',
        data: updated
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found.'
      });
    }
  } catch (error) {
    console.error('Error rating suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save rating.',
      error: error.message
    });
  }
};

// Get Analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics metrics.',
      error: error.message
    });
  }
};
