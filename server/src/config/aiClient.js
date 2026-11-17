
const axios = require("axios");

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    "x-service-secret": process.env.AI_SERVICE_SECRET
  }
});

module.exports = aiClient;
