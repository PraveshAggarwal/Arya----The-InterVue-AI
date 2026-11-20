
const crypto = require("crypto");
const path = require("path");
const { randomUUID } = require("crypto");
const Resume = require("../models/Resume");
const { parseResume, analyzeResume } = require("../services/aiService");
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
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "Please upload a PDF or DOCX resume." });
    }

    // Hash the uploaded file buffer to detect duplicates
    const fileHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");

    // Check if the same resume was already uploaded by this user
    let existingResume = await Resume.findOne({
      user: req.user._id,
      fileHash,
      isActive: true,
    });

    // Fallback check for older records uploaded before fileHash was tracked
    if (!existingResume) {
      existingResume = await Resume.findOne({
        user: req.user._id,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        isActive: true,
      });

      if (existingResume) {
        let needsSave = false;
        if (!existingResume.fileHash) {
          existingResume.fileHash = fileHash;
          needsSave = true;
        }
        if (!existingResume.fileData) {
          existingResume.fileData = req.file.buffer;
          needsSave = true;
        }
        if (needsSave) {
          await existingResume.save();
        }
      }
    }

    // If already exists in DB, reuse the previously uploaded resume with its existing id
    if (existingResume) {
      const resumeResponse = existingResume.toObject();
      delete resumeResponse.fileData;

      return res.status(200).json({
        success: true,
        message: "Resume already exists. Using previously uploaded resume.",
        data: { resume: resumeResponse, reused: true },
      });
    }

    // Extract text from the resume buffer via AI service
    const aiResult = await parseResume(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const extension = path.extname(req.file.originalname).toLowerCase();
    const generatedFileName = `${randomUUID()}${extension}`;

    // Save only to MongoDB database (no local file storage)
    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileName: generatedFileName,
      filePath: "",
      fileData: req.file.buffer,
      fileHash,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText: aiResult.resume_text || "",
    });

    const resumeResponse = resume.toObject();
    delete resumeResponse.fileData;

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and saved to database successfully.",
      data: { resume: resumeResponse },
    });
  } catch (error) {
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
      .select("-extractedText -fileData")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to retrieve resumes." });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id, isActive: true })
      .select("-fileData");
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

const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id, isActive: true }).select("+fileData");
    if (!resume || !resume.fileData) {
      return res.status(404).json({ success: false, message: "Resume file not found in database." });
    }
    res.setHeader("Content-Type", resume.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${resume.originalName}"`);
    return res.send(resume.fileData);
  } catch (error) {
    const invalidId = error.name === "CastError";
    return res.status(invalidId ? 400 : 500).json({
      success: false,
      message: invalidId ? "Invalid resume ID." : "Unable to retrieve resume file.",
    });
  }
};

const analyzeMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id, isActive: true });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    if (!resume.extractedText?.trim()) {
      return res.status(422).json({ success: false, message: "This resume has no readable text to analyze." });
    }

    const targetRole = typeof req.body?.targetRole === "string" ? req.body.targetRole.trim().slice(0, 120) : "";
    const jobDescription = typeof req.body?.jobDescription === "string" ? req.body.jobDescription.trim().slice(0, 10000) : "";
    const result = await analyzeResume({
      resume_text: resume.extractedText.slice(0, 20000),
      target_role: targetRole,
      job_description: jobDescription,
    });
    const analysis = result?.data || result;
    resume.analysis = analysis;
    resume.analysisTargetRole = targetRole;
    resume.analyzedAt = new Date();
    await resume.save();

    return res.status(200).json({
      success: true,
      message: "Resume analysis completed.",
      data: { resumeId: resume._id, analysis, analysisTargetRole: targetRole, analyzedAt: resume.analyzedAt },
    });
  } catch (error) {
    const invalidId = error.name === "CastError";
    return res.status(invalidId ? 400 : 502).json({
      success: false,
      message: invalidId ? "Invalid resume ID." : "Resume analysis failed.",
      error: error.response?.data?.detail || error.message,
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    if (resume.filePath) {
      await deleteLocalFile(resume.filePath);
    }
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

module.exports = { uploadResume, getMyResumes, getResumeById, downloadResume, analyzeMyResume, deleteResume };
