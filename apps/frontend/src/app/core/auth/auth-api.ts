import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_URL } from '../config/api-url';

export interface Usuario {
  id: string;
  nombre_publico: string;
  correo: string;
  estado: string;
}
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);
  private readonly options = { withCredentials: true, headers: { 'X-Falta-Uno': '1' } };
  register(data: {
    nombre_publico: string;
    correo: string;
    password: string;
    mayoria_edad: boolean;
  }) {
    return this.http
      .post<{ usuario: Usuario }>(`${this.url}/auth/register`, data, this.options)
      .pipe(timeout(15000));
  }
  login(data: { correo: string; password: string }) {
    return this.http
      .post<{ usuario: Usuario }>(`${this.url}/auth/login`, data, this.options)
      .pipe(timeout(15000));
  }
  me() {
    return this.http
      .get<{ usuario: Usuario }>(`${this.url}/auth/me`, { withCredentials: true })
      .pipe(timeout(10000));
  }
  logout() {
    return this.http.post<void>(`${this.url}/auth/logout`, {}, this.options).pipe(timeout(10000));
  }
}
