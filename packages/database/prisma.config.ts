import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = new URL("postgresql://localhost");

databaseUrl.hostname = env("DB_HOST");
databaseUrl.port = env("DB_PORT");
databaseUrl.pathname = `/${env("DB_NAME")}`;
databaseUrl.username = env("DB_USER");
databaseUrl.password = env("DB_PASSWORD");
databaseUrl.searchParams.set("schema", "public");

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: databaseUrl.toString(),
  },
});