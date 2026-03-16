import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home">
      <h1>Bienvenido {{ usuario?.nombre || usuario?.correo }}</h1>
      <p>Ya estás dentro de Falta Uno ⚽</p>

      <button (click)="logout()">Cerrar sesión</button>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  usuario: any;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
  }

  logout() {
    this.auth.logout();
    location.href = '/';
  }
}
