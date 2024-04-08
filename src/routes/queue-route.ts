import express, { Request, Response } from "express";
const router = express.Router();
import { v4 } from "uuid";
import queue from "../utils/queue-client";
import logstashClient from "../utils/logstash-client";
import queueBatchProcessor from "../utils/queue-batch-processor";

setInterval(async () => {
  await queueBatchProcessor(queue, logstashClient);
}, 1000);

router.post("/log", async (req: Request, res: Response) => {
  try {
    const { log } = req.body;
    const job = await queue.add(v4(), log, { removeOnComplete: true });
    res.json({
      success: true,
      jobId: job.id,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
