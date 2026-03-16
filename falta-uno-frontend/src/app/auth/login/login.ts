import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;

/**
 * Componente de login con Google.
 *
 * Inicializa el SDK de Google Identity y renderiza el botón de sign-in.
 * El callback recibe el ID token de Google en `response.credential` y lo envía al backend para validar/crear sesión.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class='login-bg'>
      <div class="login-card">
        <div class='logo'>FALTA<span>UNO</span></div>

        <p class='subtitle'>¡Bienvenido a Falta Uno! Inicia sesión para continuar.</p>

        <button class='btn-primary' routerLink="/login-manual">Ingresar con correo</button> 
        
        <!-- Botón de Google (renderizado por el SDK) -->
        <div id="googleBtn" style="margin: 1rem 0"></div>

        <p class='footer'>¿No tienes cuenta? <a routerLink="/registro">Regístrate aquí</a></p>
        
      </div>
    </div>
  `,
  styleUrl: './login.css',
  imports: [RouterModule],
})
export class LoginComponent implements AfterViewInit {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Client ID de Google (OAuth2) obtenido desde `environment`.
   */
  clientIdGoogle: string = environment.googleClientId;

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: this.clientIdGoogle,
      callback: (response: any) => {
        const token = response.credential;
        if (!token) {
          console.error('No se recibió ID token de Google');
          return;
        }

        this.authService.loginGoogle(token).subscribe({
          next: (res) => {
            console.log('Login exitoso', res);
            // Ya se guarda la sesión en AuthService.loginGoogle (tap)
            // Redirigir o refrescar la app
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Error al login con backend', err);
            alert('Error al iniciar sesión. Revisa la consola.');
          },
        });
      },
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      }
    );
  }
} 
