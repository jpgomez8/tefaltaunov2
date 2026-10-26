import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));

export function ejecutarDocker(args) {
  let executable = "docker";
  if (process.platform === "win32") {
    const candidatos = [
      process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Programs", "DockerDesktop", "resources", "bin", "docker.exe"),
      process.env.ProgramFiles && join(process.env.ProgramFiles, "Docker", "Docker", "resources", "bin", "docker.exe"),
    ];
    executable = candidatos.find((ruta) => ruta && existsSync(ruta)) ?? executable;
  }
  const result = spawnSync(executable, args, { cwd, stdio: "inherit" });
  if (result.error?.code === "ENOENT") throw new Error("No se encuentra Docker. Abre Docker Desktop y reinicia la terminal si lo acabas de instalar.");
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("Docker no pudo completar el paso anterior. Revisa que el motor este funcionando con contenedores Linux.");
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const acciones = {
    status: ["ps"],
    setup: ["run", "--rm", "--build", "db-setup"],
    down: ["down"],
    logs: ["logs", "--tail=80", "postgres"],
  };
  try {
    const accion = acciones[process.argv[2]];
    if (!accion) throw new Error("Accion Docker desconocida");
    ejecutarDocker(["compose", "--env-file", ".env.docker", ...accion]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
