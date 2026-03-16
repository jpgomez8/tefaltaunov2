# Módulo Auth

Resumen:
- Endpoints: `POST /auth/loginGoogle` ? Login mediante Google ID token.
- Usa Google OAuth2 para validar `idToken`, crea usuario si no existe y devuelve `{ accessToken, usuario }`.

Endpoint: `POST /auth/loginGoogle`
- Body: `{ token: string }` (ID token de Google)
- Respuesta 200: `{ accessToken: string, usuario: Usuario }`
- Errores: 401 si el token es inválido; 500 si faltan variables de entorno (GOOGLE_CLIENT_ID, JWT_SECRET).

Notas:
- En frontend, enviar `token` recibido por Google al endpoint anterior para intercambiar por JWT.
- Backend genera JWT con `sub: usuario.id` y `email` en el payload.
