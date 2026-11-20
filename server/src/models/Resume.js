
const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      default: "",
    },

    fileData: {
      type: Buffer,
      select: false,
    },

    fileHash: {
      type: String,
      default: "",
      index: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    analysisTargetRole: {
      type: String,
      default: "",
      trim: true,
    },

    analyzedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ user: 1, fileHash: 1 });

module.exports = mongoose.model("Resume", resumeSchema);
