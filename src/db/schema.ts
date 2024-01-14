import { sql } from "drizzle-orm";
import { pgTable, unique, serial, varchar, integer } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey().notNull(),
    email: varchar("email").notNull(),
    password: varchar("password").notNull(),
  },
  (table) => {
    return {
      usersEmailKey: unique("users_email_key").on(table.email),
    };
  },
);

export const notes = pgTable("notes", {
  id: serial("id").primaryKey().notNull(),
  title: varchar("title").default(
    sql`to_char((CURRENT_DATE):: timestamp with time zone, 'DD-MM-YYYY':: text)`,
  ),
  body: varchar("body").notNull(),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id, { onDelete: "set null" }),
  lastUpdatedByUserId: integer("last_updated_by_user_id").notNull().references(() => users.id, { onDelete: "set null" })
});

export const usersToNotes = pgTable(
  "users_to_notes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      usersToNotesUserIdNoteIdKey: unique(
        "users_to_notes_user_id_note_id_key",
      ).on(table.userId, table.noteId),
    };
  },
);
