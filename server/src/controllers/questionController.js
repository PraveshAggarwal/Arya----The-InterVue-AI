
const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const { generateQuestions } = require("../services/aiService");

const extractQuestions = (result) => {
  const questions =
    result?.questions ||
    result?.data?.questions ||
    result?.result?.questions ||
    (Array.isArray(result) ? result : null);

  if (!Array.isArray(questions)) {
    throw new Error("Python AI service did not return a valid questions array.");
  }

  return questions
    .map((item, index) => {
      const questionText =
        typeof item === "string"
          ? item
          : item.questionText || item.question_text || item.question || item.text;

      if (!questionText || typeof questionText !== "string") return null;

      const rawDifficulty = typeof item === "object" ? item.difficulty : "medium";
      const difficulty = ["easy", "medium", "hard"].includes(String(rawDifficulty).toLowerCase())
        ? String(rawDifficulty).toLowerCase()
        : "medium";

      return {
        questionText: questionText.trim(),
        category: typeof item === "object" ? item.category || item.type || "General" : "General",
        difficulty,
        order: index + 1,
      };
    })
    .filter(Boolean);
};

const generateInterviewQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({ _id: id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    if (interview.status !== "draft") {
      return res.status(400).json({ success: false, message: "Questions cannot be regenerated for this interview." });
    }

    const resume = await Resume.findOne({ _id: interview.resume, user: req.user._id, isActive: true });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Associated resume not found." });
    }

    const aiPayload = {
      role: interview.jobRole,
      experience: "Mid Level",
      difficulty: "medium",
      total_questions: Math.min(Math.max(interview.totalQuestions, 5), 20),
      resume_text: resume.extractedText || "",
      skills: [],
    };

    const aiResult = await generateQuestions(aiPayload);
    const questions = extractQuestions(aiResult);

    if (!questions.length) {
      return res.status(502).json({ success: false, message: "AI service did not generate usable questions." });
    }

    if (questions.length > interview.totalQuestions) {
      questions.length = interview.totalQuestions;
      questions.forEach((q, i) => { q.order = i + 1; });
    }

    interview.questions = questions;
    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview questions generated successfully.",
      count: questions.length,
      data: { interviewId: interview._id, questions: interview.questions },
    });
  } catch (error) {
    console.error("Question generation error:", error.message);
    return res.status(error.response ? 502 : 500).json({
      success: false,
      message: "Unable to generate interview questions.",
      error: error.response?.data?.detail || error.response?.data?.message || error.message,
    });
  }
};

const getInterviewQuestions = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
      .select("questions totalQuestions status");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    return res.status(200).json({
      success: true,
      count: interview.questions.length,
      data: { questions: interview.questions, totalQuestions: interview.totalQuestions, status: interview.status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to retrieve interview questions." });
  }
};

module.exports = { generateInterviewQuestions, getInterviewQuestions };
