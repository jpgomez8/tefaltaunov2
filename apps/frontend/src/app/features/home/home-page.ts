import { Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthApi, Usuario } from '../../core/auth/auth-api';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly usuario = signal<Usuario | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');

  constructor() { this.load(); }

  load() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.api.me().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: ({ usuario }) => {
        this.usuario.set(usuario);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err instanceof HttpErrorResponse && err.status === 401) {
          void this.router.navigateByUrl('/iniciar-sesion');
        } else {
          this.error.set('No pudimos cargar tu sesión. Revisa tu conexión e inténtalo otra vez.');
        }
      },
    });
  }

  logout() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.logout().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        this.usuario.set(null);
        this.busy.set(false);
        void this.router.navigateByUrl('/iniciar-sesion');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('No pudimos cerrar tu sesión. Inténtalo otra vez.');
      },
    });
  }
}
