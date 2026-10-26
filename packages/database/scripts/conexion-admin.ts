import { config } from "dotenv";
import type { PoolConfig } from "pg";

config({ path: new URL("../.env.migrations", import.meta.url), quiet: true });

export function conexionAdmin(database: string): PoolConfig {
  if (!process.env.MIGRATION_DB_PASSWORD) throw new Error("Falta MIGRATION_DB_PASSWORD");
  const port = Number(process.env.MIGRATION_DB_PORT ?? "5432");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Puerto administrativo invalido");
  return {
    host: process.env.MIGRATION_DB_HOST ?? "127.0.0.1",
    port,
    database,
    user: process.env.MIGRATION_DB_USER ?? "postgres",
    password: process.env.MIGRATION_DB_PASSWORD,
    connectionTimeoutMillis: 5000,
  };
}
