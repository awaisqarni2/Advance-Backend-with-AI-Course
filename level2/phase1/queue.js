import { Queue } from "bullmq";
import Redis from "ioredis";

//create connnection
const connection = new Redis("redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// create queue
const emailQueue = new Queue("emailQueue", { connection });

export default emailQueue;
