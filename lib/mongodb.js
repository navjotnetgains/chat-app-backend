// src/lib/mongodb.js
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
     tls: true,
  });
}

export default connectMongo;
