/**
 * Interceptor de autenticación (frontend).
 *
 * Propósito:
 * - Añadir el header `Authorization: Bearer <token>` a las peticiones HTTP salientes cuando haya sesión.
 * - Proveer un punto central para capturar y gestionar errores de autenticación (401/403).
 *
 * Nota: Para que el interceptor actúe debe registrarse en el proveedor de interceptors del módulo principal:
 * providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
 *
 * Si prefieres que sólo añada documentación sin implementación, dímelo y dejo el archivo con sólo comentarios.
 */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  /**
   * Intercepta peticiones HTTP y añade Authorization si hay token.
   * @param req Petición HTTP original
   * @param next HttpHandler que continúa la cadena de interceptores
   * @returns Observable<HttpEvent<any>> Flujo de la petición HTTP
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
} 