import { Request, Response, NextFunction } from "express";

export default function logRequests(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(`${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}
