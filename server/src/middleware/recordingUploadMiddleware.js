const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const recordingDirectory = path.join(process.cwd(), "uploads", "recordings");
fs.mkdirSync(recordingDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `recording-${randomUUID()}${ext}`);
  },
});

const maxFileSize = Number(process.env.MAX_RECORDING_SIZE_MB || 200) * 1024 * 1024;

const recordingUpload = multer({
  storage,
  limits: { fileSize: maxFileSize },
});

module.exports = recordingUpload;
