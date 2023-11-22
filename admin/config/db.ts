// Import necessary modules
import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

export const connect = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
    } as ConnectOptions);
    console.log("Database connected successfully to admin");
  } catch (error) {
    console.error(error.message);
  }
};
