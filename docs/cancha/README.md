# Módulo Cancha

Resumen:
- Endpoints: `POST /cancha/agregarCancha`, `GET /cancha/obtenerCanchas`, `GET /cancha/obtenerCancha/:id`, `PATCH /cancha/actualizarCancha/:id`, `DELETE /cancha/eliminarCancha/:id`.

CreateCanchaDto fields (documentados con `@ApiProperty`):
- `nombre: string` ? ejemplo: "Cancha Central"
- `ubicacion: string`
- `latitud: string`, `longitud: string`
- `valorHora: number`
- `telefono: number`
- `calificacion: number`
- `balon: boolean`

Notas:
- Servicio usa TypeORM para CRUD y retorna `Cancha` o resultados de update/delete.
