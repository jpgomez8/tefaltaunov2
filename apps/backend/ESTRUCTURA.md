# Backend API

API NestJS 12 con TypeScript y ESM, inicializada y conectada a PostgreSQL
mediante el paquete Prisma compartido. El endpoint `/health` comprueba la
conexion. La autenticacion y las operaciones deportivas siguen pendientes.

## Distribucion

- `src/config`: carga y validacion de configuracion del servidor.
- `src/common/decorators`: decoradores compartidos.
- `src/common/filters`: traduccion centralizada de errores HTTP.
- `src/common/guards`: protecciones de autenticacion y autorizacion.
- `src/common/interceptors`: comportamiento transversal de peticiones.
- `src/common/pipes`: validaciones y transformaciones compartidas.
- `src/infrastructure/database`: integracion de NestJS con Prisma.
- `src/modules/auth`: autenticacion y gestion de sesiones.
- `src/modules/health`: estado de la API y de la conexion a PostgreSQL.
- `src/modules/usuarios`: perfiles y preferencias deportivas.
- `src/modules/catalogos`: paises, regiones, comunas y actividades.
- `src/modules/lugares`: espacios para realizar actividades.
- `src/modules/encuentros`: encuentros, inscripciones y asistencia.
- `test`: pruebas de integracion y de extremo a extremo de la API.

Al implementar cada modulo, agrupar sus controladores, servicios, DTO y
pruebas dentro de ese modulo. Crear controladores y servicios a medida que
se implemente su comportamiento.

El esquema, las migraciones, los seeds y los permisos siguen en
`packages/database`. Este backend los reutilizara y se conectara mediante
`comunidad_deportiva_app`, nunca con la cuenta administrativa de migraciones.
La autorizacion de acciones por usuario se implementara en la API.
