
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  generateInterviewQuestions,
  getInterviewQuestions,
} = require("../controllers/questionController");

router.use(protect);

// Generate questions using Python AI
router.post(
  "/:id/generate",
  generateInterviewQuestions
);

// Get all questions
router.get(
  "/:id",
  getInterviewQuestions
);

module.exports = router;
