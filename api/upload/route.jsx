// app/api/upload/route.js
import cloudinary from "@/lib/cloudinary";

export const config = { api: { bodyParser: false } };

export async function POST(req) {
  try {
    const formData = await req.formData(); // Web standard FormData
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    // convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "chat-media" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });

    return new Response(JSON.stringify({ url: uploadResult.secure_url, type: uploadResult.resource_type }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
