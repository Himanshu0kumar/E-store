import { connectDB } from "@/lib/db";
import { refreshAccessToken } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token" },
        { status: 401 }
      );
    }

    const result = await refreshAccessToken(refreshToken);

    const response = NextResponse.json(
      { success: true, message: "Token refreshed" },
      { status: 200 }
    );

    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });

    return response;
  } catch (error) {
    const response = NextResponse.json(
      { success: false, error: "Session expired" },
      { status: 401 }
    );
    // Clear dead cookies so the browser stops sending them.
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 0,
      expires: new Date(0),
    });
    response.cookies.delete("accessToken", { path: "/" });
    response.cookies.delete("refreshToken", { path: "/api/auth/refresh" });
    return response;
  }
}