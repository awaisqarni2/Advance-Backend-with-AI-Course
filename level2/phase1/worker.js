import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { sendMail, configTransporter } from "./lib/sendMail.js";
import { transporter } from "./index.js";

//create Redis Connection
const connection = new Redis("redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

//create worker
const worker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("job started");
    const email = job.data.email;
    const otp = job.data.otp;

    await sendMail(transporter, otp, email);
    console.log("job completed");
  },
  { connection },
);
