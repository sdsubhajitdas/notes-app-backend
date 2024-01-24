# Notes Application Backend

This project was done as a learning experience to get familiar with Typescript and Relational Databases.

## About the project

Introducing our Notes Sharing Application Backend—securely log in, store, and collaboratively edit notes. With a user-friendly interface, technical excellence, and real-time collaboration, our backend ensures a seamless and secure note-sharing experience.

## How to setup locally

- First install the npm packages by running the following commands

  ```
  npm install
  ```

- Setup the environment variables. We have a example environment file named `.env.example`. Copy this file and rename it to `.env`.
  `.env` file is structured as below.

  ```
  PORT=<webserver running port number>
  PG_DB_URL=<postgresql database connection string>
  REDIS_URL=<redis instance connection string>
  ACCESS_TOKEN_SECRET=<random hex string>
  REFRESH_TOKEN_SECRET=<random hex string>
  ```

  Fill the variables with the proper values.

- Setup the Postgresql database by running the following command. The following command will create all the required tables along with the foreign key constraints.

  ```
  CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" varchar NOT NULL,
    "password" varchar NOT NULL,
    CONSTRAINT "users_email_key" UNIQUE("email")
  );
  --> statement-breakpoint
  CREATE TABLE IF NOT EXISTS "notes" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT to_char((CURRENT_DATE)::timestamp with time zone, 'DD-MM-YYYY'::text),
    "body" varchar NOT NULL,
    "created_by_user_id" integer NOT NULL,
    "last_updated_by_user_id" integer NOT NULL
  );
  --> statement-breakpoint
  CREATE TABLE IF NOT EXISTS "users_to_notes" (
    "user_id" integer NOT NULL,
    "note_id" integer NOT NULL,
    CONSTRAINT "users_to_notes_user_id_note_id_key" UNIQUE("user_id","note_id")
  );
  --> statement-breakpoint
  DO $$ BEGIN
  ALTER TABLE "notes" ADD CONSTRAINT "notes_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
  WHEN duplicate_object THEN null;
  END $$;
  --> statement-breakpoint
  DO $$ BEGIN
  ALTER TABLE "notes" ADD CONSTRAINT "notes_last_updated_by_user_id_users_id_fk" FOREIGN KEY ("last_updated_by_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
  WHEN duplicate_object THEN null;
  END $$;
  --> statement-breakpoint
  DO $$ BEGIN
  ALTER TABLE "users_to_notes" ADD CONSTRAINT "users_to_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
  WHEN duplicate_object THEN null;
  END $$;
  --> statement-breakpoint
  DO $$ BEGIN
  ALTER TABLE "users_to_notes" ADD CONSTRAINT "users_to_notes_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
  WHEN duplicate_object THEN null;
  END $$;
  ```

- To run the project in dev mode run

  ```
  npm run dev
  ```
