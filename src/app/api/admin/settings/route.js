import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function GET(req) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await connectDB();
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings" },
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

    const allowedFields = [
      "storeName",
      "storeEmail",
      "storePhone",
      "currency",
      "taxRate",
      "shippingFee",
      "freeShippingThreshold",
      "lowStockThreshold",
      "maintenanceMode",
      "orderEmailNotifications",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (authResult.userId) {
      updates.updatedBy = authResult.userId;
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(updates);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, updates, {
        new: true,
        runValidators: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
