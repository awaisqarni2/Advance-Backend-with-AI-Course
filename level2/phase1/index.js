import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import User from "./model/user.model.js";
import Redis from "ioredis";
import { configTransporter, sendMail } from "./lib/sendMail.js";
import rateLimiter from "./middleware/rateLimit.js";
import emailQueue from "./queue.js";
dotenv.config();

export const transporter = await configTransporter();
if (!transporter) {
  console.log("Failed to configure transporter. Exiting.");
  process.exit(1); // Exit the application if transporter configuration fails
}

const port = process.env.PORT || 8000;
const app = express();
export const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

app.post("/create", async (req, res) => {
  const { name, email, password } = req.body;
  await redis.del("user:all"); // delete old redis data so it get latest data after new user created
  const user = await User.create({ name, email, password });
  res.status(200).json(user);
});

app.get("/get", rateLimiter, async (req, res) => {
  const user = await User.find({});
  res.status(200).json(user);
});

app.get("/get-with-redis", rateLimiter, async (req, res) => {
  const chached = await redis.get("user:all"); //key
  if (chached) {
    const user = JSON.parse(chached); // string to json data converting
    return res.json(user); //if data found in redis then return it.
  }

  const user = await User.find({});
  await redis.set("user:all", JSON.stringify(user)); //json to string convert through .stringify, to store string (key-value) data in redis
  res.status(200).json(user);
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //add task in queue for background processing
  await emailQueue.add("send-email", { otp, email });

  await redis.set(`otp:${email}`, otp, "EX", 60); // key, value, option: expire in 30sec
  console.log("otp is: ", otp);
  res.status(200).json({ message: "OTP sent to your email" });
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const chached = await redis.get(`otp:${email}`);
  if (!chached) return res.json({ message: "opt not found or expired" });
  if (chached != otp) return res.json("your otp is not correct");

  res.status(200).json({ message: "otp is successfuly verified" });
});

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Wellcome from MERN Server" });
});

app.listen(port, () => {
  connectDB();
  console.log(`server is listening on port ${port}`);
});
