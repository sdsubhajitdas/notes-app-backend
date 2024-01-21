import { Request, Response, NextFunction } from "express";
import redis from "../redis";
import { RateLimitExceededError } from "../errors";

export default async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ipAddress = req.header("x-forwarded-for") || req.socket.remoteAddress;
  const requestMethod = req.method;
  const apiPath = req.originalUrl;
  const uniqueRequestIdentifier = `${ipAddress} ${requestMethod} ${apiPath}`

  const requestCount = await redis.incr(uniqueRequestIdentifier);

  if (requestCount === 1) {
    await redis.expire(uniqueRequestIdentifier, 60);
  }

  // Auth API routes are allowed to be hit 15 times per minute.
  // Rest of the routes can be hit upto 100 times per minute.
  const allowedHits = apiPath.startsWith("/api/auth") ? 15 : 100;

  if (requestCount > allowedHits) {
    return next(new RateLimitExceededError(`cannot hit this api route more than ${allowedHits} times per minute`));
  }

  return next();
}
