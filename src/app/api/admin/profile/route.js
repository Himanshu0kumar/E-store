import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function GET(req) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await connectDB();
    const user = await User.findById(authResult.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, bio, avatar, currentPassword, newPassword } = body;

    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Email uniqueness check if changing email
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email is already in use" },
          { status: 400 }
        );
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    // Handle password update if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
