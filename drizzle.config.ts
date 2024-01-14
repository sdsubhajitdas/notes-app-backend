import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  breakpoints: true,
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.PG_DB_URL || "",
    ssl: true,
  },
} satisfies Config;
