# Partido (CRUD)

Descripción: Gestión de partidos. Al crear, valida que la `cancha` exista.

Endpoints:
- POST /partido/agregarPartido  ? Body: CreatePartidoDto
- GET /partido/obtenerPartidos
- GET /partido/obtenerPartido/:id
- PATCH /partido/actualizarPartido/:id
- DELETE /partido/eliminarPartido/:id

DTOs (CreatePartidoDto):
- descripcion: string
- fecha: string (YYYY-MM-DD)
- equipos: string[]
- idCancha: number

Notas:
- Si la cancha indicada en `idCancha` no existe, el servicio lanza `NotFoundException`.
