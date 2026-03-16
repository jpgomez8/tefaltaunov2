/**
 * Servicio de autenticación (frontend).
 *
 * Proporciona utilidades para gestionar la sesión en el cliente usando localStorage.
 * - Guardar token y usuario
 * - Recuperar token y usuario
 * - Verificar si hay sesión iniciada
 * - Hacer login con backend (loginGoogle)
 */
import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpClient) {}

    /**
     * Realiza login con token de Google en el backend y guarda la sesión localmente.
     * @param token ID token de Google.
     * @returns Observable con la respuesta del backend (accessToken, usuario).
     */
    /**
     * Login usando token de Google (ya existente).
     */
    loginGoogle(token: string): Observable<any> {
        // Usar la URL desde environment
        const url = `${environment.apiUrl}/auth/loginGoogle`;
        return this.http.post<any>(url, { token }).pipe(
            tap((res) => {
                if (res && res.accessToken && res.usuario) {
                    this.saveSession(res.accessToken, res.usuario);
                }
            })
        );
    }

    /**
     * Login manual con correo y contraseña.
     * @param correo correo del usuario
     * @param password contraseña en texto plano (se enviará al backend)
     */
    loginManual(correo: string, password: string): Observable<any> {
        const url = `${environment.apiUrl}/auth/login`;
        return this.http.post<any>(url, { correo, password }).pipe(
            tap((res) => {
                if (res && res.accessToken && res.usuario) {
                    this.saveSession(res.accessToken, res.usuario);
                }
            })
        );
    }

    /**
     * Registrar un usuario manualmente.
     * @param dto Objeto con { correo, nombre, password }
     */
    registrarUsuario(dto: { correo: string; nombre: string; password?: string }): Observable<any> {
        const url = `${environment.apiUrl}/usuario/agregarUsuario`;
        return this.http.post<any>(url, dto);
    }

    /**
     * Guarda la sesión en localStorage.
     * @param accessToken Token JWT de acceso. Tipo: string.
     * @param usuario Objeto usuario. Normalmente contiene { id, correo, nombre }.
     * @example
     * authService.saveSession('eyJhbGciOi...', { id: 1, correo: 'a@b.com', nombre: 'Juan' });
     */
    saveSession(accessToken: string, usuario: any): void {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    /**
     * Obtiene el token de acceso almacenado.
     * @returns {string | null} Token JWT si existe, o null en caso contrario.
     */
    getToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    /**
     * Obtiene el objeto usuario almacenado.
     * @returns {any | null} Usuario decodificado desde JSON o null si no existe.
     */
    getUsuario(): any | null {
        const user = localStorage.getItem('usuario');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Elimina la sesión (logout).
     * Borra todos los datos de localStorage relacionados con la sesión.
     */
    logout(): void {
        localStorage.clear();
    }

    /**
     * Indica si hay una sesión iniciada.
     * @returns {boolean} true si existe token en localStorage, false de lo contrario.
     */
    isLoggedIn(): boolean {
        return !!this.getToken();
    }
} 