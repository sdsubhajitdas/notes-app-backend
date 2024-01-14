import BaseError from "./BaseError";

export default class UserExistsError extends BaseError {
  statusCode: number = 400;
  name: string = "UserExistsError";

  constructor(message: string) {
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, UserExistsError.prototype);
  }
}
