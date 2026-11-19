const aiClient = require("../config/aiClient");
const fs = require("fs");
const FormData = require("form-data");

// Generate interview questions
const generateQuestions = async (data) => {
  const response = await aiClient.post("/api/questions/generate", data);

  return response.data;
};

// Extract resume text without resume scoring or analysis.
const parseResume = async (filePath) => {
  const form = new FormData();

  form.append("file", fs.createReadStream(filePath));

  const response = await aiClient.post("/api/resume/parse", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return response.data;
};

const analyzeResume = async (data) => {
  const response = await aiClient.post("/api/resume/analyze", data, { timeout: 180000 });
  return response.data;
};

const generateNextQuestion = async (data) => {
  const response = await aiClient.post("/api/interview/next-question", data);
  return response.data;
};

const generatePerformanceReport = async (data) => {
  const response = await aiClient.post("/api/interview/performance-report", data);
  return response.data;
};

module.exports = {
  parseResume,
  analyzeResume,
  generateQuestions,
  generateNextQuestion,
  generatePerformanceReport,
};
