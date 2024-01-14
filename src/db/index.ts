import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";
dotenv.config();

// create database connection
const connection = postgres(process.env.PG_DB_URL || "", { ssl: true });

const db = drizzle(connection);

export default db;
