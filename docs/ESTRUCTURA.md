# Estructura para el reinicio de frontend y backend

Se retira el prototipo anterior y la referencia Git incompleta del backend.
Se conservan la base de datos de la primera fase, Docker, los catalogos,
las migraciones, los permisos y los documentos de planificacion.

```text
/
|-- apps/
|   |-- frontend/                  # Angular 22 con Tailwind
|   |   |-- public/
|   |   `-- src/
|   |       |-- environments/
|   |       `-- app/
|   |           |-- core/
|   |           |   |-- auth/
|   |           |   |-- http/
|   |           |   `-- config/
|   |           |-- layout/
|   |           |-- shared/
|   |           |   |-- ui/
|   |           |   `-- utils/
|   |           `-- features/
|   |               |-- health/
|   |               |-- auth/
|   |               |-- usuarios/
|   |               |-- catalogos/
|   |               |-- lugares/
|   |               `-- encuentros/
|   `-- backend/                   # NestJS 12, ESM y conexion Prisma
|       |-- src/
|       |   |-- config/
|       |   |-- common/
|       |   |   |-- decorators/
|       |   |   |-- filters/
|       |   |   |-- guards/
|       |   |   |-- interceptors/
|       |   |   `-- pipes/
|       |   |-- infrastructure/
|       |   |   `-- database/
|       |   `-- modules/
|       |       |-- health/
|       |       |-- auth/
|       |       |-- usuarios/
|       |       |-- catalogos/
|       |       |-- lugares/
|       |       `-- encuentros/
|       `-- test/
|-- libs/
|   `-- shared-contracts/src/      # Reserva para contratos publicos de API
|-- packages/
|   `-- database/                 # Prisma, migraciones, seeds y permisos
|-- scripts/                      # Herramientas del entorno Docker
|-- docs/                         # Planificacion y documentacion
|-- output/pdf/                   # Documentos compartibles
`-- compose.yaml                  # Entorno PostgreSQL independiente
```

## Alcance de esta reorganizacion

Angular con Tailwind y NestJS con ESM ya estan inicializados en las carpetas
`frontend` y `backend`. El backend usa `@comunidad/database` y expone `/health`
para comprobar la conexion a PostgreSQL. Los directorios reservados conservan
archivos `.gitkeep` hasta que se implemente cada funcionalidad. Angular ya
consulta `/health` y muestra el estado de los servicios. Falta Uno incluye
registro, inicio y cierre de sesión reales; ver [autenticación](auth.md).
Nx, las operaciones deportivas y la aplicación móvil siguen pendientes.

La raiz contiene comandos de infraestructura. Cada aplicacion tendra sus
dependencias y configuracion; la integracion de las herramientas de monorepo
se hara al inicializarlas, conservando estos limites de responsabilidad.

## Reglas de trabajo

1. Agrupar pantallas y logica del frontend por funcionalidad en `features`.
2. Agrupar la logica de la API por dominio en `modules`.
3. Mantener en `common` y `shared` solo elementos usados por varios modulos.
4. Mantener un unico origen de esquema y migraciones en `packages/database`.
5. Conectar el frontend a la API, nunca directamente a la base de datos.
6. Compartir contratos publicos, no modelos internos de persistencia.
7. Guardar credenciales solo en configuracion local excluida de Git.
8. Implementar primero autenticacion y el flujo de encuentros antes de
   incorporar dominios adicionales.

La documentacion antigua de futbol en `docs/` y el SQL en `sql/` son
antecedentes del prototipo: no describen una API nueva ya implementada ni
deben ejecutarse para crear el esquema actual. El origen vigente de la
estructura de datos es `packages/database/prisma/migrations`.

El prototipo anterior se puede consultar en el historial de Git; esta rama
de reinicio se separa de la entrega de la primera fase.
