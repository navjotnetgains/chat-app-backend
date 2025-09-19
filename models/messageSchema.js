// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String},
    mediaUrl:{type:String},
    mediaType:{type:String}
  },
  { timestamps: true } // adds createdAt, updatedAt
);

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
