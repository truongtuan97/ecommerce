import Fastify from "fastify";
import { uptime } from "process";

const fastify = Fastify();

const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 8001;

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    console.log(`Order service is running on port: ${PORT}`)
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();