import dbConnect from '@/lib/mongodb'
import Message from "@/models/messageSchema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  await dbConnect();

  try {
    // 1. Read token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify JWT
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get userId from route params
    const { userId } = params;

    // 4. Fetch messages
    const messages = await Message.find({
      $or: [
        { from: user._id, to: userId },
        { from: userId, to: user._id },
      ],
    }).sort({ createdAt: 1 });

    return Response.json({ messages });
  } catch (err) {
    console.error("Error in GET /api/messages/[userId]:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
