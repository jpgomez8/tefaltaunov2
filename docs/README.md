# Documentación del proyecto (resumen)

Esta carpeta contiene resúmenes por módulo enfocadas en la _superficie pública_ (controllers, DTOs y servicios).

Módulos documentados por ahora (archivos en `docs/`):
- `auth` ? `docs/auth.md` ? Login con Google (intercambio de id_token por JWT).
- `usuario` ? `docs/usuario.md` ? CRUD de usuarios.
- `cancha` ? `docs/cancha.md` ? CRUD de canchas (con DTOs documentados con `@ApiProperty`).
- `partido` ? `docs/partido.md` ? CRUD de partidos; valida canchas al crear.
- `invitacion` ? `docs/invitacion.md` ? Creación/aceptación/rechazo de invitaciones.
- `jugador` ? `docs/jugador.md` ? Registro y datos de jugadores.
- `jugador_partido` ? `docs/jugador_partido.md` ? Gestión de inscripciones y asistencia/puntualidad.

Siguientes pasos sugeridos:
1. Generar documentación HTML (Swagger) en ejecución y comparar con los `docs/` generados.
2. Revisar los servicios que contienen implementaciones "placeholder" (ej. `UsuarioService`) y decidir si reemplazarlos por lógica real.
3. Cuando autorices, hacer commits por módulo (convención: `docs(<module>): document <module>`).

> Nota: Se añadieron los resúmenes por módulo en `docs/`. No se realizaron commits según tu instrucción; avísame cuando quieras que haga los commits por módulo.

> Nota: No se han hecho commits de estos archivos según tu instrucción; dime cuando quieres que los commitee por módulo.

## Registro de cambios
Consulta `docs/CHANGELOG.md` para ver un resumen de lo que se agregó en esta ronda de documentación.
