import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import _ from "lodash";

import db from "../db";
import { getAccessToken, getRefreshToken } from "../utils/jwt";
import { loginSchema, signupSchema } from "../utils/validation";
import { users } from "../db/schema";
import {
  AuthorizationError,
  InternalServerError,
  UserExistsError,
  UserNotFoundError,
  ValidationError,
} from "../errors";

const router = Router();

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    let validatedResult;
    try {
      validatedResult = await loginSchema.validate(req.body);
    } catch (error: any) {
      return next(new ValidationError(error.message));
    }
    const { email, password } = validatedResult;
    try {
      // Searching for existing users in DB
      const userFromDb = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (_.isEmpty(userFromDb)) {
        throw new UserNotFoundError();
      }

      let user = userFromDb[0];
      // Comparing if the passwords match or not.
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        throw new AuthorizationError();
      }

      const accessToken = getAccessToken({ id: user.id, email: user.email });
      const refreshToken = getRefreshToken({ id: user.id, email: user.email });

      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 5400000,
          path: "/",
        })
        .send({ id: user.id, email: user.email, accessToken });
    } catch (error: any) {
      return next(error);
    }
  },
);

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    let validatedResult;
    try {
      validatedResult = await signupSchema.validate(req.body);
    } catch (error: any) {
      return next(new ValidationError(error.message));
    }
    const { email, password } = validatedResult;

    try {
      // Searching for existing users in DB
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!_.isEmpty(existingUser)) {
        throw new UserExistsError(`user \"${email}\" already exists`);
      }

      // Saving the user in DB
      let savedDbRecord = await db
        .insert(users)
        .values({
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
        })
        .returning({ id: users.id, email: users.email });

      let savedUser = savedDbRecord[0];
      if (!savedUser) throw new InternalServerError();

      const accessToken = getAccessToken(savedUser);
      const refreshToken = getRefreshToken(savedUser);

      res
        .status(201)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 5400000,
          path: "/",
        })
        .send({ ...savedUser, accessToken });
    } catch (error: any) {
      return next(error);
    }
  },
);

export default router;
