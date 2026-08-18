import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { logoutUser } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    // Delete cookies via Next.js App Router cookies API
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Overwrite cookies cleanly with 0 maxAge to ensure browser deletes them
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

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}