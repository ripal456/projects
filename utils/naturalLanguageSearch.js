const Tour = require("../models/tourModel");

/**
 * Natural Language Search Engine for TripMind
 * Parses natural language queries and converts them to database queries
 */

class NaturalLanguageSearch {
  constructor() {
    // Price keywords
    this.pricePatterns = {
      cheap: { max: 500 },
      budget: { max: 500 },
      affordable: { max: 700 },
      "mid-range": { min: 500, max: 1500 },
      moderate: { min: 500, max: 1500 },
      expensive: { min: 1500 },
      luxury: { min: 2000 },
      premium: { min: 2000 },
    };

    // Duration keywords
    this.durationPatterns = {
      "day trip": { max: 1 },
      weekend: { min: 2, max: 3 },
      short: { max: 5 },
      week: { min: 5, max: 10 },
      long: { min: 10 },
      extended: { min: 14 },
    };

    // Difficulty keywords
    this.difficultyPatterns = {
      easy: "easy",
      beginner: "easy",
      "family-friendly": "easy",
      family: "easy",
      relaxing: "easy",
      leisurely: "easy",
      moderate: "medium",
      medium: "medium",
      intermediate: "medium",
      challenging: "difficult",
      difficult: "difficult",
      hard: "difficult",
      advanced: "difficult",
      extreme: "difficult",
      adventure: "difficult",
    };

    // Activity/type keywords (for summary/description search)
    this.activityKeywords = [
      "hiking",
      "trekking",
      "walking",
      "climbing",
      "mountaineering",
      "beach",
      "coastal",
      "sea",
      "ocean",
      "island",
      "forest",
      "jungle",
      "wildlife",
      "safari",
      "nature",
      "city",
      "urban",
      "cultural",
      "historical",
      "museum",
      "adventure",
      "extreme",
      "sport",
      "water",
      "diving",
      "camping",
      "glamping",
      "outdoor",
      "scenic",
      "photography",
      "food",
      "culinary",
      "wine",
      "gastronomy",
      "desert",
      "mountain",
      "valley",
      "river",
      "lake",
      "snow",
      "ski",
      "winter",
      "summer",
      "spring",
      "autumn",
    ];

    // Sort preferences
    this.sortPatterns = {
      cheapest: { price: 1 },
      "lowest price": { price: 1 },
      "most affordable": { price: 1 },
      "most expensive": { price: -1 },
      "highest rated": { ratingsAverage: -1 },
      "best rated": { ratingsAverage: -1 },
      "top rated": { ratingsAverage: -1 },
      "most popular": { ratingsQuantity: -1 },
      "most reviewed": { ratingsQuantity: -1 },
      shortest: { duration: 1 },
      longest: { duration: -1 },
      newest: { createdAt: -1 },
    };
  }

  /**
   * Parse natural language query and search tours
   * @param {String} query - Natural language search query
   * @returns {Object} - Search results with parsed filters
   */
  async search(query) {
    const parsedQuery = this.parseQuery(query);
    const mongoQuery = this.buildMongoQuery(parsedQuery);

    let toursQuery = Tour.find(mongoQuery.filter);

    // Apply text search if keywords found
    if (parsedQuery.keywords.length > 0) {
      // MongoDB text search or regex search
      const keywordRegex = parsedQuery.keywords.map((k) => new RegExp(k, "i"));
      toursQuery = Tour.find({
        ...mongoQuery.filter,
        $or: [
          { name: { $in: keywordRegex } },
          { summary: { $in: keywordRegex } },
          { description: { $in: keywordRegex } },
        ],
      });
    }

    // Apply sorting
    if (mongoQuery.sort) {
      toursQuery = toursQuery.sort(mongoQuery.sort);
    } else {
      toursQuery = toursQuery.sort({ ratingsAverage: -1 });
    }

    // Limit results
    const limit = parsedQuery.limit || 10;
    toursQuery = toursQuery.limit(limit);

    const tours = await toursQuery;

    return {
      status: "success",
      query: query,
      parsedFilters: parsedQuery,
      results: tours.length,
      data: {
        tours,
      },
      searchSummary: this.generateSearchSummary(parsedQuery, tours.length),
    };
  }

  /**
   * Parse natural language query into structured filters
   */
  parseQuery(query) {
    const lowerQuery = query.toLowerCase();
    const parsed = {
      priceRange: {},
      durationRange: {},
      difficulty: null,
      keywords: [],
      sort: null,
      limit: 10,
      originalQuery: query,
    };

    // Extract explicit price (e.g., "under $500", "$1000-$2000")
    const priceUnder = lowerQuery.match(/under\s*\$?(\d+)/);
    const priceOver = lowerQuery.match(/over\s*\$?(\d+)|above\s*\$?(\d+)/);
    const priceRange = lowerQuery.match(/\$?(\d+)\s*[-–to]+\s*\$?(\d+)/);
    const priceMax = lowerQuery.match(/max(?:imum)?\s*\$?(\d+)/);

    if (priceUnder) {
      parsed.priceRange.max = parseInt(priceUnder[1]);
    }
    if (priceOver) {
      parsed.priceRange.min = parseInt(priceOver[1] || priceOver[2]);
    }
    if (priceRange) {
      parsed.priceRange.min = parseInt(priceRange[1]);
      parsed.priceRange.max = parseInt(priceRange[2]);
    }
    if (priceMax) {
      parsed.priceRange.max = parseInt(priceMax[1]);
    }

    // Check price keywords
    for (const [keyword, range] of Object.entries(this.pricePatterns)) {
      if (lowerQuery.includes(keyword)) {
        parsed.priceRange = { ...parsed.priceRange, ...range };
        break;
      }
    }

    // Extract explicit duration (e.g., "5 days", "2 weeks")
    const daysMatch = lowerQuery.match(/(\d+)\s*day/);
    const weeksMatch = lowerQuery.match(/(\d+)\s*week/);

    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      parsed.durationRange = { min: days - 1, max: days + 1 };
    }
    if (weeksMatch) {
      const days = parseInt(weeksMatch[1]) * 7;
      parsed.durationRange = { min: days - 2, max: days + 2 };
    }

    // Check duration keywords
    for (const [keyword, range] of Object.entries(this.durationPatterns)) {
      if (lowerQuery.includes(keyword)) {
        parsed.durationRange = { ...parsed.durationRange, ...range };
        break;
      }
    }

    // Check difficulty keywords
    for (const [keyword, difficulty] of Object.entries(
      this.difficultyPatterns
    )) {
      if (lowerQuery.includes(keyword)) {
        parsed.difficulty = difficulty;
        break;
      }
    }

    // Extract activity/location keywords
    this.activityKeywords.forEach((keyword) => {
      if (lowerQuery.includes(keyword)) {
        parsed.keywords.push(keyword);
      }
    });

    // Extract any quoted phrases as exact keywords
    const quotedPhrases = query.match(/"([^"]+)"|'([^']+)'/g);
    if (quotedPhrases) {
      quotedPhrases.forEach((phrase) => {
        parsed.keywords.push(phrase.replace(/['"]/g, ""));
      });
    }

    // Check sort preferences
    for (const [phrase, sort] of Object.entries(this.sortPatterns)) {
      if (lowerQuery.includes(phrase)) {
        parsed.sort = sort;
        break;
      }
    }

    // Extract limit (e.g., "top 5", "show 10")
    const limitMatch = lowerQuery.match(/(?:top|show|first|limit)\s*(\d+)/);
    if (limitMatch) {
      parsed.limit = Math.min(parseInt(limitMatch[1]), 20);
    }

    return parsed;
  }

  /**
   * Build MongoDB query from parsed filters
   */
  buildMongoQuery(parsed) {
    const filter = {};
    let sort = parsed.sort || { ratingsAverage: -1 };

    // Price filter
    if (parsed.priceRange.min || parsed.priceRange.max) {
      filter.price = {};
      if (parsed.priceRange.min) filter.price.$gte = parsed.priceRange.min;
      if (parsed.priceRange.max) filter.price.$lte = parsed.priceRange.max;
    }

    // Duration filter
    if (parsed.durationRange.min || parsed.durationRange.max) {
      filter.duration = {};
      if (parsed.durationRange.min)
        filter.duration.$gte = parsed.durationRange.min;
      if (parsed.durationRange.max)
        filter.duration.$lte = parsed.durationRange.max;
    }

    // Difficulty filter
    if (parsed.difficulty) {
      filter.difficulty = parsed.difficulty;
    }

    return { filter, sort };
  }

  /**
   * Generate human-readable search summary
   */
  generateSearchSummary(parsed, resultCount) {
    const parts = [];

    if (parsed.difficulty) {
      parts.push(`${parsed.difficulty} difficulty`);
    }

    if (parsed.priceRange.max && parsed.priceRange.min) {
      parts.push(`$${parsed.priceRange.min}-$${parsed.priceRange.max}`);
    } else if (parsed.priceRange.max) {
      parts.push(`under $${parsed.priceRange.max}`);
    } else if (parsed.priceRange.min) {
      parts.push(`over $${parsed.priceRange.min}`);
    }

    if (parsed.durationRange.max && parsed.durationRange.min) {
      parts.push(
        `${parsed.durationRange.min}-${parsed.durationRange.max} days`
      );
    } else if (parsed.durationRange.max) {
      parts.push(`up to ${parsed.durationRange.max} days`);
    } else if (parsed.durationRange.min) {
      parts.push(`${parsed.durationRange.min}+ days`);
    }

    if (parsed.keywords.length > 0) {
      parts.push(`related to "${parsed.keywords.join(", ")}"`);
    }

    const filterSummary =
      parts.length > 0
        ? `Showing ${resultCount} tours: ${parts.join(", ")}`
        : `Found ${resultCount} tours matching your search`;

    return filterSummary;
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery) {
    const suggestions = [];
    const lower = partialQuery.toLowerCase();

    // Activity suggestions
    this.activityKeywords.forEach((keyword) => {
      if (
        keyword.startsWith(lower) ||
        lower.includes(keyword.substring(0, 3))
      ) {
        suggestions.push(`${keyword} tours`);
      }
    });

    // Price suggestions
    if (lower.includes("cheap") || lower.includes("budget")) {
      suggestions.push("budget tours under $500");
      suggestions.push("cheap adventure tours");
    }

    // Duration suggestions
    if (lower.includes("day") || lower.includes("week")) {
      suggestions.push("5-day hiking tours");
      suggestions.push("weekend getaway tours");
      suggestions.push("2-week adventure");
    }

    return suggestions.slice(0, 5);
  }
}

module.exports = new NaturalLanguageSearch();
