import BaseError from "./BaseError";

export default class ValidationError extends BaseError {
  statusCode: number = 400;
  name: string = "ValidationError";

  constructor(message: string) {
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
