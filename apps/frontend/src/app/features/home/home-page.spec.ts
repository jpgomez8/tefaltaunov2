import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { API_URL } from '../../core/config/api-url';
import { HomePage } from './home-page';

describe('Inicio y sesión', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(),
      provideHttpClientTesting(), { provide: API_URL, useValue: '/api' }] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const user = { id: '1', nombre_publico: 'Jugador de prueba', correo: 'jugador1@example.test', estado: 'pendiente_verificacion' };

  it('permite entrar sin verificar correo, recargar la sesión y cerrarla', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/inicio', HomePage);
    http.expectOne('/api/auth/me').flush({ usuario: user });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(user.nombre_publico);
    expect(harness.routeNativeElement?.textContent).toContain('todavía están en desarrollo');
    page.logout();
    http.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/iniciar-sesion');
    http.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('envía al login cuando no hay sesión', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/inicio', HomePage);
    http.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/iniciar-sesion');
    http.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('permite reintentar un fallo de red sin enviarte al login', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/inicio', HomePage);
    http.expectOne('/api/auth/me').error(new ProgressEvent('error'));
    expect(TestBed.inject(Router).url).toBe('/inicio');
    expect(page.error()).toContain('No pudimos cargar');
    page.load();
    http.expectOne('/api/auth/me').flush({ usuario: user });
    expect(page.usuario()?.correo).toBe(user.correo);
    expect(page.error()).toBe('');
  });
});
