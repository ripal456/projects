const ChatbotEngine = require("../utils/chatbot");
const catchAsync = require("../utils/catchAsync");

/**
 * Handle chatbot messages
 */
exports.chat = catchAsync(async (req, res, next) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a message",
    });
  }

  // Get user ID if logged in
  const userId = req.user ? req.user._id : null;

  // Process message through chatbot engine
  const response = await ChatbotEngine.processMessage(message, userId);

  res.status(200).json({
    status: "success",
    data: response,
  });
});

/**
 * Get initial chatbot greeting
 */
exports.getGreeting = catchAsync(async (req, res, next) => {
  const greeting = {
    message:
      "👋 Hi! I'm your TripMind AI assistant. I can help you find the perfect tour! Try asking me about:\n\n• Popular tours\n• Budget-friendly options\n• Adventure trips\n• Tour duration & difficulty",
    tours: [],
    suggestions: [
      "Show popular tours",
      "Tours under $500",
      "Adventure trips",
      "Help",
    ],
  };

  res.status(200).json({
    status: "success",
    data: greeting,
  });
});
