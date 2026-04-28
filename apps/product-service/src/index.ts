import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from '@clerk/express'
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRoute from './routes/product.route.js'
import categoryRoute from './routes/category.route.js'
import { consumer, producer } from "./utils/kafka.js";

const PORT = process.env.APP_PORT;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
})

app.get("/test", shouldBeUser, (req: Request, res: Response) => {  
  res.json({message: "Product service authenticated", userId: req.userId})
});

app.use("/products", productRoute);
app.use("/categories", categoryRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res.status(err.status || 500).json({message: err.message || "Internal server error"})
});

const start = async () => {
  try {
    Promise.all([await producer.connect(), await consumer.connect()]);
    app.listen(PORT, () => {
      console.log("Product service is running on: ", PORT);
    });
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
}

start();
