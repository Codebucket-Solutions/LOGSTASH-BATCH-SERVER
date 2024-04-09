import express, { Request, Response } from "express";
const router = express.Router();
import { v4 } from "uuid";
import queue from "../utils/queue-client";
import logstashClient from "../utils/logstash-client";
import queueBatchProcessor from "../utils/queue-batch-processor";

type logType = {
  timestamp?: string;
  version?: string | number;
  service?: string;
  application?: string;
  environment?: string;
  logLevel?: string;
  host?: string;
  message?: string;
};

setInterval(async () => {
  await queueBatchProcessor(queue, logstashClient);
}, 1000);

router.post("/log", async (req: Request, res: Response) => {
  try {
    let apiKey = req.headers["x-api-key"];
    if (apiKey != process.env.API_KEY) {
      throw new Error("Invalid Api Key");
    }
    const { logs } = req.body;
    await queue.addBulk(
      logs.map((log: logType) => ({
        name: v4(),
        data: log,
      }))
    );
    console.log("Received %d Logs", logs.length);
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
