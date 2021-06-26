import redis from 'redis';
import handy_redis from 'handy-redis';

const { RedisClient } = redis;
const { createNodeRedisClient } = handy_redis;

export default class RedisUtils {
    private redisClient: any;

    constructor() {
        const client = new RedisClient({
            host: process.env.REDIS_URL,
            port: parseInt(process.env.REDIS_PORT as string),
            password: process.env.REDIS_PASS
        })
        this.redisClient = createNodeRedisClient(client);
        this.redisClient.nodeRedis.on("connect", () => {
            console.log("Redis connection established");
        });
        this.redisClient.nodeRedis.on("error", function(error) {
            console.log(error);
        });

    }

    setData(key, value) {
        return this.redisClient.lpush(key, value);
    }

    getData(key) {
        return this.redisClient.lrange(key,0,-1);
    }

    endClient() {
        this.redisClient.nodeRedis.quit(() => console.log('Redis connection ended!'));
    }
}