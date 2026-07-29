import { connectDB } from "@/lib/db";
import { registerUser } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const result = await registerUser(data);

    const response = NextResponse.json(
      {
        success: true,
        data: { user: result.user },
        message: "Registration successful",
      },
      { status: 201 }
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
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}