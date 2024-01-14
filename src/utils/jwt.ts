import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { InternalServerError } from "../errors";
import { User } from "../types/types";
dotenv.config();

export function getAccessToken(user: Omit<User, "password">) {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new InternalServerError();
  }
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

export function getRefreshToken(user: Omit<User, "password">) {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new InternalServerError();
  }
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "2h",
  });
}

export function verifyAccessToken(accessToken: string) {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new InternalServerError();
  }
  return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(refreshToken: string) {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new InternalServerError();
  }
  return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
}
