import Fastify from "fastify";
import { clerkPlugin } from '@clerk/fastify'
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";


const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 8001;

const fastify = Fastify();

fastify.register(clerkPlugin)

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {  
  return reply.send({message: "Order service is authenticated!", userId: request.userId});
});

fastify.register(orderRoute);

const start = async () => {
  try {    
    Promise.all([await connectOrderDB(), await producer.connect(), await consumer.connect()]);
    
    await runKafkaSubscriptions();

    await fastify.listen({ port: PORT });
    console.log(`Order service is running on port: ${PORT}`)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();