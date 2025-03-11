import express from "express";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import dotenv from "dotenv";
import connectDB from "./config/connect.js";
import { PORT } from "./config/config.js";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

// Implement connection pooling for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const optimizedConnectDB = async (uri) => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased timeout for cold starts
    };

    cached.promise = mongoose.connect(uri, opts);
  }
  
  try {
    cached.conn = await cached.promise;
    console.log("Connected to MongoDB successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// API Routes
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const start = async () => {
  try {
    // Use the optimized connection function
    await optimizedConnectDB(process.env.MONGO_URI);
    
    // Only run the server in development mode
    if (process.env.NODE_ENV !== 'production') {
      app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Server started on http://localhost:${PORT}`);
        }
      });
    }
  } catch (error) {
    console.log("Error Starting Server ->", error);
  }
};

start();

// Export the Express app for Vercel
export default app;