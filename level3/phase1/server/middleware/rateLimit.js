import { redis } from "../index.js";

//create rateLimiter middleware
const rateLimiter = async (req, res, next) => {
  const ip = req.api;
  const key = `rate-limit:${ip}`;
  const requests = await redis.incr(key);

  if (requests == 1) await redis.expire(key, 60); //key, time after 60sec
  if (requests > 5) {
    return res.status(429).json({ message: "Too many requests" });
  }

  next();
};

export default rateLimiter;
