import BaseError from "./BaseError";

export default class UserNotFoundError extends BaseError {
  statusCode: number = 404;
  name: string = "UserNotFoundError";

  constructor(message?: string) {
    message = message || "user not found";
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}
