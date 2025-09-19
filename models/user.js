import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

// Prevent OverwriteModelError in Next.js (hot-reload safe)
const User = mongoose.models.user || mongoose.model("user", UserSchema);

export default User;
