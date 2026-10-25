import { parseArgs } from "node:util";
import pg from "pg";
import { insertarCatalogos, leerCatalogos } from "./catalogos.ts";
import { conexionAdmin } from "../scripts/conexion-admin.ts";


const { values } = parseArgs({ options: { database: { type: "string" } } });
const database = values.database;
if (!database || !["comunidad_deportiva_dev", "comunidad_deportiva_baseline_test"].includes(database)) {
  throw new Error("Indica --database comunidad_deportiva_dev o comunidad_deportiva_baseline_test");
}
if (!process.env.MIGRATION_DB_PASSWORD) {
  throw new Error("Falta MIGRATION_DB_PASSWORD en .env.migrations");
}

const pool = new pg.Pool(conexionAdmin(database));

try {
  const datos = await leerCatalogos();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '10s'");
    const insertados = await insertarCatalogos(client, datos);
    await client.query("COMMIT");
    console.log(`Seed completado en ${database}. Registros nuevos:`, insertados);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  // No imprimir la configuracion de conexion ni las credenciales.
  console.error("No se completo el seed:", error instanceof Error ? error.message : "Error desconocido");
  process.exitCode = 1;
} finally {
  await pool.end();
}
