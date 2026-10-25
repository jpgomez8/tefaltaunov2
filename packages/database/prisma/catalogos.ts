import { readFile } from "node:fs/promises";
import type { PoolClient } from "pg";

type Catalogo = { id: string; codigo: string; nombre: string; activo: boolean };
export type Catalogos = {
  paises: Catalogo[];
  regiones: (Catalogo & { pais_codigo: string })[];
  comunas: (Catalogo & { pais_codigo: string; region_codigo: string })[];
  actividades: (Catalogo & { descripcion: string | null })[];
};

export async function leerCatalogos(): Promise<Catalogos> {
  return JSON.parse(await readFile(new URL("./data/catalogos-chile.json", import.meta.url), "utf8"));
}

/** El llamador controla la transaccion: un error debe revertir el seed completo. */
export async function insertarCatalogos(client: PoolClient, datos: Catalogos) {
  const esperados = { paises: 1, regiones: 16, comunas: 346, actividades: 40 };
  for (const tabla of Object.keys(esperados) as (keyof Catalogos)[]) {
    if (datos[tabla].length !== esperados[tabla]) {
      throw new Error(`Cantidad inesperada de registros en ${tabla}`);
    }
  }

  // Evita que dos ejecuciones de este seed se intercalen.
  await client.query("SELECT pg_advisory_xact_lock(20261024, 1)");
  const insertados = { paises: 0, regiones: 0, comunas: 0, actividades: 0 };
  const paisIds = new Map<string, string>();
  const regionIds = new Map<string, string>();

  for (const pais of datos.paises) {
    const resultado = await client.query(
      `INSERT INTO public.paises (id, codigo, nombre, activo)
       VALUES ($1, $2, $3, $4) ON CONFLICT (codigo) DO NOTHING`,
      [pais.id, pais.codigo, pais.nombre, pais.activo],
    );
    insertados.paises += resultado.rowCount ?? 0;
    const existente = await client.query("SELECT id FROM public.paises WHERE codigo = $1", [pais.codigo]);
    paisIds.set(pais.codigo, existente.rows[0].id);
  }

  for (const region of datos.regiones) {
    const paisId = paisIds.get(region.pais_codigo);
    if (!paisId) throw new Error(`Pais inexistente para region ${region.codigo}`);
    const resultado = await client.query(
      `INSERT INTO public.regiones (id, pais_id, codigo, nombre, activo)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (pais_id, codigo) DO NOTHING`,
      [region.id, paisId, region.codigo, region.nombre, region.activo],
    );
    insertados.regiones += resultado.rowCount ?? 0;
    const existente = await client.query(
      "SELECT id FROM public.regiones WHERE pais_id = $1 AND codigo = $2", [paisId, region.codigo],
    );
    regionIds.set(`${region.pais_codigo}/${region.codigo}`, existente.rows[0].id);
  }

  for (const comuna of datos.comunas) {
    const regionId = regionIds.get(`${comuna.pais_codigo}/${comuna.region_codigo}`);
    if (!regionId) throw new Error(`Region inexistente para comuna ${comuna.codigo}`);
    const resultado = await client.query(
      `INSERT INTO public.comunas (id, region_id, codigo, nombre, activo)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (region_id, codigo) DO NOTHING`,
      [comuna.id, regionId, comuna.codigo, comuna.nombre, comuna.activo],
    );
    insertados.comunas += resultado.rowCount ?? 0;
  }

  for (const actividad of datos.actividades) {
    const resultado = await client.query(
      `INSERT INTO public.actividades (id, codigo, nombre, descripcion, activo)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (codigo) DO NOTHING`,
      [actividad.id, actividad.codigo, actividad.nombre, actividad.descripcion, actividad.activo],
    );
    insertados.actividades += resultado.rowCount ?? 0;
  }
  return insertados;
}
