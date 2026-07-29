import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { getUserProfile, updateUserProfile } from "@/services/auth.service";

export async function GET(req) {
  try {
    await connectDB();

    const userId = await getAuthUser(req);
    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserProfile(userId);

    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(req) {
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
    const user = await updateUserProfile(userId, data);

    return Response.json(
      { success: true, data: user, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}