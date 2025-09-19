import express from "express";
import jwt from "jsonwebtoken";
import connectMongo from "../lib/mongodb.js";
import Message from "../models/messageSchema.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = req.params;

    await connectMongo();

    const messages = await Message.find({
      $or: [
        { from: user._id, to: userId },
        { from: userId, to: user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
