/* eslint-disable */

/**
 * AI Natural Language Search for TripMind
 */

class AISearch {
  constructor() {
    this.searchInput = null;
    this.resultsContainer = null;
    this.suggestionsContainer = null;
    this.debounceTimer = null;
    this.init();
  }

  init() {
    // Check if search elements exist
    this.searchInput = document.getElementById("ai-search-input");
    this.resultsContainer = document.getElementById("ai-search-results");
    this.suggestionsContainer = document.getElementById(
      "ai-search-suggestions"
    );

    if (this.searchInput) {
      this.attachEventListeners();
    }
  }

  attachEventListeners() {
    // Search on Enter
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.performSearch();
      }
    });

    // Live suggestions on typing
    this.searchInput.addEventListener("input", () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.getSuggestions();
      }, 300);
    });

    // Search button
    const searchBtn = document.getElementById("ai-search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.performSearch());
    }

    // Close suggestions on click outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".ai-search-container")) {
        this.hideSuggestions();
      }
    });
  }

  async performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.showLoading();
    this.hideSuggestions();

    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.status === "success") {
        this.displayResults(data);
      } else {
        this.showError("Search failed. Please try again.");
      }
    } catch (err) {
      console.error("Search error:", err);
      this.showError("Connection error. Please check your internet.");
    }
  }

  async getSuggestions() {
    const query = this.searchInput.value.trim();
    if (query.length < 2) {
      this.hideSuggestions();
      return;
    }

    try {
      const res = await fetch(
        `/api/v1/search/suggestions?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.status === "success" && data.data.suggestions.length > 0) {
        this.displaySuggestions(data.data.suggestions);
      } else {
        this.hideSuggestions();
      }
    } catch (err) {
      console.error("Suggestions error:", err);
    }
  }

  displaySuggestions(suggestions) {
    if (!this.suggestionsContainer) return;

    const html = suggestions
      .map(
        (s) => `
      <div class="ai-search-suggestion" data-query="${s}">${s}</div>
    `
      )
      .join("");

    this.suggestionsContainer.innerHTML = html;
    this.suggestionsContainer.style.display = "block";

    // Click handlers for suggestions
    this.suggestionsContainer
      .querySelectorAll(".ai-search-suggestion")
      .forEach((el) => {
        el.addEventListener("click", () => {
          this.searchInput.value = el.dataset.query;
          this.hideSuggestions();
          this.performSearch();
        });
      });
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = "none";
    }
  }

  displayResults(data) {
    if (!this.resultsContainer) return;

    const { tours } = data.data;
    const summary = data.searchSummary;

    if (tours.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="ai-search-no-results">
          <h3>🔍 No tours found</h3>
          <p>Try a different search like:</p>
          <ul>
            <li>"Adventure tours under $1000"</li>
            <li>"Easy beach vacation for family"</li>
            <li>"7-day hiking trip"</li>
          </ul>
        </div>
      `;
      return;
    }

    const toursHTML = tours.map((tour) => this.createTourCard(tour)).join("");

    this.resultsContainer.innerHTML = `
      <div class="ai-search-summary">
        <span class="ai-badge">🤖 AI Search</span>
        <p>${summary}</p>
      </div>
      <div class="ai-search-results-grid">
        ${toursHTML}
      </div>
    `;
  }

  createTourCard(tour) {
    return `
      <a href="/tour/${tour.slug}" class="ai-search-tour-card">
        <div class="ai-search-tour-image">
          <img src="/img/tours/${tour.imageCover}" alt="${tour.name}" 
               onerror="this.src='/img/logo-green.png'"/>
          <span class="ai-search-tour-difficulty">${tour.difficulty}</span>
        </div>
        <div class="ai-search-tour-info">
          <h4>${tour.name}</h4>
          <p class="ai-search-tour-summary">${tour.summary.substring(
            0,
            80
          )}...</p>
          <div class="ai-search-tour-meta">
            <span>⏱️ ${tour.duration} days</span>
            <span>💰 $${tour.price}</span>
            <span>⭐ ${tour.ratingsAverage || "N/A"}</span>
          </div>
        </div>
      </a>
    `;
  }

  showLoading() {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = `
        <div class="ai-search-loading">
          <div class="ai-search-spinner"></div>
          <p>🤖 AI is searching for the best tours...</p>
        </div>
      `;
    }
  }

  showError(message) {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = `
        <div class="ai-search-error">
          <p>❌ ${message}</p>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.aiSearch = new AISearch();
});

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = AISearch;
}
