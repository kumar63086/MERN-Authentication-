import { createClient } from "redis";
import dotenv from "dotenv"
dotenv.config()

const redisUrl = process.env.REDIS_URL 


if (!redisUrl) {
  console.log("❌ Missing Redis URL");
  process.exit(1)
}

export const redis = createClient({ url: redisUrl });

redis.on("error", (err) => console.error("❌ Redis Error:", err));
redis.on("connect", () => console.log("🚀 Redis Connected Successfully!"));

const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error);
  }
};

connectRedis();

export default redis;
