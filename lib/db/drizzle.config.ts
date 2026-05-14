import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname (works on Windows, Mac, and Linux)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from the api-server .env so you can run
// `pnpm --filter @workspace/db run push` without exporting the var manually.
dotenv.config({
  path: path.resolve(__dirname, "../../artifacts/api-server/.env"),
});

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error(
    [
      "",
      "  ERROR: DATABASE_URL is not set.",
      "",
      "  Make sure artifacts/api-server/.env exists and contains:",
      "    DATABASE_URL=postgresql://user:password@host:5432/dbname",
      "",
      "  Copy the template:  copy artifacts\\api-server\\.env.example artifacts\\api-server\\.env",
      "  Then fill in your database connection string.",
      "",
    ].join("\n"),
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
