import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URL);
    console.log(`DB connected successfully: ${db.connection.host}`);
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1); // Stop the server
  }
};
