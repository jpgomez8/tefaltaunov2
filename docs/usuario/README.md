# Módulo Usuario

Resumen:
- Endpoints CRUD: `POST /usuario`, `GET /usuario`, `GET /usuario/:id`, `PATCH /usuario/:id`, `DELETE /usuario/:id`.

DTOs:
- `CreateUsuarioDto` ? Definir campos: `correo: string`, `nombre: string`, `password?: string`, `esGoogle?: boolean`.
- `UpdateUsuarioDto` ? Extiende `CreateUsuarioDto` como `PartialType`.

Notas:
- Añadir `@ApiProperty()` a los campos del DTO para que aparezcan en Swagger.
- Actualmente los métodos del servicio son plantillas; reemplazar por la lógica real (persistencia/validaciones).
