const Tour = require("../models/tourModel");

/**
 * AI Chatbot Engine for TripMind
 * Handles natural language queries about tours and bookings
 */

class ChatbotEngine {
  constructor() {
    // Intent patterns for understanding user queries
    this.intents = {
      greeting: /^(hi|hello|hey|good morning|good evening|howdy)/i,
      tourSearch: /(find|search|show|looking for|want|need|recommend).*(tour|trip|vacation|adventure)/i,
      priceQuery: /(price|cost|cheap|expensive|budget|afford|how much)/i,
      durationQuery: /(how long|duration|days|week|short|long)/i,
      difficultyQuery: /(easy|medium|difficult|hard|beginner|advanced|family)/i,
      locationQuery: /(where|location|country|place|destination)/i,
      bookingHelp: /(book|booking|reserve|reservation|payment)/i,
      tourDetails: /(tell me about|details|information|info|what is)/i,
      popularTours: /(popular|best|top|recommended|trending)/i,
      help: /(help|assist|support|how do|what can)/i,
      thanks: /(thank|thanks|thx|appreciate)/i,
      goodbye: /(bye|goodbye|see you|later)/i,
    };
  }

  /**
   * Process user message and generate response
   */
  async processMessage(message, userId = null) {
    const lowerMessage = message.toLowerCase().trim();

    // Detect intent
    const intent = this.detectIntent(lowerMessage);

    // Generate response based on intent
    const response = await this.generateResponse(intent, message, userId);

    return response;
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message) {
    for (const [intent, pattern] of Object.entries(this.intents)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return "unknown";
  }

  /**
   * Generate response based on detected intent
   */
  async generateResponse(intent, originalMessage, userId) {
    switch (intent) {
      case "greeting":
        return this.greetingResponse();

      case "tourSearch":
        return await this.searchToursResponse(originalMessage);

      case "priceQuery":
        return await this.priceQueryResponse(originalMessage);

      case "durationQuery":
        return await this.durationQueryResponse(originalMessage);

      case "difficultyQuery":
        return await this.difficultyQueryResponse(originalMessage);

      case "popularTours":
        return await this.popularToursResponse();

      case "bookingHelp":
        return this.bookingHelpResponse();

      case "help":
        return this.helpResponse();

      case "thanks":
        return this.thanksResponse();

      case "goodbye":
        return this.goodbyeResponse();

      case "tourDetails":
        return await this.tourDetailsResponse(originalMessage);

      default:
        return await this.smartSearchResponse(originalMessage);
    }
  }

  /**
   * Greeting response
   */
  greetingResponse() {
    const greetings = [
      "Hello! 👋 Welcome to TripMind! I'm your AI travel assistant. How can I help you find your perfect adventure today?",
      "Hi there! 🌍 I'm here to help you discover amazing tours. What kind of adventure are you looking for?",
      "Hey! 🎒 Ready to explore the world? Tell me what you're looking for - budget, duration, difficulty - and I'll find the perfect tour for you!",
    ];
    return {
      message: greetings[Math.floor(Math.random() * greetings.length)],
      tours: [],
      suggestions: [
        "Show popular tours",
        "Tours under $1000",
        "Easy family tours",
        "Adventure trips",
      ],
    };
  }

  /**
   * Search tours based on user query
   */
  async searchToursResponse(message) {
    const filters = this.extractFilters(message);
    const tours = await this.findTours(filters);

    if (tours.length === 0) {
      return {
        message:
          "I couldn't find tours matching your criteria. Let me show you some alternatives! 🔍",
        tours: await this.getPopularTours(3),
        suggestions: [
          "Show all tours",
          "Adjust my budget",
          "Different difficulty",
        ],
      };
    }

    return {
      message: `Great news! 🎉 I found ${tours.length} tour${
        tours.length > 1 ? "s" : ""
      } that match your preferences:`,
      tours: tours.slice(0, 4),
      suggestions: [
        "Tell me more about the first one",
        "Show cheaper options",
        "Different duration",
      ],
    };
  }

  /**
   * Price-specific query response
   */
  async priceQueryResponse(message) {
    const priceMatch = message.match(/\$?(\d+)/);
    let maxPrice = priceMatch ? parseInt(priceMatch[1]) : 1000;

    // Check for keywords
    if (/cheap|budget|affordable/i.test(message)) maxPrice = 500;
    if (/expensive|luxury|premium/i.test(message)) maxPrice = 10000;

    const tours = await Tour.find({ price: { $lte: maxPrice } })
      .sort({ price: 1, ratingsAverage: -1 })
      .limit(4);

    if (tours.length === 0) {
      return {
        message: `I couldn't find tours under $${maxPrice}. Our most affordable tour starts at a great price though! 💰`,
        tours: await Tour.find()
          .sort({ price: 1 })
          .limit(3),
        suggestions: [
          "Show cheapest tours",
          "Increase budget",
          "Payment plans available?",
        ],
      };
    }

    return {
      message: `💰 Here are tours within your budget (under $${maxPrice}):`,
      tours,
      suggestions: [
        "Show more options",
        "What's included?",
        "Group discounts?",
      ],
    };
  }

  /**
   * Duration-specific query response
   */
  async durationQueryResponse(message) {
    let minDuration = 1;
    let maxDuration = 30;

    if (/short|quick|weekend/i.test(message)) {
      maxDuration = 5;
    } else if (/week/i.test(message)) {
      minDuration = 5;
      maxDuration = 10;
    } else if (/long|extended/i.test(message)) {
      minDuration = 10;
    }

    const daysMatch = message.match(/(\d+)\s*day/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      minDuration = Math.max(1, days - 2);
      maxDuration = days + 2;
    }

    const tours = await Tour.find({
      duration: { $gte: minDuration, $lte: maxDuration },
    })
      .sort({ ratingsAverage: -1 })
      .limit(4);

    return {
      message: `⏱️ Here are ${
        minDuration === maxDuration
          ? `${minDuration}-day`
          : `${minDuration}-${maxDuration} day`
      } tours:`,
      tours,
      suggestions: [
        "Shorter trips",
        "Longer adventures",
        "Most popular duration",
      ],
    };
  }

  /**
   * Difficulty-specific query response
   */
  async difficultyQueryResponse(message) {
    let difficulty = "medium";

    if (/easy|beginner|family|relax/i.test(message)) {
      difficulty = "easy";
    } else if (/hard|difficult|challenging|advanced|extreme/i.test(message)) {
      difficulty = "difficult";
    }

    const tours = await Tour.find({ difficulty })
      .sort({ ratingsAverage: -1 })
      .limit(4);

    const difficultyEmoji = {
      easy: "🌴",
      medium: "🥾",
      difficult: "🏔️",
    };

    return {
      message: `${
        difficultyEmoji[difficulty]
      } Here are ${difficulty} level tours perfect for you:`,
      tours,
      suggestions: [
        "Try different difficulty",
        "Family-friendly options",
        "What gear do I need?",
      ],
    };
  }

  /**
   * Popular tours response
   */
  async popularToursResponse() {
    const tours = await this.getPopularTours(4);

    return {
      message:
        "⭐ Here are our most popular tours loved by travelers worldwide:",
      tours,
      suggestions: [
        "Budget-friendly options",
        "Adventure tours",
        "Relaxing getaways",
      ],
    };
  }

  /**
   * Booking help response
   */
  bookingHelpResponse() {
    return {
      message: `📋 **Booking with TripMind is easy!**

1. **Browse** - Find your perfect tour
2. **Select Date** - Choose from available start dates  
3. **Book** - Secure checkout with Stripe
4. **Prepare** - Receive confirmation & packing list

**Need help?** Just ask me about any tour and I'll guide you through!`,
      tours: [],
      suggestions: [
        "Show available tours",
        "Payment methods?",
        "Cancellation policy",
      ],
    };
  }

  /**
   * Help response
   */
  helpResponse() {
    return {
      message: `🤖 **I'm your TripMind AI Assistant!**

I can help you with:
• 🔍 **Find tours** - "Show me adventure tours"
• 💰 **Budget search** - "Tours under $500"
• ⏱️ **Duration** - "5-day trips"
• 🎯 **Difficulty** - "Easy family tours"
• ⭐ **Recommendations** - "Popular tours"
• 📋 **Booking help** - "How to book?"

Just type what you're looking for!`,
      tours: [],
      suggestions: [
        "Popular tours",
        "Budget tours",
        "Adventure trips",
        "Family vacations",
      ],
    };
  }

  /**
   * Tour details response
   */
  async tourDetailsResponse(message) {
    // Try to extract tour name
    const tours = await Tour.find();
    let matchedTour = null;

    for (const tour of tours) {
      if (
        message.toLowerCase().includes(tour.name.toLowerCase()) ||
        message.toLowerCase().includes(tour.slug)
      ) {
        matchedTour = tour;
        break;
      }
    }

    if (matchedTour) {
      return {
        message: `📍 **${matchedTour.name}**

${matchedTour.summary}

• **Duration:** ${matchedTour.duration} days
• **Difficulty:** ${matchedTour.difficulty}
• **Price:** $${matchedTour.price} per person
• **Group Size:** Max ${matchedTour.maxGroupSize} people
• **Rating:** ⭐ ${matchedTour.ratingsAverage} (${
          matchedTour.ratingsQuantity
        } reviews)

Would you like to book this tour?`,
        tours: [matchedTour],
        suggestions: ["Book this tour", "Similar tours", "See reviews"],
      };
    }

    return {
      message:
        "Which tour would you like to know more about? Here are some options:",
      tours: await this.getPopularTours(4),
      suggestions: ["Tell me about the first one", "Show all tours"],
    };
  }

  /**
   * Thanks response
   */
  thanksResponse() {
    const responses = [
      "You're welcome! 😊 Happy to help. Let me know if you need anything else!",
      "My pleasure! 🌟 Feel free to ask if you have more questions about tours!",
      "Anytime! 🎒 Excited to help you find your perfect adventure!",
    ];
    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      tours: [],
      suggestions: [
        "Show popular tours",
        "Help me find a tour",
        "Booking info",
      ],
    };
  }

  /**
   * Goodbye response
   */
  goodbyeResponse() {
    return {
      message:
        "Goodbye! 👋 Thanks for chatting with TripMind. Have an amazing adventure! 🌍✨",
      tours: [],
      suggestions: [],
    };
  }

  /**
   * Smart search for unknown queries
   */
  async smartSearchResponse(message) {
    // Try to find relevant tours using text search
    const words = message.toLowerCase().split(/\s+/);
    const searchTerms = words.filter((w) => w.length > 3);

    let tours = [];

    // Search in tour names and summaries
    for (const term of searchTerms) {
      const found = await Tour.find({
        $or: [
          { name: { $regex: term, $options: "i" } },
          { summary: { $regex: term, $options: "i" } },
          { description: { $regex: term, $options: "i" } },
        ],
      }).limit(4);

      if (found.length > 0) {
        tours = found;
        break;
      }
    }

    if (tours.length > 0) {
      return {
        message: `🔍 Based on your query, here's what I found:`,
        tours,
        suggestions: ["Tell me more", "Different options", "Help"],
      };
    }

    // Fallback to popular tours
    return {
      message: `I'm not sure I understood that completely. 🤔 Here are some popular tours you might like, or try asking differently!`,
      tours: await this.getPopularTours(3),
      suggestions: ["Help", "Popular tours", "Budget tours", "Adventure trips"],
    };
  }

  /**
   * Extract filters from message
   */
  extractFilters(message) {
    const filters = {};

    // Price extraction
    const priceMatch = message.match(/\$(\d+)/);
    if (priceMatch) {
      filters.maxPrice = parseInt(priceMatch[1]);
    } else if (/cheap|budget/i.test(message)) {
      filters.maxPrice = 500;
    }

    // Duration extraction
    const daysMatch = message.match(/(\d+)\s*day/i);
    if (daysMatch) {
      filters.duration = parseInt(daysMatch[1]);
    }

    // Difficulty extraction
    if (/easy|beginner/i.test(message)) filters.difficulty = "easy";
    if (/medium|moderate/i.test(message)) filters.difficulty = "medium";
    if (/hard|difficult/i.test(message)) filters.difficulty = "difficult";

    return filters;
  }

  /**
   * Find tours based on filters
   */
  async findTours(filters) {
    const query = {};

    if (filters.maxPrice) {
      query.price = { $lte: filters.maxPrice };
    }

    if (filters.duration) {
      query.duration = {
        $gte: filters.duration - 2,
        $lte: filters.duration + 2,
      };
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    return await Tour.find(query)
      .sort({ ratingsAverage: -1 })
      .limit(6);
  }

  /**
   * Get popular tours
   */
  async getPopularTours(limit = 4) {
    return await Tour.find()
      .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
      .limit(limit);
  }
}

module.exports = new ChatbotEngine();
