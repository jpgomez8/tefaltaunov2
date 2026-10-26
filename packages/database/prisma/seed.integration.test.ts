import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { config } from "dotenv";
import pg from "pg";
import { insertarCatalogos, leerCatalogos } from "./catalogos.ts";

config({ path: new URL("../.env.migrations", import.meta.url), quiet: true });

test("seed: relaciones, repeticion y conservacion de registros existentes", async () => {
  assert.ok(process.env.MIGRATION_DB_PASSWORD, "Falta la credencial administrativa local");
  const pool = new pg.Pool({
    host: "127.0.0.1", port: 5432, user: "postgres",
    database: "comunidad_deportiva_baseline_test",
    password: process.env.MIGRATION_DB_PASSWORD, connectionTimeoutMillis: 5000,
  });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '10s'");
    const datos = await leerCatalogos();
    await insertarCatalogos(client, datos);
    const conteos = await client.query(`SELECT
      (SELECT count(*)::int FROM public.paises WHERE codigo = 'CL') AS paises,
      (SELECT count(*)::int FROM public.regiones r JOIN public.paises p ON p.id = r.pais_id WHERE p.codigo = 'CL') AS regiones,
      (SELECT count(*)::int FROM public.comunas c JOIN public.regiones r ON r.id = c.region_id JOIN public.paises p ON p.id = r.pais_id WHERE p.codigo = 'CL') AS comunas,
      (SELECT count(*)::int FROM public.actividades) AS actividades`);
    assert.deepEqual(conteos.rows[0], { paises: 1, regiones: 16, comunas: 346, actividades: 40 });

    // Una edicion posterior debe sobrevivir a cualquier nueva ejecucion.
    await client.query("UPDATE public.actividades SET nombre = 'Futbol editado en prueba', activo = false WHERE codigo = 'futbol'");
    const snapshot = async () => (await client.query(`SELECT
      (SELECT jsonb_agg(to_jsonb(p) ORDER BY p.id) FROM public.paises p) AS paises,
      (SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM public.regiones r) AS regiones,
      (SELECT jsonb_agg(to_jsonb(c) ORDER BY c.id) FROM public.comunas c) AS comunas,
      (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.id) FROM public.actividades a) AS actividades`)).rows[0];
    const antes = await snapshot();
    const ninguno = { paises: 0, regiones: 0, comunas: 0, actividades: 0 };
    assert.deepEqual(await insertarCatalogos(client, datos), ninguno);
    assert.deepEqual(await snapshot(), antes, "No debe modificar IDs, fechas ni ediciones");

    // Simula una base cuyos mismos codigos tienen UUID distintos al archivo.
    const otrosIds = structuredClone(datos);
    for (const filas of Object.values(otrosIds)) {
      for (const fila of filas) fila.id = randomUUID();
    }
    assert.deepEqual(await insertarCatalogos(client, otrosIds), ninguno);
    assert.deepEqual(await snapshot(), antes, "Debe resolver relaciones mediante los codigos existentes");
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});
