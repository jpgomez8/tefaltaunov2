import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthApi, Usuario } from '../../core/auth/auth-api';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrls: ['./brand.css', './auth-page.css', './story-scene.css', './logo.css'],
})
export class AuthPage {
  private readonly api = inject(AuthApi);
  private readonly destroy = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly register = inject(ActivatedRoute).snapshot.data['register'] === true;
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly showPassword = signal(false);
  readonly usuario = signal<Usuario | null>(null);
  readonly loading = signal(true);
  readonly form = new FormGroup({
    nombre_publico: new FormControl('', {
      nonNullable: true,
      validators: this.register
        ? [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
        : [],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(this.register ? 15 : 1),
        Validators.maxLength(128),
      ],
    }),
    mayoria_edad: new FormControl(false, {
      nonNullable: true,
      validators: this.register ? [Validators.requiredTrue] : [],
    }),
  });

  constructor() {
    this.api
      .me()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (result) => {
          this.usuario.set(result.usuario);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          if (!(err instanceof HttpErrorResponse && err.status === 401))
            this.error.set(
              'No pudimos conectar con Falta Uno. Revisa la conexión e inténtalo otra vez.',
            );
        },
      });
  }

  submit() {
    if (this.busy()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Revisa los campos indicados antes de continuar.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    const data = this.form.getRawValue();
    const call = this.register
      ? this.api.register(data)
      : this.api.login({ correo: data.correo, password: data.password });
    call.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (result) => {
        this.busy.set(false);
        this.form.controls.password.reset();
        if (this.register) {
          this.notice.set('¡Tu cuenta está creada! Ya puedes iniciar sesión.');
        } else this.usuario.set(result.usuario);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(this.message(err));
      },
    });
  }
  logout() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .logout()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.usuario.set(null);
          this.busy.set(false);
          void this.router.navigateByUrl('/iniciar-sesion');
        },
        error: (err) => {
          this.busy.set(false);
          this.error.set(this.message(err));
        },
      });
  }
  invalid(name: keyof typeof this.form.controls) {
    const field = this.form.controls[name];
    return field.touched && field.invalid;
  }
  private message(err: unknown) {
    if (
      err instanceof HttpErrorResponse &&
      [400, 401, 403, 409, 429].includes(err.status) &&
      typeof err.error?.message === 'string'
    )
      return err.error.message;
    return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo otra vez.';
  }
}
