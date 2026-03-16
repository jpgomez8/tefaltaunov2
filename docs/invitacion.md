# Invitación

Descripción: Crear y gestionar invitaciones a partidos; aceptar o rechazar invitaciones.

Endpoints:
- POST /invitacion/agregarInvitacion  ? Body: CreateInvitacionDto
- GET /invitacion/obtenerInvitaciones
- GET /invitacion/obtenerInvitacion/:id
- DELETE /invitacion/eliminarInvitacion/:id
- POST /invitacion/aceptarInvitacion/:id
- POST /invitacion/rechazarInvitacion/:id

DTOs (CreateInvitacionDto):
- idJugador: number
- idPartido: number

Notas:
- `aceptarInvitacion` añade al jugador al partido (crea JugadorPartido).
- Validaciones: valida que no exista ya una invitación pendiente/aceptada para el jugador y partido.
