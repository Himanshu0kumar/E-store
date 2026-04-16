import { verifyToken } from "@/lib/jwt";

export const isAuthenticated = (req) => {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  return verifyToken(token);
};