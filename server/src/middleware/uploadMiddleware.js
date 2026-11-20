
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedTypes = {
    ".pdf": ["application/pdf"],
    ".docx": [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };

  const validMimeTypes = allowedTypes[extension];

  if (!validMimeTypes || !validMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF and DOCX files are allowed."));
  }

  cb(null, true);
};

const maxFileSize =
  Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});

module.exports = upload;
