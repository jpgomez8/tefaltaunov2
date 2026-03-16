# Jugador-Partido

Descripción: Gestiona la relación entre jugadores y partidos (inscripción, eliminación, marcar asistencia y puntualidad, obtener partidos por jugador).

Endpoints:
- POST /jugador-partido/agregarJugadorPartido/:idJugador/:idPartido
- GET /jugador-partido/obtenerJugadoresPartido/:idPartido
- DELETE /jugador-partido/eliminarJugadorPartido/:idJugador/:idPartido
- PATCH /jugador-partido/marcarAsistenciaJugador/:idJugador/:idPartido  ? Body: { asistencia: boolean }
- PATCH /jugador-partido/marcarPuntualidadJugador/:idJugador/:idPartido  ? Body: { esPuntual: boolean }
- GET /jugador-partido/obtenerPartidosPorJugador/:idJugador

DTOs (CreateJugadorPartidoDto):
- idJugador: number
- idPartido: number
- asistencia?: boolean
- esPuntual?: boolean

Notas:
- Endpoints usan `ParseIntPipe` para garantizar IDs numéricos.
- Se documentó la relación en los DTOs por si se decide enviar datos en el body en vez de parámetros URL.
