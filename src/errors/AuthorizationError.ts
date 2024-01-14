import BaseError from "./BaseError";

export default class AuthorizationError extends BaseError {
  statusCode: number = 401;
  name: string = "AuthorizationError";

  constructor(message?: string) {
    message = message || "invalid credentials";
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
