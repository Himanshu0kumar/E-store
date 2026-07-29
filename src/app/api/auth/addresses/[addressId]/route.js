// import { connectDB } from "@/lib/db";
// import { getAuthUser } from "@/lib/auth/getAuthUser";
// import {
//   updateAddress,
//   deleteAddress,
// } from "@/services/auth.service";


// export async function PUT(req) {
//   try {
//     await connectDB();

//     const userId = await getAuthUser(req);
//     if (!userId) {
//       return Response.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const data = await req.json();
//     const { addressId } = data;

//     if (!addressId) {
//       return Response.json(
//         { success: false, error: "Address ID is required" },
//         { status: 400 }
//       );
//     }

//     const addresses = await updateAddress(userId, addressId, data);

//     return Response.json(
//       {
//         success: true,
//         data: addresses,
//         message: "Address updated successfully",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Update address error:", error);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 400 }
//     );
//   }
// }


// export async function DELETE(req) {
//   try {
//     await connectDB();

//     const userId = await getAuthUser(req);
//     if (!userId) {
//       return Response.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const addressId = searchParams.get("addressId");

//     if (!addressId) {
//       return Response.json(
//         { success: false, error: "Address ID is required" },
//         { status: 400 }
//       );
//     }

//     const addresses = await deleteAddress(userId, addressId);

//     return Response.json(
//       {
//         success: true,
//         data: addresses,
//         message: "Address deleted successfully",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Delete address error:", error);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 400 }
//     );
//   }
// }


import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { updateAddress, deleteAddress } from "@/services/auth.service";

// PUT: Update address
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const userId = await getAuthUser(req);
    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addressId } = await params;
    if (!addressId) {
      return Response.json(
        { success: false, error: "Address ID is required" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const addresses = await updateAddress(userId, addressId, data);

    return Response.json(
      {
        success: true,
        data: addresses,
        message: "Address updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update address error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE: Delete address
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const userId = await getAuthUser(req);
    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addressId } = await params;
    if (!addressId) {
      return Response.json(
        { success: false, error: "Address ID is required" },
        { status: 400 }
      );
    }

    const addresses = await deleteAddress(userId, addressId);

    return Response.json(
      {
        success: true,
        data: addresses,
        message: "Address deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete address error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}