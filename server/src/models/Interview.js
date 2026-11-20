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

    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      default: "",
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

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },

    jobDescription: {
      type: String,
      default: "",
    },

    totalQuestions: {
      type: Number,
      default: 15,
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

    transcript: {
      type: [{ question: { type: String, required: true }, answer: { type: String, required: true } }],
      default: [],
    },

    report: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: null,
      min: 0,
    },

    completedMainQuestions: {
      type: Number,
      default: 0,
      min: 0,
      max: 15,
    },

    isFullyCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

interviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Interview", interviewSchema);
