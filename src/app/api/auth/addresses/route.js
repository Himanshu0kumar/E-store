// File: src/app/api/auth/addresses/route.js

import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getUserProfile,
} from "@/services/auth.service";

// GET: Retrieve addresses
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

    return Response.json(
      { success: true, data: user.addresses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get addresses error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST: Add new address
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

    if (!data.street || !data.city || !data.postalCode) {
      return Response.json(
        {
          success: false,
          error: "Street, city, and postal code are required",
        },
        { status: 400 }
      );
    }

    const addresses = await addAddress(userId, data);

    return Response.json(
      {
        success: true,
        data: addresses,
        message: "Address added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add address error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

