const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createInterview,
  getMyInterviews,
  getInterviewById,
  completeInterview,
} = require("../controllers/interviewController");
const { generateNextQuestion } = require("../services/aiService");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

router.use(protect);

router.post("/", createInterview);
router.get("/", getMyInterviews);
router.post("/:id/complete", completeInterview);
router.get("/:id", getInterviewById);

// Proxy next-question to Python AI
router.post("/:id/next-question", async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id, status: "draft" });
    if (!interview) return res.status(404).json({ success: false, message: "Active interview not found." });
    const resume = await Resume.findOne({ _id: interview.resume, user: req.user._id, isActive: true }).select("extractedText");
    const result = await generateNextQuestion({
      ...req.body,
      role: interview.jobRole,
      resume_text: resume?.extractedText || "",
      history: (req.body.history || []).slice(-12),
    });
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
