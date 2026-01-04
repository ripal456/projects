/* eslint-disable */

/**
 * AI Chatbot Widget for TripMind
 */

class TripMindChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadGreeting();
  }

  createWidget() {
    // Create chat widget HTML
    const widgetHTML = `
      <div class="chatbot-widget" id="chatbot-widget">
        <!-- Chat Toggle Button -->
        <button class="chatbot-toggle" id="chatbot-toggle">
          <span class="chatbot-toggle-icon">💬</span>
          <span class="chatbot-toggle-close">✕</span>
        </button>

        <!-- Chat Window -->
        <div class="chatbot-window" id="chatbot-window">
          <div class="chatbot-header">
            <div class="chatbot-header-info">
              <div class="chatbot-avatar">🤖</div>
              <div class="chatbot-header-text">
                <h4>TripMind AI Assistant</h4>
                <span class="chatbot-status">Online</span>
              </div>
            </div>
            <button class="chatbot-minimize" id="chatbot-minimize">−</button>
          </div>

          <div class="chatbot-messages" id="chatbot-messages">
            <!-- Messages will be inserted here -->
          </div>

          <div class="chatbot-suggestions" id="chatbot-suggestions">
            <!-- Quick suggestions will be inserted here -->
          </div>

          <div class="chatbot-input-container">
            <input 
              type="text" 
              class="chatbot-input" 
              id="chatbot-input" 
              placeholder="Ask me about tours..."
              autocomplete="off"
            />
            <button class="chatbot-send" id="chatbot-send">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML("beforeend", widgetHTML);

    // Store references
    this.widget = document.getElementById("chatbot-widget");
    this.window = document.getElementById("chatbot-window");
    this.toggle = document.getElementById("chatbot-toggle");
    this.minimize = document.getElementById("chatbot-minimize");
    this.messagesContainer = document.getElementById("chatbot-messages");
    this.suggestionsContainer = document.getElementById("chatbot-suggestions");
    this.input = document.getElementById("chatbot-input");
    this.sendBtn = document.getElementById("chatbot-send");
  }

  attachEventListeners() {
    // Toggle chat window
    this.toggle.addEventListener("click", () => this.toggleChat());
    this.minimize.addEventListener("click", () => this.toggleChat());

    // Send message
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });

    // Suggestion clicks (delegated)
    this.suggestionsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("chatbot-suggestion")) {
        this.input.value = e.target.textContent;
        this.sendMessage();
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.widget.classList.toggle("chatbot-open", this.isOpen);

    if (this.isOpen) {
      this.input.focus();
    }
  }

  async loadGreeting() {
    try {
      const res = await fetch("/api/v1/chatbot/greeting");
      const data = await res.json();

      if (data.status === "success") {
        this.addBotMessage(
          data.data.message,
          data.data.tours,
          data.data.suggestions
        );
      }
    } catch (err) {
      this.addBotMessage(
        "👋 Hi! I'm your TripMind assistant. How can I help you find the perfect tour?",
        [],
        ["Popular tours", "Help"]
      );
    }
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    // Add user message
    this.addUserMessage(message);
    this.input.value = "";

    // Show typing indicator
    this.showTyping();

    try {
      const res = await fetch("/api/v1/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Remove typing indicator
      this.hideTyping();

      if (data.status === "success") {
        this.addBotMessage(
          data.data.message,
          data.data.tours,
          data.data.suggestions
        );
      } else {
        this.addBotMessage(
          "Sorry, I encountered an error. Please try again!",
          [],
          ["Help", "Popular tours"]
        );
      }
    } catch (err) {
      this.hideTyping();
      this.addBotMessage(
        "Connection error. Please check your internet and try again.",
        [],
        ["Try again"]
      );
    }
  }

  addUserMessage(text) {
    const messageHTML = `
      <div class="chatbot-message chatbot-message-user">
        <div class="chatbot-message-content">${this.escapeHtml(text)}</div>
      </div>
    `;
    this.messagesContainer.insertAdjacentHTML("beforeend", messageHTML);
    this.scrollToBottom();
  }

  addBotMessage(text, tours = [], suggestions = []) {
    // Format message with markdown-like syntax
    const formattedText = this.formatMessage(text);

    let messageHTML = `
      <div class="chatbot-message chatbot-message-bot">
        <div class="chatbot-message-avatar">🤖</div>
        <div class="chatbot-message-content">${formattedText}</div>
      </div>
    `;

    // Add tour cards if available
    if (tours && tours.length > 0) {
      messageHTML += `<div class="chatbot-tours">`;
      tours.forEach((tour) => {
        messageHTML += this.createTourCard(tour);
      });
      messageHTML += `</div>`;
    }

    this.messagesContainer.insertAdjacentHTML("beforeend", messageHTML);

    // Update suggestions
    this.updateSuggestions(suggestions);

    this.scrollToBottom();
  }

  createTourCard(tour) {
    return `
      <a href="/tour/${tour.slug}" class="chatbot-tour-card">
        <div class="chatbot-tour-image">
          <img src="/img/tours/${tour.imageCover}" alt="${
      tour.name
    }" onerror="this.src='/img/logo-green.png'"/>
        </div>
        <div class="chatbot-tour-info">
          <h5>${tour.name}</h5>
          <div class="chatbot-tour-meta">
            <span>⏱️ ${tour.duration} days</span>
            <span>💰 $${tour.price}</span>
            <span>⭐ ${tour.ratingsAverage || "N/A"}</span>
          </div>
        </div>
      </a>
    `;
  }

  updateSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
      this.suggestionsContainer.innerHTML = "";
      return;
    }

    const suggestionsHTML = suggestions
      .map((s) => `<button class="chatbot-suggestion">${s}</button>`)
      .join("");

    this.suggestionsContainer.innerHTML = suggestionsHTML;
  }

  showTyping() {
    const typingHTML = `
      <div class="chatbot-message chatbot-message-bot chatbot-typing" id="chatbot-typing">
        <div class="chatbot-message-avatar">🤖</div>
        <div class="chatbot-message-content">
          <div class="chatbot-typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    this.messagesContainer.insertAdjacentHTML("beforeend", typingHTML);
    this.scrollToBottom();
  }

  hideTyping() {
    const typing = document.getElementById("chatbot-typing");
    if (typing) typing.remove();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  formatMessage(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert newlines to <br>
    text = text.replace(/\n/g, "<br>");
    // Convert bullet points
    text = text.replace(/^• /gm, "&bull; ");
    return text;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.tripMindChatbot = new TripMindChatbot();
});
