import { connectDB } from "@/lib/db";
import { registerUser } from "@/services/auth.service";
import { signToken } from "@/lib/jwt";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const user = await registerUser(body);

    const token = signToken({ id: user._id, role: user.role });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(
      JSON.stringify({ message: "User registered" }),
      {
        status: 201,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
}