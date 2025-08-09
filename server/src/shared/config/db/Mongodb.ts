
import mongoose from "mongoose";

function connectToMongoDB() {
    mongoose
      .connect(process.env.MONGO_URI || "mongodb://localhost:27017/skillbyte")
      .then(() => console.log("Connected to MongoDB ✅🚀"))
      .catch((err) => console.error("MongoDB connection error:", err));
}

export default connectToMongoDB;
