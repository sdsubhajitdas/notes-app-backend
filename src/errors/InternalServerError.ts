import BaseError from "./BaseError";

export default class InternalServerError extends BaseError {
  statusCode: number = 500;
  name: string = "InternalServerError";

  constructor(message?: string) {
    message = message || "something went wrong";
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
