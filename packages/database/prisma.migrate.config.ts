import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.migrations" });

const databaseUrl = new URL(
  "postgresql://127.0.0.1:5432/comunidad_deportiva_dev"
);

databaseUrl.username = "postgres";
databaseUrl.password = env("MIGRATION_DB_PASSWORD");
databaseUrl.searchParams.set("schema", "public");

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.ts --database comunidad_deportiva_dev",
  },

  datasource: {
    url: databaseUrl.toString(),
  },
});
