const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

const createInterview = async (req, res) => {
  try {
    const { resumeId, jobRole, jobDescription, totalQuestions = 8 } = req.body;
    if (!resumeId || !jobRole?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({ success: false, message: "Resume, job title, and job description are required." });
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

module.exports = { createInterview, getMyInterviews, getInterviewById };
