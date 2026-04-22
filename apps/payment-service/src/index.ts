import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  })
});

const start = async () => {
  try {
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
