import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

/**
 * Componente para registrar usuarios manualmente.
 * Mantengo la nomenclatura en español y comentarios importantes (DTO, controller, service).
 */
@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registro-usuario.html',
  styleUrls: ['./registro-usuario.css'],
})
export class RegistroUsuarioComponent {
  form: FormGroup;

  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
    });
  }

  // Validación simple: password y confirmar iguales
  validarPasswords(): boolean {
    const pw = this.form.get('password')?.value || '';
    const conf = this.form.get('confirmar')?.value || '';
    return pw !== '' && conf !== '' && pw === conf;
  }

  enviar() {
    if (this.form.invalid || !this.validarPasswords()) {
      this.error = 'Revisa los datos e intenta de nuevo (verifica las contraseñas).';
      return;
    }

    this.loading = true;
    this.error = null;

    const { correo, nombre, password } = this.form.value as { correo: string; nombre: string; password: string };

    this.auth.registrarUsuario({ correo, nombre, password }).subscribe({
      next: (res) => {
        this.loading = false;
        // Opcional: iniciar sesión automáticamente después de registrarse
        this.auth.loginManual(correo, password).subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.router.navigate(['/']),
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al registrar usuario';
      },
    });
  }
}
