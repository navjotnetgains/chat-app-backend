import express from "express";
import upload from '../config/multerconfig.js';

const router = express.Router();


// routes/uploads.js or wherever you defined
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Cloudinary file:", req.file); // ⬅️ Check what's inside req.file

    // Send back useful info
    res.json({
      url: req.file?.path, // public URL
      type: req.file?.mimetype, // ← Add this
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
