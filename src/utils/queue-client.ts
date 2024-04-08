import { Queue } from "bullmq";
export default new Queue("logs", {
  connection: {
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
    db: process.env.REDIS_DB_INDEX
      ? parseInt(process.env.REDIS_DB_INDEX)
      : undefined,
  },
  prefix: process.env.QUEUE_PREFIX,
});
