import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HealthApi } from '../../core/http/health-api';

type ConnectionState =
  'idle' | 'checking' | 'connected' | 'database-down' | 'unavailable' | 'invalid';

@Component({
  selector: 'app-health-page',
  templateUrl: './health-page.html',
  styleUrl: './health-page.css',
})
export class HealthPage implements OnInit {
  private readonly api = inject(HealthApi);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<ConnectionState>('idle');
  protected readonly lastChecked = signal<string | null>(null);
  protected readonly checking = computed(() => this.state() === 'checking');
  protected readonly connected = computed(() => this.state() === 'connected');
  protected readonly hasError = computed(() =>
    ['database-down', 'unavailable', 'invalid'].includes(this.state()),
  );

  protected readonly apiStatus = computed(() => {
    switch (this.state()) {
      case 'connected':
      case 'database-down':
        return 'Disponible';
      case 'checking':
        return 'Comprobando';
      case 'unavailable':
        return 'Sin respuesta';
      case 'invalid':
        return 'Respuesta inesperada';
      default:
        return 'Pendiente';
    }
  });

  protected readonly databaseStatus = computed(() => {
    if (this.connected()) return 'Conectada';
    if (this.state() === 'database-down') return 'No disponible';
    return this.checking() ? 'Comprobando' : 'Sin verificar';
  });

  protected readonly message = computed(() => {
    switch (this.state()) {
      case 'connected':
        return 'La aplicación se comunica con la API y la base de datos responde correctamente.';
      case 'database-down':
        return 'La API responde, pero no pudo consultar la base de datos. Revisa que PostgreSQL esté disponible.';
      case 'unavailable':
        return 'No pudimos contactar con la API. Comprueba que el backend esté funcionando y vuelve a intentarlo.';
      case 'invalid':
        return 'La API devolvió una respuesta inesperada. No se pudo confirmar el estado de la base de datos.';
      default:
        return 'Estamos comprobando la conexión con los servicios de la plataforma.';
    }
  });

  ngOnInit() {
    this.checkConnection();
  }

  protected checkConnection() {
    if (this.checking()) return;
    this.state.set('checking');
    this.api
      .check()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.finish('connected'),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            const body: unknown = error.error;
            if (
              error.status === 503 &&
              typeof body === 'object' &&
              body !== null &&
              'status' in body &&
              body.status === 'error' &&
              'database' in body &&
              body.database === 'down'
            ) {
              this.finish('database-down');
              return;
            }
            this.finish(error.status === 0 ? 'unavailable' : 'invalid');
            return;
          }
          this.finish(
            error instanceof Error && error.name === 'TimeoutError' ? 'unavailable' : 'invalid',
          );
        },
      });
  }

  private finish(state: ConnectionState) {
    this.state.set(state);
    this.lastChecked.set(
      new Intl.DateTimeFormat('es-CL', { timeStyle: 'medium' }).format(new Date()),
    );
  }
}
