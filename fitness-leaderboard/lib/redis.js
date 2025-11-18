import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

/* Helpers used by API routes */
export async function addScore(date, score, email) {
  const zkey = `scores:${date}`;
  // Upstash expects { score, member } objects for zadd via zadd(key, [{ score, member }])
  await redis.zadd(zkey, [{ score: Number(score), member: email }]);
  const hkey = `history:${email}`;
  await redis.hset(hkey, { [date]: String(score) });
  return true;
}

export async function getTodayLeaderboard(date, start = 0, stop = 99) {
  const zkey = `scores:${date}`;
  // zrevrangeWithScores returns array of { member, score }
  try {
    const resp = await redis.zrevrangeWithScores(zkey, start, stop);
    return resp || [];
  } catch (err) {
    console.error('getTodayLeaderboard error', err);
    return [];
  }
}

export async function setUserProfile(email, profileObj = {}) {
  const key = `user:${email}`;
  await redis.hset(key, profileObj);
}

export async function getUserProfile(email) {
  const key = `user:${email}`;
  const res = await redis.hgetall(key);
  // hgetall returns {} if not exist
  return res || {};
}

export async function getUserHistory(email) {
  const key = `history:${email}`;
  const res = await redis.hgetall(key);
  return res || {};
}
