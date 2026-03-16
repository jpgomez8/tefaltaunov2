# Módulo Jugador-Partido

Resumen:
- Endpoints para gestionar la relación entre jugadores y partidos (inscripción, listado, eliminación, marcar asistencia/puntualidad):
  - `POST /jugador-partido/agregarJugadorPartido/:idJugador/:idPartido`
  - `GET /jugador-partido/obtenerJugadoresPartido/:idPartido`
  - `DELETE /jugador-partido/eliminarJugadorPartido/:idJugador/:idPartido`
  - `PATCH /jugador-partido/marcarAsistenciaJugador/:idJugador/:idPartido` (body: `{ asistencia: boolean }`)
  - `PATCH /jugador-partido/marcarPuntualidadJugador/:idJugador/:idPartido` (body: `{ esPuntual: boolean }`)
  - `GET /jugador-partido/obtenerPartidosPorJugador/:idJugador`

Comportamiento:
- `agregarJugadorAPartido` valida existencia de jugador y partido, y lanza `BadRequestException` si la relación ya existe.
- `marcarAsistencia` y `marcarPuntualidad` actualizan el registro y lanzan `NotFoundException` si no existe.
