const path = require("path");
const dotenv = require("dotenv");
const { defineConfig } = require("drizzle-kit");

dotenv.config({
  path: path.resolve(__dirname, "../../artifacts/api-server/.env"),
});

module.exports = defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "./dist",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
