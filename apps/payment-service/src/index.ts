import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import webhookRoute from "./routes/webhooks.route.js";
import { consumer, producer } from "./utils/kafka.js";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const app = new Hono();
app.use("*", clerkMiddleware());
app.use("*", cors({origin: ["http://localhost:3002"] }))

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/test", shouldBeUser, (c) => {
  return c.json({ message: "Payment service in Authenticated!", userId: c.get("userId")});
});

app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

const start = async () => {
  try {
    Promise.all([ await producer.connect(), await consumer.connect() ]);
    await runKafkaSubscriptions();
    serve(
      {
        fetch: app.fetch,
        port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 8002,
      },
      (info) => {
        console.log(
          `Payment service is running on http://localhost:${info.port}`,
        );
      },
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
