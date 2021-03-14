import redis from 'redis';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config();

const redisOptions = {
  url: 'redis://127.0.0.1:6379/0',
};

let client;
let asyncGet;
let asyncSet;

if (process.env.DEV) {
  client = redis.createClient(redisOptions);
  asyncGet = util.promisify(client.get).bind(client);
  asyncSet = util.promisify(client.mset).bind(client);
}
/**
 * Returns cached data or null if not cached.
 * @param {string} cacheKey Cache key to for data for
 * @returns {object} Data as the cached object, otherwise null
 */
export async function get(cacheKey) {
  // Slökkt á cache
  if (!client || !asyncGet) {
    return false;
  }

  let cached;

  try {
    cached = await asyncGet(cacheKey);
  } catch (e) {
    console.warn(`unable to get from cache, ${cacheKey}, ${e.message}`);
    return null;
  }

  if (!cached) {
    return null;
  }

  let result;

  try {
    result = JSON.parse(cached);
  } catch (e) {
    console.warn(`unable to parse cached data, ${cacheKey}, ${e.message}`);
    return null;
  }

  return result;
}

/**
 * Cache data for a specific time under a cacheKey.
 *
 * @param {string} cacheKey Cache key to cache data under
 * @param {object} data Data to cache
 * @returns {Promise<boolean>} true if data cached, otherwise false
 */
export async function set(cacheKey, data) {
  if (!client || !asyncSet) {
    return false;
  }

  try {
    await asyncSet(cacheKey, data);
  } catch (e) {
    console.warn('unable to set cache for ', cacheKey);
    return false;
  }

  return true;
}
