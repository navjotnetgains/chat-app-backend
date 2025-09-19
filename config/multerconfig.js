import multer from "multer";
import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

const upload = multer({ storage: multer.memoryStorage() }); // store file in memory

// helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export { upload, uploadToCloudinary };
