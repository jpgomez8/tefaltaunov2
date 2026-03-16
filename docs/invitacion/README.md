# Módulo Invitación

Resumen:
- Endpoints: `POST /invitacion/agregarInvitacion`, `GET /invitacion/obtenerInvitaciones`, `GET /invitacion/obtenerInvitacion/:id`, `DELETE /invitacion/eliminarInvitacion/:id`, `POST /invitacion/aceptarInvitacion/:id`, `POST /invitacion/rechazarInvitacion/:id`.

CreateInvitacionDto:
- `idJugador: number`
- `idPartido: number`

Comportamiento:
- `create` verifica que no exista una invitación pendiente/aceptada para el mismo jugador+partido, lanza `BadRequestException` si existe.
- `aceptarInvitacion` marca como aceptada y crea un `JugadorPartido`.
- `rechazarInvitacion` marca como rechazada.
