
const Resume = require("../models/Resume");
const { parseResume } = require("../services/aiService");
const fs = require("fs/promises");

const deleteLocalFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") console.error("File deletion error:", error.message);
  }
};

const uploadResume = async (req, res) => {
  let uploadedFilePath;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF or DOCX resume." });
    }

    uploadedFilePath = req.file.path;

    const aiResult = await parseResume(uploadedFilePath);

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: uploadedFilePath,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText: aiResult.resume_text || "",
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully.",
      data: { resume },
    });
  } catch (error) {
    await deleteLocalFile(uploadedFilePath);
    console.error("Resume upload error:", error.message);
    return res.status(502).json({
      success: false,
      message: "Resume upload or parsing failed.",
      error: error.response?.data?.detail || error.message,
    });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id, isActive: true })
      .select("-extractedText")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to retrieve resumes." });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id, isActive: true });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    const invalidId = error.name === "CastError";
    return res.status(invalidId ? 400 : 500).json({
      success: false,
      message: invalidId ? "Invalid resume ID." : "Unable to retrieve resume.",
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    await deleteLocalFile(resume.filePath);
    await resume.deleteOne();
    return res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    const invalidId = error.name === "CastError";
    return res.status(invalidId ? 400 : 500).json({
      success: false,
      message: invalidId ? "Invalid resume ID." : "Unable to delete resume.",
    });
  }
};

module.exports = { uploadResume, getMyResumes, getResumeById, deleteResume };
