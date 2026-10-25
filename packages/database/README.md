# Base de datos: datos iniciales y permisos

El paquete tambien exporta `PrismaClient` y `PrismaPg` como
`@comunidad/database` para el backend. `npm.cmd run build` genera el cliente
ESM y lo compila a `dist` sin necesitar credenciales de la base. El backend
usa esta dependencia local en lugar de duplicar el esquema.

`npm.cmd run backend:env` prepara el `.env` local del backend con el usuario
limitado de Docker, conservando cualquier archivo existente. Consultar las
[instrucciones del backend](../../apps/backend/README.md).

Ejecutar desde `packages/database`, con las dependencias instaladas y el esquema
creado mediante las migraciones. Requiere Node.js 24 (ejecuta estos archivos
TypeScript directamente) y PostgreSQL local en `127.0.0.1:5432`.
Para el entorno Docker independiente, ver [README de la raiz](../../README.md).

El archivo `prisma/data/catalogos-chile.json` contiene exclusivamente los
catalogos cargados y revisados durante la preparacion de la base: Chile,
16 regiones, 346 comunas y 40 actividades. Se exportaron de
`comunidad_deportiva_dev` el 24-10-2026, conservando sus UUID y los codigos de
relacion. Es una instantanea del proyecto, no una sincronizacion con una fuente
oficial en tiempo real. Las fechas se generan al insertar en cada entorno.

## Credenciales

Crear localmente `.env.migrations` con:

```dotenv
MIGRATION_DB_PASSWORD="contraseña local del usuario postgres"
```

El archivo esta excluido de Git. El seed usa la conexion administrativa porque
el usuario de la aplicacion solo tiene lectura sobre los catalogos. No cambiar
los permisos de ese usuario para ejecutar el seed.

## Comandos (PowerShell)

```powershell
# Cargar los catalogos en desarrollo mediante Prisma:
npm.cmd run seed

# Cargar los catalogos en la base de prueba ya migrada:
npm.cmd run seed:test

# Verificar relaciones, repeticion y conservacion de IDs y ediciones:
npm.cmd run test:seed
```

Los destinos estan definidos explicitamente. La prueba de integracion siempre
usa `comunidad_deportiva_baseline_test` y revierte sus cambios con ROLLBACK.
Ejecutarla en una base dedicada que contenga solo los catalogos de este proyecto.

El seed inserta primero paises, despues regiones, comunas y actividades, dentro
de una transaccion: ante un error revierte toda esa ejecucion. Busca los
registros existentes por sus claves naturales (codigo y padre), conserva sus
UUID, nombres, estados y fechas, y solo inserta los faltantes. Por tanto, volver
a ejecutarlo no duplica ni sobreescribe registros existentes. Una colision de
UUID con otro codigo produce un error y revierte la transaccion.

No elimina datos ni crea usuarios, encuentros o informacion ficticia. Para
corregir nombres o estados existentes se debe preparar un cambio de datos
explicito; editar el JSON no actualiza los registros ya cargados.

Mantener `prisma/migrations/0_init/migration.sql` sin cambios ahora que esta
registrada. Los cambios de estructura futuros requieren nuevas migraciones.

## Usuario y permisos reproducibles

Despues de aplicar las migraciones y cargar los catalogos, ejecutar:

```powershell
# Configurar el usuario de la aplicacion en desarrollo:
npm.cmd run db:permissions

# Aplicar la misma politica en la base de prueba:
npm.cmd run db:permissions:test

# Probar la creacion y los permisos con un rol temporal y ROLLBACK:
npm.cmd run test:permissions
```

El ejecutor `scripts/permisos.ts` carga la credencial administrativa desde
`.env.migrations` y ejecuta `sql/permisos-app.sql` dentro de una transaccion.
Si algo falla, revierte la configuracion completa de esa ejecucion.
Los destinos permitidos son las bases locales de desarrollo y de prueba.
El seed y el ejecutor de permisos admiten `MIGRATION_DB_HOST`,
`MIGRATION_DB_PORT` y `MIGRATION_DB_USER`; sus valores predeterminados son
`127.0.0.1`, `5432` y `postgres`. Compose los configura para su propia red.
La configuracion Prisma Docker es independiente de la configuracion nativa.

El script crea `comunidad_deportiva_app` si falta, sin contrasena inicial.
Si ya existe, conserva su contrasena y verifica que no sea administrador,
propietario de los objetos del proyecto ni miembro de otros roles. El rol es
global al servidor PostgreSQL; los permisos de objetos se configuran solamente
en la base seleccionada. No modifica los datos de las tablas.

En un equipo nuevo, asignar la contrasena localmente en pgAdmin:
**PostgreSQL 18 > Login/Group Roles > comunidad_deportiva_app > Properties >
Definition > Password > Save**. Otra opcion es el comando interactivo de psql
`\password comunidad_deportiva_app`. No escribir la contrasena en archivos SQL,
comandos de consola ni archivos versionados. Configurar despues el `.env`
local de la aplicacion con ese usuario y su contrasena.

| Objetos | Permisos de la aplicacion |
| --- | --- |
| paises, regiones, comunas, actividades | SELECT |
| Las 15 tablas operativas | SELECT, INSERT, UPDATE |
| identidades_autenticacion, sesiones, preferencias_deportivas, disponibilidades_intencion, notificaciones | Ademas DELETE |
| auditoria | SELECT, INSERT |
| _prisma_migrations y futuras tablas | Sin acceso concedido por este script |

No concede CREATE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ni opciones para
delegar permisos. Comprueba los permisos efectivos de las tablas actuales y
detiene la transaccion si hay permisos adicionales a traves de PUBLIC.
No cambia los permisos de PUBLIC ni de otros usuarios. Los privilegios
generales preexistentes del servidor (como TEMPORARY concedido a PUBLIC) no
son objeto de este script. Las funciones trigger conservan la configuracion
de las migraciones.

Las tablas nuevas necesitan permisos explicitos segun su funcion: no se usa
un GRANT automatico para todas las tablas futuras que pudiera exponer el
historial de migraciones o conceder escritura sobre catalogos.
Los permisos por usuario de la aplicacion (por ejemplo, quien puede modificar
un encuentro) todavia deben implementarse en el backend.

El SQL tambien puede ejecutarse en Query Tool, conectado como `postgres`
a la base de desarrollo o de prueba: envolver el archivo completo en `BEGIN;`
y `COMMIT;`. No ejecutar partes sueltas, para conservar la atomicidad.
