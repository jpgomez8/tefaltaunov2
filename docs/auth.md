# Auth (Autenticación)

Descripción: Endpoints relacionados con autenticación (login con Google).

Endpoints:
- POST /auth/loginGoogle
  - Body: { token: string }
  - Respuesta: { accessToken: string, usuario: Usuario }
  - Notas: Se espera un id_token de Google; el backend valida el token, crea el usuario si no existe y devuelve un JWT.

- POST /auth/login
  - Body: { correo: string, password: string }
  - Respuesta: { accessToken: string, usuario: Usuario }
  - Notas: Login con credenciales manuales. Se valida la contraseña hasheada y se devuelve un JWT en caso de éxito.

DTOs relevantes:
- Request: { token: string } (string, requerido)

Errores comunes:
- 401 Unauthorized: Token inválido o payload incompleto.
- 500: Configuración faltante (GOOGLE_CLIENT_ID o JWT_SECRET).

Ejemplo de uso (frontend): enviar id_token recibido desde el cliente a `/auth/loginGoogle` y guardar `accessToken` en `localStorage`.

Nota de desarrollo: existe un modo de prueba para facilitar testing local sin depender de Google. Si en `.env` se añade `ALLOW_FAKE_GOOGLE=true` y envía `token: 'FAKE_TOKEN'`, el endpoint responderá con un usuario de prueba y un JWT para facilitar pruebas end-to-end locales.
