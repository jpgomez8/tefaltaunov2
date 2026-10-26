import { defineConfig, env } from "prisma/config";

// Configuracion exclusiva del contenedor; no carga las credenciales del host.
const url = new URL("postgresql://postgres:5432/comunidad_deportiva_dev");
url.username = "postgres";
url.password = env("MIGRATION_DB_PASSWORD");
url.searchParams.set("schema", "public");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.ts --database comunidad_deportiva_dev",
  },
  datasource: { url: url.toString() },
});
