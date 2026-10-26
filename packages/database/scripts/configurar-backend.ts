import { readFile, writeFile } from "node:fs/promises";
import { parse } from "dotenv";

const docker = parse(await readFile(new URL("../../../.env.docker", import.meta.url), "utf8"));
if (!docker.DOCKER_APP_PASSWORD) throw new Error("Primero prepara .env.docker con npm run docker:up");

try {
  await writeFile(new URL("../../../apps/backend/.env", import.meta.url), [
    "PORT=3000", "DB_HOST=127.0.0.1", `DB_PORT=${docker.DOCKER_DB_PORT ?? "5434"}`,
    "DB_NAME=comunidad_deportiva_dev", "DB_USER=comunidad_deportiva_app",
    `DB_PASSWORD=${JSON.stringify(docker.DOCKER_APP_PASSWORD)}`, "",
  ].join("\n"), { flag: "wx", mode: 0o600 });
  console.log("Creado apps/backend/.env con el usuario limitado de Docker. Credenciales no mostradas.");
} catch (error) {
  if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
  console.log("Se conserva apps/backend/.env existente.");
}
