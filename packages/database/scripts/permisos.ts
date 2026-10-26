import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import pg from "pg";
import { conexionAdmin } from "./conexion-admin.ts";

const { values } = parseArgs({ options: { database: { type: "string" } } });
const database = values.database;
if (!database || !["comunidad_deportiva_dev", "comunidad_deportiva_baseline_test"].includes(database)) {
  throw new Error("Indica explicitamente una base de desarrollo o de prueba autorizada");
}
if (!process.env.MIGRATION_DB_PASSWORD) throw new Error("Falta MIGRATION_DB_PASSWORD en .env.migrations");

const pool = new pg.Pool(conexionAdmin(database));
try {
  const sql = await readFile(new URL("../sql/permisos-app.sql", import.meta.url), "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query(sql);
    const credencial = await client.query(
      "SELECT rolpassword IS NOT NULL AS tiene_password FROM pg_authid WHERE rolname = 'comunidad_deportiva_app'",
    );
    await client.query("COMMIT");
    console.log(`Usuario y permisos configurados en ${database}.`);
    if (!credencial.rows[0].tiene_password) {
      console.log("El rol no tiene contrasena: asignala localmente con pgAdmin o con \\password comunidad_deportiva_app en psql.");
    } else {
      console.log("La contrasena existente se ha conservado.");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
} catch (error) {
  console.error("No se configuraron los permisos:", error instanceof Error ? error.message : "Error desconocido");
  process.exitCode = 1;
} finally { await pool.end(); }
