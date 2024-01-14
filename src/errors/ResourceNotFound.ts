import BaseError from "./BaseError";

export default class ResourceNotFound extends BaseError {
  statusCode: number = 404;
  name: string = "ResourceNotFound";

  constructor(message?: string) {
    message = message || "resource not found";
    super(message);
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, ResourceNotFound.prototype);
  }
}
