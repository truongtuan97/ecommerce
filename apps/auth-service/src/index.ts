import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from '@clerk/express'
import { shouldBeAdmin } from "./middleware/authMiddleware";
import userRoute from './routes/user.route';
import { producer } from "./utils/kafka";

const PORT = process.env.APP_PORT;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3003"],
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

app.use("/users", shouldBeAdmin, userRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res.status(err.status || 500).json({message: err.message || "Internal server error"})
});

const start = async () => {
  try {    
    await producer.connect();
    app.listen(PORT, () => {
      console.log("Auth service is running on: ", PORT);
    });
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
}

start();
