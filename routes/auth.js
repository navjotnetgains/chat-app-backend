import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // use if passwords are hashed
import User from "../models/user.js";   // adjust path if needed
import connectMongo from "../lib/mongodb.js"; // adjust path if needed

const router = express.Router();

// ✅ POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Enter email and password" });
    }

    try {
  await connectMongo();
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
  return res.status(500).json({ message: "Database connection failed" });
}
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: If passwords are hashed in DB, use bcrypt
    // const valid = await bcrypt.compare(password, user.password);
    // if (!valid) return res.status(401).json({ message: "Invalid password" });

    // ✅ Generate JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.SECURE, // 🔑 set to true in production (HTTPS)
      sameSite: process.env.SAMESITE, // 🔑 allow frontend (localhost:3000) to receive cookie
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 year
      path: "/",
    });

    return res.status(200).json({
      message: "User successfully logged in",
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Enter all fields" });
    }

    await connectMongo();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // TODO: hash password before save
    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password, // change to hashedPassword if using bcrypt
    });

    await newUser.save();

    return res.status(201).json({ message: "User successfully signed up" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/users", async (req, res) => {
  try {
    await connectMongo();
    const users = await User.find().select("-password"); // exclude passwords
    return res.status(200).json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Cannot find users", error: err.message });
  }
});

// ✅ GET /api/session
router.get("/session", async (req, res) => {
  try {
    const token = await req.cookies.token;
    console.log(token)
    if (!token) {
      return res.status(200).json({ user: null, token: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectMongo();
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(200).json({ user: null, token: null });
    }

    return res.status(200).json({ user, token });
  } catch (err) {
    console.error("Session error:", err.message);
    return res.status(200).json({ user: null, token: null });
  }
});

export default router;
