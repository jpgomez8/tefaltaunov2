import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export async function prepararDocker() {
  const archivo = new URL("../.env.docker", import.meta.url);
  try {
    await writeFile(archivo, [
      "# Credenciales locales generadas; no compartir ni versionar.",
      "DOCKER_DB_PORT=5434",
      `DOCKER_POSTGRES_PASSWORD=${randomBytes(32).toString("hex")}`,
      `DOCKER_APP_PASSWORD=${randomBytes(32).toString("hex")}`,
      "",
    ].join("\n"), { flag: "wx", mode: 0o600 });
    console.log("Creado .env.docker con credenciales locales independientes.");
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    console.log("Se conserva el archivo .env.docker existente.");
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await prepararDocker();
}
