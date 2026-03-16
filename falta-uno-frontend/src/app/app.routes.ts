import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { LoginManualComponent } from './auth/login-manual/login-manual';
import { RegistroUsuarioComponent } from './auth/registro/registro-usuario';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login-manual', component: LoginManualComponent },
  { path: 'registro', component: RegistroUsuarioComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
];
