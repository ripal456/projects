/**
 * Sentiment Analysis Engine for TripMind Reviews
 * Analyzes review text to determine positive/negative/neutral sentiment
 */

class SentimentAnalyzer {
  constructor() {
    // Positive words with weights
    this.positiveWords = {
      // Strong positive (weight: 3)
      amazing: 3,
      excellent: 3,
      fantastic: 3,
      incredible: 3,
      outstanding: 3,
      perfect: 3,
      wonderful: 3,
      exceptional: 3,
      superb: 3,
      magnificent: 3,
      breathtaking: 3,
      unforgettable: 3,
      phenomenal: 3,
      spectacular: 3,

      // Medium positive (weight: 2)
      great: 2,
      awesome: 2,
      lovely: 2,
      beautiful: 2,
      enjoyable: 2,
      pleasant: 2,
      delightful: 2,
      impressive: 2,
      memorable: 2,
      thrilling: 2,
      exciting: 2,
      fun: 2,
      recommend: 2,
      recommended: 2,
      best: 2,
      love: 2,
      loved: 2,
      adore: 2,
      favorite: 2,
      favourite: 2,

      // Light positive (weight: 1)
      good: 1,
      nice: 1,
      fine: 1,
      okay: 1,
      decent: 1,
      satisfying: 1,
      satisfied: 1,
      happy: 1,
      pleased: 1,
      comfortable: 1,
      friendly: 1,
      helpful: 1,
      professional: 1,
      clean: 1,
      safe: 1,
      worth: 1,
      value: 1,
      easy: 1,
      smooth: 1,
      well: 1,
    };

    // Negative words with weights
    this.negativeWords = {
      // Strong negative (weight: -3)
      terrible: -3,
      horrible: -3,
      awful: -3,
      disgusting: -3,
      worst: -3,
      dreadful: -3,
      appalling: -3,
      abysmal: -3,
      nightmare: -3,
      disaster: -3,
      scam: -3,
      fraud: -3,
      dangerous: -3,
      unsafe: -3,
      waste: -3,

      // Medium negative (weight: -2)
      bad: -2,
      poor: -2,
      disappointing: -2,
      disappointed: -2,
      overpriced: -2,
      expensive: -2,
      boring: -2,
      uncomfortable: -2,
      rude: -2,
      unfriendly: -2,
      dirty: -2,
      crowded: -2,
      disorganized: -2,
      unprofessional: -2,
      late: -2,
      cancelled: -2,
      canceled: -2,
      avoid: -2,
      hate: -2,
      hated: -2,

      // Light negative (weight: -1)
      mediocre: -1,
      average: -1,
      lacking: -1,
      slow: -1,
      tired: -1,
      difficult: -1,
      hard: -1,
      confusing: -1,
      problem: -1,
      issue: -1,
      complaint: -1,
      concern: -1,
      wait: -1,
      waiting: -1,
      delay: -1,
    };

    // Intensifiers multiply the next word's score
    this.intensifiers = {
      very: 1.5,
      really: 1.5,
      extremely: 2,
      incredibly: 2,
      absolutely: 2,
      totally: 1.5,
      completely: 1.5,
      highly: 1.5,
      so: 1.3,
      too: 1.3,
      quite: 1.2,
      pretty: 1.2,
      somewhat: 0.8,
      slightly: 0.5,
      "a bit": 0.7,
    };

    // Negators flip the sentiment
    this.negators = [
      "not",
      "no",
      "never",
      "neither",
      "nobody",
      "nothing",
      "nowhere",
      "hardly",
      "barely",
      "scarcely",
      "don't",
      "doesn't",
      "didn't",
      "won't",
      "wouldn't",
      "couldn't",
      "shouldn't",
      "isn't",
      "aren't",
      "wasn't",
      "weren't",
    ];
  }

  /**
   * Analyze sentiment of a text
   * @param {String} text - The text to analyze
   * @returns {Object} - Sentiment analysis result
   */
  analyze(text) {
    if (!text || typeof text !== "string") {
      return this.createResult(0, "neutral", 0);
    }

    const cleanText = text.toLowerCase().replace(/[^\w\s'-]/g, " ");
    const words = cleanText.split(/\s+/).filter((w) => w.length > 0);

    let score = 0;
    let wordCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let intensifier = 1;
    let negation = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check for negators
      if (this.negators.includes(word)) {
        negation = true;
        continue;
      }

      // Check for intensifiers
      if (this.intensifiers[word]) {
        intensifier = this.intensifiers[word];
        continue;
      }

      // Check positive words
      if (this.positiveWords[word]) {
        let wordScore = this.positiveWords[word] * intensifier;
        if (negation) {
          wordScore = -wordScore * 0.5; // Negated positive becomes mild negative
          negativeCount++;
        } else {
          positiveCount++;
        }
        score += wordScore;
        wordCount++;
      }

      // Check negative words
      if (this.negativeWords[word]) {
        let wordScore = this.negativeWords[word] * intensifier;
        if (negation) {
          wordScore = -wordScore * 0.5; // Negated negative becomes mild positive
          positiveCount++;
        } else {
          negativeCount++;
        }
        score += wordScore;
        wordCount++;
      }

      // Reset modifiers after processing a sentiment word
      intensifier = 1;
      negation = false;
    }

    // Normalize score
    const normalizedScore = wordCount > 0 ? score / wordCount : 0;

    // Determine sentiment label
    let sentiment;
    if (normalizedScore >= 1) sentiment = "very_positive";
    else if (normalizedScore >= 0.3) sentiment = "positive";
    else if (normalizedScore <= -1) sentiment = "very_negative";
    else if (normalizedScore <= -0.3) sentiment = "negative";
    else sentiment = "neutral";

    // Calculate confidence (0-100)
    const confidence = Math.min(
      100,
      Math.round(Math.abs(normalizedScore) * 40 + wordCount * 5)
    );

    return this.createResult(normalizedScore, sentiment, confidence, {
      positiveCount,
      negativeCount,
      analyzedWords: wordCount,
    });
  }

  /**
   * Create result object
   */
  createResult(score, sentiment, confidence, details = {}) {
    const emoji = {
      very_positive: "😍",
      positive: "😊",
      neutral: "😐",
      negative: "😞",
      very_negative: "😠",
    };

    return {
      score: Math.round(score * 100) / 100,
      sentiment,
      sentimentLabel: sentiment.replace("_", " "),
      emoji: emoji[sentiment],
      confidence,
      ...details,
    };
  }

  /**
   * Analyze multiple reviews and get aggregated stats
   */
  analyzeMultiple(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        overall: "neutral",
        averageScore: 0,
        distribution: {
          very_positive: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          very_negative: 0,
        },
        highlights: { positive: [], negative: [] },
      };
    }

    const results = reviews.map((r) => ({
      ...this.analyze(r.review || r.text || r),
      originalText: r.review || r.text || r,
    }));

    const distribution = {
      very_positive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      very_negative: 0,
    };

    let totalScore = 0;

    results.forEach((r) => {
      distribution[r.sentiment]++;
      totalScore += r.score;
    });

    const averageScore = totalScore / results.length;

    // Determine overall sentiment
    let overall;
    if (averageScore >= 0.5) overall = "very_positive";
    else if (averageScore >= 0.2) overall = "positive";
    else if (averageScore <= -0.5) overall = "very_negative";
    else if (averageScore <= -0.2) overall = "negative";
    else overall = "neutral";

    // Get highlight reviews
    const sortedResults = [...results].sort((a, b) => b.score - a.score);
    const positiveHighlights = sortedResults
      .slice(0, 3)
      .filter((r) => r.score > 0);
    const negativeHighlights = sortedResults
      .slice(-3)
      .reverse()
      .filter((r) => r.score < 0);

    return {
      overall,
      averageScore: Math.round(averageScore * 100) / 100,
      totalReviews: reviews.length,
      distribution,
      distributionPercent: {
        very_positive: Math.round(
          (distribution.very_positive / reviews.length) * 100
        ),
        positive: Math.round((distribution.positive / reviews.length) * 100),
        neutral: Math.round((distribution.neutral / reviews.length) * 100),
        negative: Math.round((distribution.negative / reviews.length) * 100),
        very_negative: Math.round(
          (distribution.very_negative / reviews.length) * 100
        ),
      },
      highlights: {
        positive: positiveHighlights.map((r) =>
          r.originalText.substring(0, 100)
        ),
        negative: negativeHighlights.map((r) =>
          r.originalText.substring(0, 100)
        ),
      },
      details: results,
    };
  }

  /**
   * Check if review might be spam/fake
   */
  detectSpam(text, rating) {
    const flags = [];

    // Very short review with extreme rating
    if (text.length < 20 && (rating === 5 || rating === 1)) {
      flags.push("Very short review with extreme rating");
    }

    // All caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 10) {
      flags.push("Excessive use of capital letters");
    }

    // Excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      flags.push("Excessive exclamation marks");
    }

    // Check for repeated words
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};
    words.forEach((w) => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
    const repeatedWords = Object.values(wordCounts).filter((c) => c > 3).length;
    if (repeatedWords > 2) {
      flags.push("Excessive word repetition");
    }

    return {
      isPotentialSpam: flags.length >= 2,
      flags,
      riskLevel:
        flags.length === 0 ? "low" : flags.length === 1 ? "medium" : "high",
    };
  }
}

module.exports = new SentimentAnalyzer();
