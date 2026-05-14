import dotenv from "dotenv";
import path from "path";

// Load .env from the api-server directory so local `pnpm db:push` works
// without requiring a separate DATABASE_URL export in the terminal.
dotenv.config({
  path: path.resolve(__dirname, "../../artifacts/api-server/.env"),
});

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure artifacts/api-server/.env contains DATABASE_URL.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
