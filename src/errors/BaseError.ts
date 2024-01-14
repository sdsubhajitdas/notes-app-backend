export default class BaseError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
