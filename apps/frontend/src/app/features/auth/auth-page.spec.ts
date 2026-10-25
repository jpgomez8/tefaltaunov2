import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { API_URL } from '../../core/config/api-url';
import { AuthPage } from './auth-page';

describe('Acceso a Falta Uno', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function open(url: string) {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl(url, AuthPage);
    http.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    harness.detectChanges();
    return { harness, page };
  }
  it('impide registrar sin mayoría de edad y muestra el resultado de la API', async () => {
    const { page, harness } = await open('/registro');
    page.form.patchValue({
      nombre_publico: 'Yerko',
      correo: 'yerko@example.test',
      password: 'Mi frase larga de prueba',
    });
    page.submit();
    http.expectNone('/api/auth/register');
    page.form.controls.mayoria_edad.setValue(true);
    page.submit();
    const req = http.expectOne('/api/auth/register');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-Falta-Uno')).toBe('1');
    req.flush({ usuario: { id: '1', nombre_publico: 'Yerko' } });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Tu cuenta está creada');
    expect(page.form.controls.password.value).toBe('');
  });
  it('muestra un rechazo de credenciales y permite reintentar', async () => {
    const { page } = await open('/iniciar-sesion');
    page.form.patchValue({ correo: 'yerko@example.test', password: 'incorrecta' });
    page.submit();
    http
      .expectOne('/api/auth/login')
      .flush(
        { message: 'Correo o contraseña incorrectos.' },
        { status: 401, statusText: 'Unauthorized' },
      );
    expect(page.busy()).toBe(false);
    expect(page.error()).toContain('incorrectos');
    page.submit();
    http
      .expectOne('/api/auth/login')
      .flush({
        usuario: {
          id: '1',
          nombre_publico: 'Yerko',
          correo: 'yerko@example.test',
          estado: 'pendiente_verificacion',
        },
      });
    expect(page.usuario()?.nombre_publico).toBe('Yerko');
    page.logout();
    http.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
    expect(page.usuario()).toBeNull();
  });
});
