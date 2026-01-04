const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// Natural language search
router.get('/', searchController.search);

// Get search suggestions (autocomplete)
router.get('/suggestions', searchController.getSuggestions);

// Parse query (for debugging/display)
router.get('/parse', searchController.parseQuery);

// Advanced search with additional filters
router.get('/advanced', searchController.advancedSearch);

module.exports = router;
