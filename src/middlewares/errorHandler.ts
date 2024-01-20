import { Request, Response, NextFunction } from "express";
import { BaseError, InternalServerError } from "../errors";

export default function errorHandler(
  error: BaseError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!error.statusCode) error = new InternalServerError(error.message);

  if (process.env.NODE_ENV !== "test") {
    // Log the error
    console.error(
      `[${new Date().toISOString()}] ${error.name}: ${error.message}`,
    );
    if (error.stack) console.error(error.stack);
  }


  // Send a response based on the environment
  if (process.env.NODE_ENV === "production") {
    res.status(error.statusCode || 500).send({
      name: error.name,
      status: error.statusCode,
      message: error.message,
    });
  } else {
    // In development, send detailed error information
    res.status(error.statusCode || 500).send({
      name: error.name,
      status: error.statusCode,
      message: error.message,
      stack: error.stack,
    });
  }
}
