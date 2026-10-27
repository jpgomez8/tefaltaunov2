# Falta Uno: registro e inicio de sesión

Pantallas: `/registro`, `/iniciar-sesion` y `/estado` (diagnóstico).
Logo original vectorial: `apps/frontend/public/falta-uno.svg`.

## API implementada

| Método | Ruta | Resultado |
| --- | --- | --- |
| POST | /auth/register | 201 y usuario público; no inicia sesión automáticamente |
| POST | /auth/login | 200, usuario público y cookie de sesión |
| GET | /auth/me | Usuario público o 401 |
| POST | /auth/logout | 204, revoca la sesión y elimina la cookie |

Registro: nombre público, correo, contraseña de 15 a 128 caracteres y confirmación
explícita de mayoría de edad. Normaliza correos y rechaza campos adicionales,
incluidos roles. No añade tablas ni modifica la migración inicial.

POST requiere el encabezado `X-Falta-Uno: 1`. Angular envía `withCredentials: true`.
El servidor valida los orígenes explícitos de FRONTEND_ORIGINS antes de escribir.
El límite de intentos es 20 por IP cada 15 minutos, con hasta cuatro operaciones
simultáneas. Este límite vive en memoria: para varias réplicas necesita un almacén
compartido. El proxy debe configurarse antes de confiar en direcciones reenviadas.

Contraseñas: scrypt N=131072, r=8, p=1, salt aleatoria. Tokens de sesión aleatorios
de 256 bits, guardados únicamente como SHA-256 en PostgreSQL. Cookie HttpOnly,
SameSite=Lax, Path=/ y Secure cuando NODE_ENV=production. Expiración de ocho horas,
sin renovación automática. No se guardan tokens en localStorage.
Referencias: [contraseñas OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
y [sesiones OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Alcance pendiente

El correo queda en pendiente_verificacion. Se permite el acceso en ese estado
para este flujo inicial, y la pantalla lo indica. Envío y verificación de correos,
recuperación de contraseña, MFA y Google no están implementados. La documentación
anterior de Google describía el prototipo retirado. Las pantallas deportivas
siguen pendientes; al iniciar sesión se muestra la cuenta conectada.

Producción requiere HTTPS, NODE_ENV=production, orígenes explícitos y proxy
`/api/*` al backend quitando `/api`. Usar web y API en el mismo sitio con esta
configuración de cookies. No se ha desplegado en producción.

## Verificación

Desde apps/backend: `npm.cmd run test:e2e`.
Se comprueba por HTTP: registro, validación, duplicados, contraseñas incorrectas,
hash real en PostgreSQL, cookie, lectura de sesión, expiración y revocación.
Los datos de la prueba se descartan mediante rollback.

Desde apps/frontend: `npm.cmd test -- --watch=false`.
Prueba validación, registro, rechazo de credenciales, acceso y cierre de sesión,
además del diagnóstico de conectividad.

El nombre previsto para la carpeta es Project-05-Falta-Uno-Octubre-2026.
Windows impide renombrarla mientras esté en uso; existe el script
scripts/renombrar-proyecto.ps1 para ejecutarlo fuera de VS Code tras cerrarlo.
Los nombres técnicos existentes de bases, volúmenes y paquetes se conservan.
