import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { changePassword } from "@/services/auth.service";

export async function POST(req) {
  try {
    await connectDB();

    const userId = await getAuthUser(req);
    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      return Response.json(
        {
          success: false,
          error: "All password fields are required",
        },
        { status: 400 }
      );
    }

    const result = await changePassword(userId, data);

    return Response.json(
      {
        success: true,
        data: result,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}