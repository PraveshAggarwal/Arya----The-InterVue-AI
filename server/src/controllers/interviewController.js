const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const { generatePerformanceReport } = require("../services/aiService");

const createInterview = async (req, res) => {
  try {
    const { resumeId, jobRole, experienceYears, jobDescription = "", totalQuestions = 8 } = req.body;
    const parsedExperience = Number(experienceYears);
    if (!resumeId || !jobRole?.trim() || !Number.isFinite(parsedExperience) || parsedExperience < 0) {
      return res.status(400).json({ success: false, message: "Resume, job role, and years of experience are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, message: "Invalid resume ID." });
    }
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id, isActive: true });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    const interview = await Interview.create({
      user: req.user._id,
      resume: resume._id,
      jobRole: jobRole.trim(),
      experienceYears: parsedExperience,
      jobDescription: jobDescription.trim(),
      totalQuestions,
      status: "draft",
    });
    return res.status(201).json({ success: true, message: "Interview created successfully.", data: interview });
  } catch (error) {
    console.error("Create interview error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create interview." });
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).populate("resume", "originalName").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    console.error("Get interviews error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to retrieve interviews." });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate("resume", "originalName");
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found." });
    return res.status(200).json({ success: true, data: interview });
  } catch (error) {
    const invalidId = error.name === "CastError";
    return res.status(invalidId ? 400 : 500).json({ success: false, message: invalidId ? "Invalid interview ID." : "Unable to retrieve interview." });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim().slice(0, 3000) : "";
    const transcript = Array.isArray(req.body?.transcript)
      ? req.body.transcript
        .filter((turn) => typeof turn?.question === "string" && typeof turn?.answer === "string")
        .slice(0, 20)
        .map((turn) => ({ question: turn.question.trim().slice(0, 2000), answer: turn.answer.trim().slice(0, 8000) }))
      : [];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({ _id: id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }
    if (interview.status !== "draft") {
      return res.status(409).json({ success: false, message: "This interview has already ended." });
    }

    let report;
    try {
      const result = await generatePerformanceReport({ role: interview.jobRole, transcript });
      report = result?.data || result;
    } catch (error) {
      console.error("Performance report error:", error.message);
      report = {
        overallScore: 0,
        summary: "The transcript was saved, but the performance report could not be generated.",
        strengths: [], weaknesses: [], recommendations: [],
        performance: { communication: 0, technicalSkills: 0, problemSolving: 0, confidence: 0 },
        questionReviews: transcript.map((turn) => ({ ...turn, score: 0, feedback: "No AI feedback was available." })),
      };
    }

    const completedInterview = await Interview.findOneAndUpdate(
      { _id: id, user: req.user._id, status: "draft" },
      {
        $set: {
          status: "completed",
          remarks,
          transcript,
          report,
          overallScore: report.overallScore,
          completedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );
    if (!completedInterview) {
      return res.status(409).json({ success: false, message: "This interview has already ended." });
    }

    return res.status(200).json({
      success: true,
      message: "Interview ended successfully.",
      data: {
        interviewId: completedInterview._id,
        status: completedInterview.status,
        overallScore: completedInterview.overallScore,
        completedAt: completedInterview.completedAt,
      },
    });
  } catch (error) {
    console.error("Complete interview error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to end interview." });
  }
};

module.exports = { createInterview, getMyInterviews, getInterviewById, completeInterview };
