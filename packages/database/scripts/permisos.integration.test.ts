import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { config } from "dotenv";
import pg from "pg";

config({ path: new URL("../.env.migrations", import.meta.url), quiet: true });

test("permisos: creacion, repeticion y operaciones permitidas y denegadas", async () => {
  assert.ok(process.env.MIGRATION_DB_PASSWORD, "Falta la credencial administrativa local");
  const pool = new pg.Pool({
    host: "127.0.0.1", port: 5432, user: "postgres",
    database: "comunidad_deportiva_baseline_test",
    password: process.env.MIGRATION_DB_PASSWORD, connectionTimeoutMillis: 5000,
  });
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL lock_timeout = '10s'");
      // Un rol temporal permite probar CREATE ROLE sin tocar al usuario real.
      const rol = `prueba_permisos_${randomUUID().replaceAll("-", "")}`;
      const original = await readFile(new URL("../sql/permisos-app.sql", import.meta.url), "utf8");
      const sql = original.replaceAll("comunidad_deportiva_app", rol);
      await client.query(sql);
      const atributos = (await client.query(
        `SELECT rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolreplication,
         rolbypassrls, rolinherit, rolpassword IS NULL AS sin_password
         FROM pg_authid WHERE rolname = $1`, [rol],
      )).rows[0];
      assert.deepEqual(atributos, {
        rolcanlogin: true, rolsuper: false, rolcreatedb: false, rolcreaterole: false,
        rolreplication: false, rolbypassrls: false, rolinherit: false, sin_password: true,
      });

      const snapshot = async () => (await client.query(
        `SELECT table_name, privilege_type, is_grantable FROM information_schema.role_table_grants
         WHERE grantee = $1 AND table_schema = 'public' ORDER BY table_name, privilege_type`, [rol],
      )).rows;
      const antes = await snapshot();
      await client.query(sql);
      assert.deepEqual(await snapshot(), antes);
      assert.equal(new Set(antes.map((fila) => fila.table_name)).size, 20);

      await client.query(`SET LOCAL ROLE ${rol}`);
      assert.equal((await client.query("SELECT count(*)::int AS total FROM public.regiones")).rows[0].total, 16);
      await client.query("UPDATE public.usuarios SET nombre_publico = nombre_publico WHERE false");
      await client.query("DELETE FROM public.sesiones WHERE false");

      for (const prohibido of [
        "CREATE TABLE public.prueba_no_permitida (id integer)",
        "INSERT INTO public.actividades (codigo, nombre) SELECT 'prueba', 'Prueba' WHERE false",
        "UPDATE public.auditoria SET accion = accion WHERE false",
        "DELETE FROM public.encuentros WHERE false",
        "TRUNCATE public.auditoria",
        "SELECT * FROM public._prisma_migrations LIMIT 0",
      ]) {
        await client.query("SAVEPOINT permiso_denegado");
        await assert.rejects(client.query(prohibido), (error: unknown) =>
          error instanceof Error && "code" in error && error.code === "42501",
        );
        await client.query("ROLLBACK TO SAVEPOINT permiso_denegado");
        await client.query("RELEASE SAVEPOINT permiso_denegado");
      }
      await client.query("RESET ROLE");

      // No reutilizar silenciosamente un rol con atributos administrativos.
      await client.query(`ALTER ROLE ${rol} CREATEDB`);
      await client.query("SAVEPOINT rol_incompatible");
      await assert.rejects(client.query(sql), /atributos limitados esperados/);
      await client.query("ROLLBACK TO SAVEPOINT rol_incompatible");
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  } finally { await pool.end(); }
});
