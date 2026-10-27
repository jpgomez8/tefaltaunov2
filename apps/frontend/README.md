# Frontend Angular

Angular 22 con componentes standalone, Signals, rutas diferidas y Tailwind.
La página inicial `/inicio` muestra la sesión y un estado vacío de encuentros.
Sin sesión, redirige al acceso. El login y las sesiones existentes llevan a `/inicio`.
Incluye `/registro` y
`/iniciar-sesion`, conectados a la API. Ver [autenticación](../../docs/auth.md).
La ruta `/estado` comprueba la API y PostgreSQL a través de `GET /health`.
No se conecta directamente a la base ni contiene credenciales.

Para probar múltiples cuentas en desarrollo se pueden usar correos ficticios
distintos, por ejemplo `jugador1@example.test` y `jugador2@example.test`.
No se envían correos ni se exige verificación para ingresar en esta fase.
El estado pendiente se conserva en la base: no se afirma haber verificado el correo.
Cerrar sesión desde Inicio permite ingresar con otra cuenta. La búsqueda y
creación de encuentros todavía no están implementadas.

## Desarrollo

Requiere Node.js 24 y el backend funcionando en el puerto 3000. Preparar la
base y el backend siguiendo el [README del backend](../backend/README.md).
Desde esta carpeta:

```powershell
npm.cmd ci
npm.cmd start
```

Abrir `http://localhost:4200`. En `/estado`, la comprobacion se ejecuta automaticamente y
puede repetirse con el boton **Volver a comprobar**. Diferencia una API sin
respuesta de una base no disponible. Una peticion que tarda mas de cinco
segundos se cancela, libera el boton y permite reintentar.

## Direccion de la API

- Desarrollo: `src/environments/environment.development.ts` apunta a
  `http://localhost:3000`.
- Produccion: `src/environments/environment.ts` usa `/api`; el despliegue
  debera enviar `/api/*` al backend quitando ese prefijo, o reemplazar la
  direccion por la del servidor de API correspondiente. Ese despliegue aun
  no esta configurado.

Las configuraciones son publicas: nunca guardar contrasenas ni tokens en
estos archivos. Reiniciar `npm.cmd start` si se cambia `angular.json`.
La API autoriza por defecto los origenes locales con puerto 4200; consultar
`FRONTEND_ORIGINS` en el README del backend si cambia el origen.

## Verificacion

```powershell
npm.cmd test -- --watch=false
npm.cmd run build
```

Las pruebas usan el backend HTTP de pruebas de Angular: comprueban la pagina,
la consulta inicial, el estado correcto, una base caida, una falla de red,
el reintento, las respuestas inesperadas y el limite de espera. No requieren
apagar servicios reales. Las pruebas e2e del backend verifican por separado
la base real y CORS.

El cliente HTTP esta en `src/app/core/http`; la pantalla y sus Signals estan
en `src/app/features/health`. Las funcionalidades deportivas siguen pendientes.
