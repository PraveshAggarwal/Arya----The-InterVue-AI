const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    order: {
      type: Number,
      required: true,
    },
    isFollowUp: {
      type: Boolean,
      default: false,
    },
    parentQuestionIndex: {
      type: Number,
      default: null,
    },
  },
  { _id: true },
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    jobDescription: {
      type: String,
      default: "",
    },

    totalQuestions: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
      index: true,
    },

    recordingPath: {
      type: String,
      default: "",
      select: false,
    },

    recordingMimeType: {
      type: String,
      default: "",
    },

    hasRecording: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

interviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Interview", interviewSchema);
