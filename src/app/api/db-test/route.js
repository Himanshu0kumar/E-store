import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB connected",
      state: mongoose.connection.readyState,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}