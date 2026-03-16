# Jugador

Descripción: Gestión de jugadores (registro, obtención, actualización, eliminación). Además se registra asistencia y puntualidad a nivel de la relación Jugador-Partido.

Endpoints:
- POST /jugador/agregarJugador  ? Body: CreateJugadorDto
- GET /jugador/obtenerJugadores
- GET /jugador/obtenerJugador/:id
- PATCH /jugador/actualizarJugador/:id
- DELETE /jugador/eliminarJugador/:id

DTOs (CreateJugadorDto):
- correo: string (email)
- password: string
- nombre: string
- posicion: string
- esAnonimo?: boolean
- esPuntual?: boolean
- asistencia?: boolean

Notas:
- Campos validados con `class-validator` y documentados con `@ApiProperty`.
