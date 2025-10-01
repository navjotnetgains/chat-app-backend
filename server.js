import Websocket,{ WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import messageSchema from "./models/messageSchema.js";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/messages.js";
import uploads from "./routes/uploads.js"
import cors from "cors"; 

// ✅ Load .env file so JWT_SECRET is available


const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.ORIGIN,            // Only allow this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],         // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  credentials: true                                  // Allow cookies or other credentials
};

app.use(cors(corsOptions));



app.use(express.json());
app.use(cookieParser());



//connect mongodb
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use("/api", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", uploads);

app.get("/", (req, res) => res.send("Backend running 🚀"));


const wss = new WebSocketServer({ server });
const clients = new Map(); // store userId -> ws

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const token = params.get("token");

  let userId;
  try {
    console.log("WS JWT_SECRET:", process.env.JWT_SECRET); // debug
    console.log("Incoming token:", token); // debug

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded._id;
    clients.set(userId, ws);
    console.log("✅ User connected:", userId);
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    ws.close();
    return;
  }

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log(data)

     const newMsg = new messageSchema({
        from: data.from,
        to: data.to,
        text: data.text || null,
        mediaUrl: data.mediaUrl || null,   
        mediaType: data.mediaType || null,
      });
      await newMsg.save();

      // find recipient
      const recipientWs = clients.get(data.to);
      if (recipientWs) {
        recipientWs.send(JSON.stringify(data));
      }

      // also echo back to sender so they see their own msg
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error("Invalid message format:", err);
    }
  });

  ws.on("close", () => {
    clients.delete(userId);
    console.log("❌ User disconnected:", userId);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));