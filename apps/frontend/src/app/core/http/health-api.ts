import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, timeout } from 'rxjs';
import { API_URL } from '../config/api-url';

export interface HealthResponse {
  status: 'ok';
  database: 'up';
}

@Injectable({ providedIn: 'root' })
export class HealthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL).replace(/\/$/, '');

  check() {
    return this.http.get<unknown>(`${this.baseUrl}/health`).pipe(
      timeout(5000),
      map((body): HealthResponse => {
        if (
          typeof body !== 'object' ||
          body === null ||
          !('status' in body) ||
          body.status !== 'ok' ||
          !('database' in body) ||
          body.database !== 'up'
        ) {
          throw new Error('Respuesta de salud no valida');
        }
        return { status: 'ok', database: 'up' };
      }),
    );
  }
}
