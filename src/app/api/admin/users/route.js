import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAllUsers, createUser } from "@/services/user.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET /api/admin/users - List users with query params
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const isVerified = searchParams.get("isVerified") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const result = await getAllUsers({
      page,
      limit,
      search,
      role,
      status,
      isVerified,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const body = await req.json();

    const newUser = await createUser(body);
    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}
