# Frontend web

Aplicacion Angular 22 inicializada con componentes standalone, rutas y
Tailwind CSS. La pantalla inicial consulta el estado de la API y PostgreSQL.
Las pantallas deportivas siguen pendientes. Usar `npm.cmd start` desde esta
carpeta para iniciar el servidor.

## Distribucion

- `src/app/core/auth`: sesion, identidad y proteccion de rutas.
- `src/app/core/http`: configuracion HTTP e interceptores.
- `src/app/core/config`: configuracion y proveedores globales.
- `src/app/layout`: estructura visual, navegacion y disposicion de paginas.
- `src/app/shared/ui`: componentes visuales reutilizables sin logica de dominio.
- `src/app/shared/utils`: utilidades de presentacion compartidas.
- `src/app/features/auth`: pantallas de registro, acceso y recuperacion.
- `src/app/features/health`: comprobacion de conexion, estados y reintento.
- `src/app/features/usuarios`: perfil y preferencias.
- `src/app/features/catalogos`: seleccion de actividades y ubicaciones.
- `src/app/features/lugares`: consulta y detalle de lugares.
- `src/app/features/encuentros`: busqueda, creacion, detalle e inscripcion.
- `src/environments`: configuracion publica por entorno; nunca contrasenas.
- `public`: archivos estaticos de acceso publico.

Los archivos de arranque, configuracion, dependencias y pruebas ya estan
generados. Las rutas de cada funcionalidad deberan cargarse
de forma diferida cuando corresponda. El frontend consumira la API HTTP:
no conectara directamente a PostgreSQL ni importara Prisma Client.
