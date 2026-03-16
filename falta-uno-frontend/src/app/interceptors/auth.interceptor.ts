/**
 * Interceptor de autenticación (frontend).
 *
 * Propósito:
 * - Añadir el header `Authorization: Bearer <token>` a las peticiones HTTP salientes cuando haya sesión.
 * - Proveer un punto central para capturar y gestionar errores de autenticación (401/403).
 *
 * Nota: Para que el interceptor actúe debe registrarse en el proveedor de interceptors del módulo principal:
 * providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
 */
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Logout automático en caso de token inválido/expirado
        authService.logout();
        // Redirigir al login
        window.location.href = '/';
      }
      return throwError(() => err);
    })
  );
}; 