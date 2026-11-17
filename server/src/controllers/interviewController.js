const mongoose = require("mongoose");
const fs = require("fs/promises");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

const removeUploadedRecording = async (file) => {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Recording cleanup error:", error.message);
  }
};

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
    const interviews = await Interview.find({ user: req.user._id }).select("-recordingPath").populate("resume", "originalName").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    console.error("Get interviews error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to retrieve interviews." });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).select("-recordingPath").populate("resume", "originalName");
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await removeUploadedRecording(req.file);
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({ _id: id, user: req.user._id }).select("+recordingPath");
    if (!interview) {
      await removeUploadedRecording(req.file);
      return res.status(404).json({ success: false, message: "Interview not found." });
    }
    if (interview.status !== "draft") {
      await removeUploadedRecording(req.file);
      return res.status(409).json({ success: false, message: "This interview has already ended." });
    }

    const completedInterview = await Interview.findOneAndUpdate(
      { _id: id, user: req.user._id, status: "draft" },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          hasRecording: Boolean(req.file),
          recordingPath: req.file?.path || "",
          recordingMimeType: req.file?.normalizedMimeType || req.file?.mimetype || "",
        },
      },
      { new: true, runValidators: true },
    );
    if (!completedInterview) {
      await removeUploadedRecording(req.file);
      return res.status(409).json({ success: false, message: "This interview has already ended." });
    }

    return res.status(200).json({
      success: true,
      message: "Interview ended successfully.",
      data: {
        interviewId: completedInterview._id,
        status: completedInterview.status,
        hasRecording: completedInterview.hasRecording,
        completedAt: completedInterview.completedAt,
      },
    });
  } catch (error) {
    await removeUploadedRecording(req.file);
    console.error("Complete interview error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to end interview." });
  }
};

const getInterviewRecording = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid interview ID." });
    }

    const interview = await Interview.findOne({ _id: id, user: req.user._id })
      .select("+recordingPath recordingMimeType hasRecording status");
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found." });
    if (interview.status !== "completed") {
      return res.status(409).json({ success: false, message: "Interview recording is not available until it has ended." });
    }
    if (!interview.hasRecording || !interview.recordingPath) {
      return res.status(404).json({ success: false, message: "No recording is available for this interview." });
    }

    return res.type(interview.recordingMimeType || "video/webm").sendFile(interview.recordingPath);
  } catch (error) {
    console.error("Get interview recording error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to retrieve interview recording." });
  }
};

module.exports = { createInterview, getMyInterviews, getInterviewById, completeInterview, getInterviewRecording };
