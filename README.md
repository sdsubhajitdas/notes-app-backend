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

## Test status

The project includes some test cases which are written to test every API backend route.
Current Status of the tests

```
✓ src/tests/notes.test.ts (27) 29646ms
 ✓ src/tests/auth.test.ts (13) 8284ms

 Test Files  2 passed (2)
      Tests  40 passed (40)
   Start at  22:45:21
   Duration  30.99s (transform 393ms, setup 0ms, collect 1.99s, tests 37.93s, environment 0ms, prepare 224ms)
```

- To run the tests locally run the command below

  ```
  npm test
  ```

## Production build

To build the production version of this project run the following commands. This will convert the Typescript project to Javascript and start the express web server.

```
npm run build
npm run start
```

## Database

This project uses Postgresql to store all data and Redis to rate limit the API. I have used Neon and Upstash to host by DB and Redis instance.
Drizzle ORM was used to write data to DB in a type safe manner.

Using Drizzle ORM we can do DB migrations and introspection on the database.

```
npm run db-migrate
npm run db-introspect
```
