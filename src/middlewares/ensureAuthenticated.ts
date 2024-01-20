import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import _ from "lodash";

import { verifyAccessToken } from "../utils/jwt";
import db from "../db";
import { AuthorizationError, InternalServerError } from "../errors";
import { users } from "../db/schema";

export default async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accessToken = req.get("authorization")?.split(" ")[1] || null;

  if (!accessToken) {
    return next(new AuthorizationError());
  }

  try {
    const verified = verifyAccessToken(accessToken);
    const verifiedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, verified.id))
      .limit(1);

    if (_.isEmpty(verifiedUser)) {
      return next(new AuthorizationError());
    }

    req.user = { id: verified.id, email: verified.email };
    return next();
  } catch (error: any) {
    return ["TokenExpiredError", "JsonWebTokenError"].includes(error.name)
      ? next(new AuthorizationError())
      : next(new InternalServerError());
  }
}
