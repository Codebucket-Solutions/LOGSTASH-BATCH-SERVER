import { Queue } from "bullmq";
import Logstash from "./logstash";

export default async (queue: Queue, logstash: Logstash) => {
  const jobs = await queue.getJobs(undefined, 0, -1, true);
  let jobData = "";
  for (let job of jobs) {
    jobData = jobData + JSON.stringify(job.data) + "\r\n";
  }
  if (jobData.length > 0) {
    logstash.log(jobData, async () => {
      for (let job of jobs) {
        await job.remove();
      }
    });
  }
};
