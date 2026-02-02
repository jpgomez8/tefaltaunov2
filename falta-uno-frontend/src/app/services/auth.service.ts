/**
 * Servicio de autenticación (frontend).
 *
 * Proporciona utilidades para gestionar la sesión en el cliente usando localStorage.
 * - Guardar token y usuario
 * - Recuperar token y usuario
 * - Verificar si hay sesión iniciada
 *
 * Nota: Este servicio NO realiza llamadas HTTP, sólo gestiona el estado local.
 */
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
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