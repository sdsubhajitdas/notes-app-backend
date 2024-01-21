import BaseError from "./BaseError";

export default class RateLimitExceededError extends BaseError {
  statusCode: number = 503;
  name: string = "RateLimitExceededError";

  constructor(message?: string) {
    message = message || "rate limit exceeded";
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }
}
