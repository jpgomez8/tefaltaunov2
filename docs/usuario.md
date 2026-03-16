# Usuario (CRUD)

Descripción: Gestión de usuarios (crear, listar, obtener, actualizar, eliminar).

Endpoints:
- POST /usuario  ? Crea un usuario (body: CreateUsuarioDto)
- GET /usuario   ? Lista todos los usuarios
- GET /usuario/:id ? Obtiene usuario por ID
- PATCH /usuario/:id ? Actualiza usuario
- DELETE /usuario/:id ? Elimina usuario

DTOs:
- CreateUsuarioDto
  - correo: string (email, requerido)
  - nombre: string (requerido)
  - password?: string (opcional)
  - esGoogle?: boolean (opcional)
  - googleId?: string (opcional)

Notas:
- Validaciones con `class-validator` (ej. `@IsEmail`, `@IsString`).
- En el servicio actual hay implementaciones placeholder; se recomienda reemplazarlas por lógica real (hash de password, validaciones adicionales).
