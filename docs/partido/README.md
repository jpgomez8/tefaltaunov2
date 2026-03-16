# Módulo Partido

Resumen:
- Endpoints: `POST /partido/agregarPartido`, `GET /partido/obtenerPartidos`, `GET /partido/obtenerPartido/:id`, `PATCH /partido/actualizarPartido/:id`, `DELETE /partido/eliminarPartido/:id`.

CreatePartidoDto:
- `descripcion: string` ? ejemplo: "Partido amistoso"
- `fecha: string` ? formato `YYYY-MM-DD`, ejemplo: `2026-02-14`
- `equipos: string[]` ? ejemplo: `["Equipo A","Equipo B"]`
- `idCancha: number`

Notas:
- Al crear un partido, el servicio valida que `idCancha` exista (lanza `NotFoundException` si no).
- Retorna `Partido` creado y permite operaciones CRUD estándar.
