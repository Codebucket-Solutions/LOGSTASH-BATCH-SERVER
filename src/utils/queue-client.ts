import { Queue } from "bullmq";
const queue = new Queue("logs", {
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

async function checkQueueHealth(queue: Queue) {
  const jobCounts = await queue.getJobCounts();
  console.log("Connection Established With Redis Queue", jobCounts);
}

checkQueueHealth(queue);

export default queue;
