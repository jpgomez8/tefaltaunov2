# Falta Uno

Proyecto en desarrollo para organizar encuentros y actividades deportivas.
El prototipo anterior se retiro para iniciar una nueva implementacion.
`apps/frontend` contiene Angular 22 con Tailwind y `apps/backend` contiene
NestJS 12 con ESM. El backend se conecta mediante Prisma al PostgreSQL de
Docker y ofrece `GET /health` para verificar la conexion. Angular consulta ese
endpoint y muestra el estado de la API y PostgreSQL, con manejo de errores y
reintento. Incluye registro, inicio y cierre de sesión con persistencia real.
Los encuentros deportivos siguen pendientes.
El paquete de base de datos conserva las migraciones, catalogos y permisos.
Compose prepara PostgreSQL; por ahora Angular y NestJS se ejecutan en el equipo.

El nombre previsto de la carpeta es `Project-05-Falta-Uno-Octubre-2026`.
Si Windows mantiene la carpeta original en uso, cerrar VS Code y ejecutar
`scripts/renombrar-proyecto.ps1` desde una ventana externa de PowerShell.
El script renombra la carpeta y repara el enlace local de `@comunidad/database`.
La marca visible es **Falta Uno**. Los nombres técnicos existentes de bases,
volúmenes Docker y paquetes compartidos se conservan para mantener los datos.

Rutas web: `/registro`, `/iniciar-sesion` y `/estado` (diagnóstico).
Consulta [autenticación](docs/auth.md) para conocer el alcance y las pruebas.

Consultar la [estructura del proyecto](docs/ESTRUCTURA.md) antes de empezar
a implementar las aplicaciones.

La [primera fase](docs/FASE-1.md) detalla el trabajo realizado, las
verificaciones y los siguientes pasos. La vision del producto esta en la
[propuesta](docs/propuesta/Propuesta_plataforma_multideportiva_Chile.md) y la
[especificacion funcional](docs/propuesta/Especificacion_completa_plataforma_multideportiva_Chile.md).

La [segunda fase](docs/FASE-2.md) documenta Angular, NestJS, autenticación real,
validaciones y capturas actuales del login y registro de **Falta Uno**.

## Levantar la base con Docker

Requisitos: Git, Node.js 24 y Docker Desktop con el motor funcionando en modo
contenedores Linux (incluye Docker Compose). En Windows usar `npm.cmd` en
PowerShell. En macOS/Linux usar `npm`.

Desde la raiz del repositorio:

```powershell
npm.cmd run docker:up
```

La primera ejecucion:

1. Genera `.env.docker` con dos contrasenas aleatorias independientes.
2. Descarga PostgreSQL 18.6 y crea un volumen persistente.
3. Espera a que PostgreSQL este listo.
4. Construye la herramienta Node y aplica las migraciones desde cero.
5. Carga Chile, 16 regiones, 346 comunas y 40 actividades.
6. Crea el usuario limitado, configura sus permisos y su contrasena inicial.
7. Verifica 20 tablas del sistema, 5 funciones, 24 triggers, 78 CHECK y la
   conexion real con el usuario de la aplicacion.

Se puede repetir el comando. Conserva las credenciales y el volumen, omite
migraciones aplicadas y no duplica catalogos. Las contrasenas solo se asignan
al crear el entorno; editarlas en `.env.docker` no cambia automaticamente
usuarios de un volumen ya inicializado. Si hay un error, el comando termina
con codigo distinto de cero; los pasos completados pueden reintentarse.

La base Docker usa **127.0.0.1:5434**. PostgreSQL instalado directamente en
Windows sigue en **127.0.0.1:5432**; son servidores independientes y no se
copian los datos operativos de uno al otro. Los `.env` existentes del paquete
no se modifican. Si el puerto 5434 esta ocupado, ajustar `DOCKER_DB_PORT` en
`.env.docker` antes de levantar el servicio.

## Comandos habituales

Ejecutar desde la raiz:

```powershell
npm.cmd run docker:status
npm.cmd run docker:logs
npm.cmd run docker:setup
npm.cmd run docker:down
```

`docker:setup` reaplica la preparacion y verifica la base existente.
`docker:down` detiene los servicios y conserva el volumen. No se incluye un
comando de borrado de volumen. Docker Desktop mostrara el proyecto
`comunidad-deportiva`; `db-setup` es una tarea temporal y termina al completar
su trabajo. Solo PostgreSQL queda funcionando.

## Ver la base Docker en pgAdmin

Registrar un servidor nuevo, por ejemplo `Comunidad Deportiva Docker`:

| Campo | Valor |
| --- | --- |
| Host | 127.0.0.1 |
| Puerto | 5434 (o el DOCKER_DB_PORT elegido) |
| Maintenance database | comunidad_deportiva_dev |
| Username de administracion | postgres |
| Password de administracion | Valor local de DOCKER_POSTGRES_PASSWORD en .env.docker |
| Username de la aplicacion | comunidad_deportiva_app |
| Password de la aplicacion | Valor local de DOCKER_APP_PASSWORD en .env.docker |

No compartir el archivo de credenciales. Si mas adelante conectas una API
ejecutada en el equipo, utilizara `127.0.0.1:5434` y el usuario limitado.
Dentro de la red de Compose el host es `postgres` y el puerto es `5432`.

## Backend conectado a Docker

Seguir el [README del backend](apps/backend/README.md) para instalar sus
dependencias y generar la configuracion local con el usuario limitado.
El endpoint `http://localhost:3000/health` comprueba la conexion real a la base.
El frontend se ejecuta por separado desde `apps/frontend` con `npm.cmd start`.
Su [README](apps/frontend/README.md) explica la direccion de API por entorno.

## Desarrollo sin Docker

Consultar [packages/database/README.md](packages/database/README.md) para
usar PostgreSQL instalado localmente, cargar datos y reproducir permisos.
Se incluyen `.env.example` y `.env.migrations.example` como plantillas sin
credenciales reales. En una instalacion nueva ejecutar `npm.cmd ci` desde
`packages/database` para instalar sus dependencias.

## Git

Versionar `compose.yaml`, los Dockerfile, los scripts, las migraciones,
los catalogos JSON, las plantillas `.example` y los archivos package-lock.
Los archivos `.env`, `.env.migrations`, `.env.docker`, dependencias,
credenciales y respaldos `.backup`/`.dump` estan excluidos de Git.
Cada colaborador genera sus propias credenciales y su propio volumen.
Trabajar en ramas por tarea y abrir un pull request hacia `main` para revisar
los cambios antes de integrarlos. La primera fase esta en
`feat/fase-1-base-datos-docker` y el reinicio de las aplicaciones se prepara en
`chore/reinicio-frontend-backend`. El codigo anterior sigue disponible en el
historial de Git.

## Referencias de infraestructura

- [Imagen oficial de PostgreSQL](https://hub.docker.com/_/postgres): en
  PostgreSQL 18 el volumen se monta en `/var/lib/postgresql`.
- [Orden de arranque de Compose](https://docs.docker.com/compose/how-tos/startup-order/):
  la preparacion depende del healthcheck de PostgreSQL.
