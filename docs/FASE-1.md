# Primera fase: base de datos y entorno Docker

Fecha: 24 de octubre de 2026.

Esta fase establece la base tecnica para evolucionar el proyecto hacia una
plataforma multideportiva. Permite recrear la estructura, cargar los catalogos
y preparar el acceso de la aplicacion en un entorno independiente por desarrollador.

## Trabajo realizado

- Se preparo una base PostgreSQL con 20 tablas del sistema y relaciones para
  usuarios, autenticacion, actividades, lugares, encuentros, inscripciones,
  asistencias, intenciones, propuestas de grupos, mensajes, notificaciones,
  reportes y auditoria.
- Se incorporo Prisma 7 en `packages/database`, con los modelos introspectados
  y la migracion inicial `0_init`. La migracion conserva los elementos SQL
  que no representa completamente el esquema Prisma: funciones, triggers y CHECK.
- Se guardaron los catalogos iniciales: Chile, 16 regiones, 346 comunas y
  40 actividades. El seed inserta registros faltantes sin duplicar ni
  sobreescribir registros existentes.
- Se preparo la creacion del usuario `comunidad_deportiva_app` y la politica
  de permisos: lectura de catalogos, escritura operativa limitada y auditoria
  con SELECT e INSERT. El usuario no tiene acceso al historial de Prisma.
- Se agrego Docker Compose con PostgreSQL 18.6, almacenamiento persistente,
  healthcheck y una tarea de preparacion con Node.js 24.
- Se agregaron comandos de arranque, estado, preparacion, logs y detencion.
- Se incluyeron plantillas de configuracion sin secretos, exclusiones de Git
  e instrucciones para reproducir el entorno en otro equipo.
- Se incluyen la propuesta y la especificacion funcional como documentos de
  planificacion. Describen la vision y funcionalidades previstas, no funciones
  que ya esten implementadas.

## Verificaciones realizadas

| Verificacion | Resultado |
| --- | --- |
| Migracion sobre una base vacia | Aplicada correctamente |
| Estructura recreada | 20 tablas del sistema, 5 funciones, 24 triggers y 78 CHECK |
| Catalogos iniciales | 1 pais, 16 regiones, 346 comunas y 40 actividades |
| Segunda ejecucion del seed | 0 registros nuevos, sin duplicados |
| Prueba de integracion del seed | Conserva identificadores, relaciones y ediciones existentes |
| Prueba de integracion de permisos | Creacion y repeticion correctas; operaciones prohibidas rechazadas |
| Arranque Docker desde cero | Migracion, catalogos, permisos y conexion de la aplicacion correctos |
| Segundo arranque Docker | Sin migraciones pendientes ni registros duplicados |
| Compilacion de tipos de los scripts nuevos | Sin errores |

Tambien se verifico manualmente un respaldo y su restauracion en una base
separada durante la preparacion local. Los respaldos y las contrasenas no
forman parte de esta entrega.

Las pruebas anteriores verifican esta fase. Todavia no equivalen a una
validacion del producto completo ni de su comportamiento bajo carga.

## Como revisarla en otro equipo

Con Node.js 24 y Docker Desktop funcionando con contenedores Linux, ejecutar
desde la raiz de la copia del repositorio:

```powershell
npm.cmd run docker:up
npm.cmd run docker:status
```

El primer comando genera las credenciales locales y prepara una base nueva.
El segundo debe mostrar PostgreSQL saludable. Puerto publicado predeterminado:
**127.0.0.1:5434**. Las credenciales estan solamente en el `.env.docker` local.
Si el puerto esta ocupado, cambiar `DOCKER_DB_PORT` antes de iniciar.

Cada desarrollador tiene su propia base. Los cambios de estructura se comparten
mediante migraciones; los datos operativos locales no se sincronizan por Git.
Para detener el entorno conservando su volumen:

```powershell
npm.cmd run docker:down
```

Consultar el [README principal](../README.md) y el
[README de base de datos](../packages/database/README.md) para mas detalles.
Las pruebas `test:seed` y `test:permissions` del paquete requieren adicionalmente
la base local dedicada `comunidad_deportiva_baseline_test`, ya migrada y con
los catalogos cargados. No apuntan automaticamente al contenedor Docker.

## Siguiente fase

1. Resolver la configuracion del backend: actualmente `falta-uno-api` esta
   registrado en Git como referencia a otro repositorio, sin `.gitmodules`
   disponible en esta copia. Esta entrega no modifica esa referencia.
2. Preparar NestJS e integrar Prisma usando el usuario limitado.
3. Implementar autenticacion y autorizacion por usuario.
4. Construir el primer flujo completo: consultar actividades y lugares,
   crear un encuentro, buscarlo, inscribirse y cancelar.
5. Conectar el frontend Angular y validar el flujo con usuarios.

PostGIS, Nx, las aplicaciones Android/iOS y las funciones avanzadas siguen
pendientes. La infraestructura de esta fase contiene la base de datos y su
preparacion; no incluye todavia una API NestJS ejecutandose en Docker.
