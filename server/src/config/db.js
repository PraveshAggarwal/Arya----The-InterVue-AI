
const mongoose = require("mongoose");

const connectDB = async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const connection = await mongoose.connect(process.env.MONGO_URI, {
        // Some Windows networks route Atlas through NAT64 IPv6, where TLS can time out.
        family: 4,
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
      });

      console.log(`MongoDB connected: ${connection.connection.host}`);
      return connection;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed:`,
        error.message
      );

      if (attempt === maxAttempts) throw error;

      const delayMs = Math.min(1000 * 2 ** (attempt - 1), 10000);
      console.log(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = connectDB;
