# Cancha (CRUD)

Descripción: Gestión de canchas (crear, listar, obtener, actualizar, eliminar).

Endpoints:
- POST /cancha/agregarCancha  ? Body: CreateCanchaDto
- GET /cancha/obtenerCanchas
- GET /cancha/obtenerCancha/:id
- PATCH /cancha/actualizarCancha/:id
- DELETE /cancha/eliminarCancha/:id

DTOs (CreateCanchaDto):
- nombre: string
- ubicacion: string
- latitud: string
- longitud: string
- valorHora: number
- telefono: number
- calificacion: number
- balon: boolean

Notas:
- Los campos están validados con `class-validator` y documentados con `@ApiProperty`.
