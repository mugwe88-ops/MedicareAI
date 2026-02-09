import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    process.exit();
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
  });
