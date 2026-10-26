# Backend NestJS

API NestJS 12 con ESM. Requiere Node.js 24 y el PostgreSQL preparado por Docker.
El esquema y el cliente Prisma pertenecen al paquete local `@comunidad/database`,
en `packages/database`; no hay otra copia del esquema en esta aplicacion.

## Preparar un equipo nuevo

Desde la raiz del repositorio:

```powershell
npm.cmd run docker:up
npm.cmd --prefix packages/database ci
npm.cmd --prefix packages/database run backend:env
npm.cmd --prefix apps/backend ci
npm.cmd --prefix apps/backend run start:dev
```

El comando `backend:env` genera `apps/backend/.env` a partir de las credenciales
locales de la aplicacion Docker. No muestra contrasenas, no usa la credencial
administrativa y conserva cualquier `.env` existente. El archivo esta excluido
de Git. Como alternativa, copiar `.env.example` a `.env` y completar sus valores
localmente; el puerto publicado predeterminado de Docker es 5434.

Al arrancar o compilar se genera y compila automaticamente el paquete Prisma.
Esta generacion no necesita credenciales ni conexion a la base. El servidor
valida la configuracion y abre la conexion al inicializarse. Debe usar
`comunidad_deportiva_app`, no `postgres`. Una configuracion incompleta o un
fallo de conexion impiden que el servidor arranque correctamente.

## Comprobar la conexion

```text
GET http://localhost:3000/health
```

Devuelve HTTP 200 cuando Prisma logra consultar PostgreSQL:

```json
{"status":"ok","database":"up"}
```

Si la base deja de responder despues del arranque, devuelve HTTP 503 con
`{"status":"error","database":"down"}`. No expone credenciales, SQL ni
mensajes internos. La respuesta no se almacena en cache. La ruta `/` conserva
el mensaje inicial de NestJS.

## Comandos desde apps/backend

```powershell
npm.cmd run start:dev
npm.cmd run build
npm.cmd test
npm.cmd run test:e2e
```

Las pruebas unitarias cubren la validacion y el manejo de una base no disponible.
Las pruebas e2e requieren el `.env` local y Docker en funcionamiento: consultan
la base real, verifican los catalogos mediante Prisma y comprueban el rol
limitado, sin escribir datos. La conexion se cierra al finalizar la aplicacion.

## Conexion desde Angular

CORS permite por defecto `http://localhost:4200` y `http://127.0.0.1:4200`
para GET, HEAD y OPTIONS. Se puede definir otra lista mediante
`FRONTEND_ORIGINS`, con origenes HTTP/HTTPS separados por comas. Reiniciar
el backend si cambia su `.env`. No usar un comodin. CORS permite POST con
credenciales y el encabezado X-Falta-Uno para autenticación.

El origen incluye el puerto que aparece en la barra del navegador. Si una
vista previa usa, por ejemplo, `http://localhost:55922`, agregar ese valor
exacto a `FRONTEND_ORIGINS` en el `.env` local y reiniciar el backend.

Las pruebas e2e verifican solicitudes desde ambos origenes, preflight y la
ausencia de autorizacion CORS para un origen distinto.

La API incluye registro, login, consulta de sesión y logout de Falta Uno.
Ver [autenticación](../../docs/auth.md). Las operaciones deportivas siguen pendientes.
