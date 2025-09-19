import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");
    const token = tokenCookie?.value;
    console.log("token",token)

    if (!token) {
      return Response.json({ user: null, token: null }, { status: 200 });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    return Response.json({ user, token }, { status: 200 });
  } catch (err) {
    console.error("Session error:", err);
    return Response.json({ user: null, token: null }, { status: 200 });
  }
}
