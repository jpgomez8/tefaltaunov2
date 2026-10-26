import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { conexionAdmin } from "./conexion-admin.ts";

const database = "comunidad_deportiva_dev";
if (process.env.MIGRATION_DB_HOST !== "postgres") {
  throw new Error("Este comando es exclusivo del servicio db-setup de Docker Compose");
}
const appPassword = process.env.APP_DB_PASSWORD;
if (!appPassword) throw new Error("Falta APP_DB_PASSWORD para el contenedor");

function ejecutar(args: string[]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Fallo el paso ${args[0]}`);
}

try {
  ejecutar(["node_modules/prisma/build/index.js", "migrate", "deploy", "--config=prisma.docker.config.ts"]);
  ejecutar(["prisma/seed.ts", "--database", database]);
  ejecutar(["scripts/permisos.ts", "--database", database]);

  const admin = new pg.Pool(conexionAdmin(database));
  try {
    const client = await admin.connect();
    try {
      const result = await client.query("SELECT rolpassword IS NULL AS falta FROM pg_authid WHERE rolname = 'comunidad_deportiva_app'");
      if (result.rows[0].falta) {
        // PostgreSQL no admite parametros en ALTER ROLE. escapeLiteral evita interpolar SQL sin escapar.
        await client.query(`ALTER ROLE comunidad_deportiva_app PASSWORD ${client.escapeLiteral(appPassword)}`);
      }
      const estructura = (await client.query(`SELECT
        (SELECT count(*)::int FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations') AS tablas,
        (SELECT count(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f') AS funciones,
        (SELECT count(*)::int FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal) AS triggers,
        (SELECT count(*)::int FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND c.contype='c') AS checks`)).rows[0];
      assert.deepEqual(estructura, { tablas: 20, funciones: 5, triggers: 24, checks: 78 });
      console.log("Estructura verificada:", estructura);
    } finally { client.release(); }
  } finally { await admin.end(); }

  const app = new pg.Pool({
    host: "postgres", port: 5432, database, user: "comunidad_deportiva_app",
    password: appPassword, connectionTimeoutMillis: 5000,
  });
  try {
    const datos = (await app.query(`SELECT
      (SELECT count(*)::int FROM public.paises) AS paises,
      (SELECT count(*)::int FROM public.regiones) AS regiones,
      (SELECT count(*)::int FROM public.comunas) AS comunas,
      (SELECT count(*)::int FROM public.actividades) AS actividades,
      has_schema_privilege(current_user, 'public', 'CREATE') AS puede_crear,
      has_table_privilege(current_user, 'public._prisma_migrations', 'SELECT') AS acceso_migraciones`)).rows[0];
    assert.deepEqual(datos, { paises: 1, regiones: 16, comunas: 346, actividades: 40, puede_crear: false, acceso_migraciones: false });
    console.log("Conexion de la aplicacion y catalogos verificados:", datos);
  } finally { await app.end(); }
  console.log("Base Docker lista. PostgreSQL nativo y sus archivos .env no se han modificado.");
} catch (error) {
  console.error("No se completo la preparacion Docker:", error instanceof Error ? error.message : "Error desconocido");
  process.exitCode = 1;
}
