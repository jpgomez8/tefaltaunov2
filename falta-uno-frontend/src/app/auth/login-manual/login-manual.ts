import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

/**
 * Componente para login manual (correo + contraseña).
 * Nombre en español y comentarios importantes para mantener la convención del proyecto.
 */
@Component({
  selector: 'app-login-manual',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login-manual.html',
  styleUrls: ['./login-manual.css'],
})
export class LoginManualComponent {
  // Formulario reactivo con validaciones básicas
  form: FormGroup;

  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Acción al enviar el formulario
  async enviar() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const { correo, password } = this.form.value as { correo: string; password: string };

    this.auth.loginManual(correo, password).subscribe({
      next: () => {
        this.loading = false;
        // Redirigir a la raíz (o dashboard que implantes después)
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al iniciar sesión';
      },
    });
  }
}
