import BaseError from "./BaseError";

export default class DatabaseError extends BaseError {
  statusCode: number = 500;
  name: string = "DatabaseError";

  constructor(message?: string) {
    message = message || "something went wrong";
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
