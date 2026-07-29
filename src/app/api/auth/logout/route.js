import { connectDB } from "@/lib/db";
import { logoutUser } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const refreshToken = req.cookies.get("refreshToken")?.value;
    await logoutUser(refreshToken);

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("accessToken", { path: "/" });
    response.cookies.delete("refreshToken", { path: "/api/auth/refresh" });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}