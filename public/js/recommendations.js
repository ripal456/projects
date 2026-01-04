/* eslint-disable */

/**
 * AI Tour Recommendations - Frontend Handler
 */

// Fetch recommendations from API
export const fetchRecommendations = async (limit = 6) => {
  try {
    const res = await fetch(`/api/v1/recommendations?limit=${limit}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (data.status === "success") {
      return data.data.recommendations;
    }
    return [];
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return [];
  }
};

// Fetch similar tours
export const fetchSimilarTours = async (tourId, limit = 4) => {
  try {
    const res = await fetch(
      `/api/v1/recommendations/similar/${tourId}?limit=${limit}`
    );
    const data = await res.json();

    if (data.status === "success") {
      return data.data.tours;
    }
    return [];
  } catch (err) {
    console.error("Error fetching similar tours:", err);
    return [];
  }
};

// Render recommendation card
const createRecommendationCard = (tour) => {
  return `
    <div class="card recommendation-card">
      <div class="card__header">
        <div class="card__picture">
          <div class="card__picture-overlay">&nbsp;</div>
          <img
            src="/img/tours/${tour.imageCover}"
            alt="${tour.name}"
            class="card__picture-img"
          />
        </div>
        <h3 class="heading-tertiaryy">
          <span>${tour.name}</span>
        </h3>
      </div>
      <div class="card__details">
        <h4 class="card__sub-heading">${tour.difficulty} ${
    tour.duration
  }-day tour</h4>
        <p class="card__text">${tour.summary}</p>
        <p class="card__recommendation-reason">
          <span class="ai-badge">🤖 AI</span>
          ${tour.recommendationReason}
        </p>
        <div class="card__data">
          <span class="card__icon">📍</span>
          <span>${tour.startLocation?.description || "Various locations"}</span>
        </div>
        <div class="card__data">
          <span class="card__icon">📅</span>
          <span>${
            tour.startDates?.[0]
              ? new Date(tour.startDates[0]).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Flexible dates"
          }</span>
        </div>
        <div class="card__data">
          <span class="card__icon">🚩</span>
          <span>${tour.locations?.length || 0} stops</span>
        </div>
        <div class="card__data">
          <span class="card__icon">👥</span>
          <span>${tour.maxGroupSize} people</span>
        </div>
      </div>
      <div class="card__footer">
        <p>
          <span class="card__footer-value">$${tour.price}</span>
          <span class="card__footer-text"> per person</span>
        </p>
        <p class="card__ratings">
          <span class="card__footer-value">${tour.ratingsAverage}</span>
          <span class="card__footer-text"> rating (${
            tour.ratingsQuantity
          })</span>
        </p>
        <a href="/tour/${
          tour.slug
        }" class="btn btn--green btn--small">Details</a>
      </div>
    </div>
  `;
};

// Render recommendations section
export const renderRecommendations = async (
  containerId = "recommendations-container"
) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML =
    '<div class="loading-spinner">Loading recommendations...</div>';

  const recommendations = await fetchRecommendations();

  if (recommendations.length === 0) {
    container.innerHTML =
      '<p class="no-recommendations">No recommendations available at this time.</p>';
    return;
  }

  container.innerHTML = `
    <div class="recommendations-header">
      <h2 class="heading-secondary">
        <span class="ai-badge-large">🤖 AI Powered</span>
        Recommended For You
      </h2>
    </div>
    <div class="card-container recommendations-grid">
      ${recommendations.map((tour) => createRecommendationCard(tour)).join("")}
    </div>
  `;
};

// Render similar tours section on tour detail page
export const renderSimilarTours = async (
  tourId,
  containerId = "similar-tours-container"
) => {
  const container = document.getElementById(containerId);
  if (!container || !tourId) return;

  container.innerHTML =
    '<div class="loading-spinner">Loading similar tours...</div>';

  const similarTours = await fetchSimilarTours(tourId);

  if (similarTours.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <section class="section-similar-tours">
      <div class="recommendations-header">
        <h2 class="heading-secondary">
          <span class="ai-badge-large">🤖 AI</span>
          You Might Also Like
        </h2>
      </div>
      <div class="card-container similar-tours-grid">
        ${similarTours.map((tour) => createRecommendationCard(tour)).join("")}
      </div>
    </section>
  `;
};

// Auto-initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Load recommendations on overview page
  if (document.getElementById("recommendations-container")) {
    renderRecommendations();
  }

  // Load similar tours on tour detail page
  const tourDetailPage = document.querySelector("[data-tour-id]");
  if (tourDetailPage) {
    const tourId = tourDetailPage.dataset.tourId;
    renderSimilarTours(tourId);
  }
});
