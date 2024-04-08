import { Queue } from "bullmq";
import Logstash from "./logstash";

export default async (queue: Queue, logstash: Logstash) => {
  const jobs = await queue.getJobs(undefined, 0, -1, true);
  let jobData = [];
  for (let job of jobs) {
    jobData.push(job.data);
  }
  logstash.log(JSON.stringify(jobData), async () => {
    for (let job of jobs) {
      await job.remove();
    }
  });
};
