import express from "express";
import { upload, uploadToCloudinary } from "../config/multerconfig.js";

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url,type: result.resource_type + "/" + result.format, });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
