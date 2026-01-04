const NaturalLanguageSearch = require('../utils/naturalLanguageSearch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Natural language search for tours
 */
exports.search = catchAsync(async (req, res, next) => {
  const { q, query } = req.query;
  const searchQuery = q || query;

  if (!searchQuery) {
    return next(new AppError('Please provide a search query using ?q=your search', 400));
  }

  const results = await NaturalLanguageSearch.search(searchQuery);

  res.status(200).json(results);
});

/**
 * Get search suggestions
 */
exports.getSuggestions = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json({
      status: 'success',
      data: {
        suggestions: []
      }
    });
  }

  const suggestions = NaturalLanguageSearch.getSuggestions(q);

  res.status(200).json({
    status: 'success',
    data: {
      suggestions
    }
  });
});

/**
 * Parse query and return filters (useful for debugging/display)
 */
exports.parseQuery = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError('Please provide a query to parse', 400));
  }

  const parsed = NaturalLanguageSearch.parseQuery(q);

  res.status(200).json({
    status: 'success',
    data: {
      originalQuery: q,
      parsedFilters: parsed
    }
  });
});

/**
 * Advanced search with additional options
 */
exports.advancedSearch = catchAsync(async (req, res, next) => {
  const { q, minRating, maxResults } = req.query;

  if (!q) {
    return next(new AppError('Please provide a search query', 400));
  }

  const results = await NaturalLanguageSearch.search(q);

  // Apply additional filters
  let filteredTours = results.data.tours;

  if (minRating) {
    filteredTours = filteredTours.filter(t => t.ratingsAverage >= parseFloat(minRating));
  }

  if (maxResults) {
    filteredTours = filteredTours.slice(0, parseInt(maxResults));
  }

  res.status(200).json({
    status: 'success',
    query: q,
    parsedFilters: results.parsedFilters,
    results: filteredTours.length,
    searchSummary: results.searchSummary,
    data: {
      tours: filteredTours
    }
  });
});
