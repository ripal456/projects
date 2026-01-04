const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get initial greeting
router.get('/greeting', chatbotController.getGreeting);

// Send message to chatbot (works for both logged-in and guest users)
router.post('/message', authController.isLoggedIn, chatbotController.chat);

module.exports = router;
