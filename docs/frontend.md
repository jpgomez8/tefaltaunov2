# Frontend (Resumen)

Descripción: Resumen de elementos documentados en el frontend (Angular).

Servicios e interceptors:
- `AuthService` (src/app/services/auth.service.ts)
  - Métodos: `saveSession(accessToken, usuario)`, `getToken()`, `getUsuario()`, `logout()`, `isLoggedIn()`
  - Documentado con JSDoc en español.
- `AuthInterceptor` (src/app/interceptors/auth.interceptor.ts)
  - Añade `Authorization: Bearer <token>` a peticiones cuando hay sesión.

Notas:
- Integración recomendada: al recibir `id_token` de Google en el cliente, enviarlo al endpoint backend `/auth/loginGoogle`.
- Guardar `accessToken` y `usuario` vía `AuthService.saveSession`.
