import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function POST(req) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in to upload files" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files"); // supports multiple files

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files provided" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" }, // organizes uploads in a Cloudinary folder
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { message: "Image upload failed" },
      { status: 500 }
    );
  }
}