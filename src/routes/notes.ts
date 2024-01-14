import _ from "lodash";
import { Router, Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";

import {
  AuthorizationError,
  DatabaseError,
  ResourceNotFound,
  ValidationError,
} from "../errors";
import db from "../db";
import {
  createNoteSchema,
  updateNoteSchema,
  shareNoteSchema,
} from "../utils/validation";
import { notes, users, usersToNotes } from "../db/schema";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new AuthorizationError();
    }

    const usersNotes = await db
      .select({
        id: notes.id,
        title: notes.title,
        body: notes.body,
        createdByUserId: notes.createdByUserId,
        lastUpdatedByUserId: notes.lastUpdatedByUserId,
      })
      .from(usersToNotes)
      .leftJoin(users, eq(usersToNotes.userId, users.id))
      .leftJoin(notes, eq(usersToNotes.noteId, notes.id))
      .where(eq(users.id, currentUser.id));

    return res.send(usersNotes);
  } catch (error: any) {
    next(error);
  }
});

router.get(
  "/:noteId",
  async (req: Request, res: Response, next: NextFunction) => {
    const noteId = req.params?.noteId;
    const currentUser = req.user;
    if (!currentUser) {
      throw new AuthorizationError();
    }

    try {
      if (!Number.isInteger(Number(noteId))) {
        throw new ValidationError("resource id is invalid");
      }
      const userToNote = await db
        .select()
        .from(usersToNotes)
        .where(
          and(
            eq(usersToNotes.userId, currentUser.id),
            eq(usersToNotes.noteId, parseInt(noteId)),
          ),
        );

      if (_.isEmpty(userToNote)) {
        throw new ResourceNotFound();
      }

      const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, parseInt(noteId)));

      if (_.isEmpty(note)) {
        throw new ResourceNotFound();
      }

      return res.send(note[0]);
    } catch (error: any) {
      next(error);
    }
  },
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  let validatedResult;
  try {
    validatedResult = await createNoteSchema.validate(req.body);
  } catch (error: any) {
    return next(new ValidationError(error.message));
  }
  const { title, body } = validatedResult;

  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new AuthorizationError();
    }

    const notesInDb = await db
      .insert(notes)
      .values({
        title: title || new Date().toLocaleDateString(),
        body,
        createdByUserId: currentUser.id,
        lastUpdatedByUserId: currentUser.id,
      })
      .returning({ id: notes.id, title: notes.title, body: notes.body });

    const note = notesInDb[0];
    if (!note) {
      throw new DatabaseError();
    }

    await db
      .insert(usersToNotes)
      .values({ userId: currentUser.id, noteId: note.id });

    return res.send(note);
  } catch (error: any) {
    next(error);
  }
});

router.post(
  "/share",
  async (req: Request, res: Response, next: NextFunction) => {
    let validatedResult;
    try {
      validatedResult = await shareNoteSchema.validate(req.body);
    } catch (error: any) {
      return next(new ValidationError(error.message));
    }
    const { userId, noteId } = validatedResult;

    try {
      const currentUser = req.user;
      if (!currentUser) {
        throw new AuthorizationError();
      }

      if (userId == currentUser.id) {
        throw new ValidationError("user cannot share note with itself");
      }

      // Is user having access to this note
      const hasAccess = await db
        .select()
        .from(usersToNotes)
        .where(
          and(
            eq(usersToNotes.userId, currentUser.id),
            eq(usersToNotes.noteId, noteId),
          ),
        );

      if (_.isEmpty(hasAccess)) {
        throw new ResourceNotFound();
      }

      // Is this user id valid
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (_.isEmpty(userExists)) {
        throw new ResourceNotFound();
      }

      // Is this note already shared with the requested user id
      const isShared = await db
        .select()
        .from(usersToNotes)
        .where(
          and(eq(usersToNotes.userId, userId), eq(usersToNotes.noteId, noteId)),
        );

      if (_.isEmpty(isShared)) {
        console.log(
          `Request by ${currentUser.id}:${currentUser.email}. Sharing note ${noteId} with user ${userId}`,
        );
        await db.insert(usersToNotes).values({ userId, noteId });
      }

      res.send();
    } catch (error: any) {
      next(error);
    }
  },
);

router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  let validatedResult;
  try {
    validatedResult = await updateNoteSchema.validate(req.body);
  } catch (error: any) {
    return next(new ValidationError(error.message));
  }
  const { id: currentNoteId, title, body } = validatedResult;

  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new AuthorizationError();
    }

    const hasAccess = await db
      .select()
      .from(usersToNotes)
      .where(
        and(
          eq(usersToNotes.userId, currentUser.id),
          eq(usersToNotes.noteId, currentNoteId),
        ),
      );

    if (_.isEmpty(hasAccess)) {
      throw new ResourceNotFound();
    }

    const notesInDb = await db
      .update(notes)
      .set({ title: title, body, lastUpdatedByUserId: currentUser.id })
      .where(eq(notes.id, currentNoteId))
      .returning({
        id: notes.id,
        title: notes.title,
        body: notes.body,
        createdByUserId: notes.createdByUserId,
        lastUpdatedByUserId: notes.lastUpdatedByUserId,
      });
    const note = notesInDb[0];
    if (!note) {
      throw new DatabaseError();
    }

    return res.send(note);
  } catch (error: any) {
    next(error);
  }
});

router.delete(
  "/:noteId",
  async (req: Request, res: Response, next: NextFunction) => {
    const noteId = req.params?.noteId;
    const currentUser = req.user;
    if (!currentUser) {
      throw new AuthorizationError();
    }

    try {
      if (!Number.isInteger(Number(noteId))) {
        throw new ValidationError("resource id is invalid");
      }
      const userToNote = await db
        .select()
        .from(usersToNotes)
        .where(
          and(
            eq(usersToNotes.userId, currentUser.id),
            eq(usersToNotes.noteId, parseInt(noteId)),
          ),
        );

      if (_.isEmpty(userToNote)) {
        throw new ResourceNotFound();
      }

      await db.delete(notes).where(eq(notes.id, parseInt(noteId)));

      return res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;
