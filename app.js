import express from "express";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import dotenv from "dotenv";
import connectDB from "./config/connect.js";
import { PORT } from "./config/config.js";
import { buildAdminJS } from "./config/setup.js";
import cors from "cors"

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors())

//Routes

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    // await buildAdminJS(app)
    
    // Only run the server in development mode
    if (process.env.NODE_ENV !== 'production') {
      app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Server started on http://localhost:${PORT}/admin`);
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




// const start = async () => {
//   try {

//     await connectDB(process.env.MONGO_URI)

//     await buildAdminJS(app)

//     app.listen({ port:PORT, host: "0.0.0.0" }, (err, addr) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(`Server started on http://localhost:${PORT}/admin`);
//       }
//     });
//   } catch (error) {
//     console.log("Error Starting Server ->", error);
//   }
// };

// start();

// Modify the end of your app.js file

