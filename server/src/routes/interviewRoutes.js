const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createInterview, getMyInterviews, getInterviewById } = require("../controllers/interviewController");
const { generateNextQuestion } = require("../services/aiService");

router.use(protect);

router.post("/", createInterview);
router.get("/", getMyInterviews);
router.get("/:id", getInterviewById);

// Proxy next-question to Python AI
router.post("/:id/next-question", async (req, res) => {
  try {
    const result = await generateNextQuestion(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Failed to generate next question.",
      error: error.response?.data?.detail || error.message,
    });
  }
});

module.exports = router;
