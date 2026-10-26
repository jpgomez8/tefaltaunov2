import { prepararDocker } from "./preparar-docker.mjs";
import { ejecutarDocker as docker } from "./docker-command.mjs";

try {
  await prepararDocker();
  docker(["compose", "--env-file", ".env.docker", "up", "-d", "--wait", "postgres"]);
  docker(["compose", "--env-file", ".env.docker", "run", "--rm", "--build", "db-setup"]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
