-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL
);


CREATE TABLE IF NOT EXISTS "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar DEFAULT to_char((CURRENT_DATE):: timestamp with time zone, 'DD-MM-YYYY':: text),
	"body" varchar NOT NULL
);


