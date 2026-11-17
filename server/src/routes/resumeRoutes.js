
const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

const {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeController");

// All routes require authentication
router.use(protect);

// POST /api/resumes/upload
router.post("/upload", upload.single("resume"), uploadResume);

// GET /api/resumes
router.get("/", getMyResumes);

// GET /api/resumes/:id
router.get("/:id", getResumeById);

// DELETE /api/resumes/:id
router.delete("/:id", deleteResume);

module.exports = router;
