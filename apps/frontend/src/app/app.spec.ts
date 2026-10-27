import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { API_URL } from './core/config/api-url';

describe('Conexion de la aplicacion con la API', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/estado');
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  function initialRequest() {
    const req = http.expectOne('http://localhost:3000/health');
    expect(req.request.method).toBe('GET');
    return req;
  }

  function page(): HTMLElement {
    return fixture.nativeElement;
  }

  it('comprueba al abrir la pagina y muestra la conexion real confirmada por la API', async () => {
    expect(page().querySelector('button')?.disabled).toBe(true);
    initialRequest().flush({ status: 'ok', database: 'up' });
    await fixture.whenStable();
    expect(page().textContent).toContain('Todo conectado');
    expect(page().textContent).toContain('Conectada');
    expect(page().querySelector('button')?.disabled).toBe(false);
  });

  it('distingue una base caida de una API sin respuesta', async () => {
    initialRequest().flush(
      { status: 'error', database: 'down' },
      { status: 503, statusText: 'Service Unavailable' },
    );
    await fixture.whenStable();
    expect(page().textContent).toContain('Disponible');
    expect(page().textContent).toContain('No disponible');
    expect(page().textContent).toContain('La API responde, pero no pudo consultar');
  });

  it('permite reintentar despues de un fallo de red y recupera el estado', async () => {
    initialRequest().error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(page().textContent).toContain('Sin respuesta');
    expect(page().textContent).toContain('Sin verificar');
    page().querySelector('button')!.click();
    fixture.detectChanges();
    expect(page().querySelector('button')?.disabled).toBe(true);
    initialRequest().flush({ status: 'ok', database: 'up' });
    await fixture.whenStable();
    expect(page().textContent).toContain('Todo conectado');
  });

  it('no presenta una respuesta inesperada como una conexion correcta', async () => {
    initialRequest().flush({ mensaje: 'otra respuesta' });
    await fixture.whenStable();
    expect(page().textContent).toContain('Respuesta inesperada');
    expect(page().textContent).toContain('Sin verificar');
    expect(page().textContent).not.toContain('Todo conectado');
  });

  it('sale de la comprobacion si la API tarda mas de cinco segundos', async () => {
    initialRequest().flush({ status: 'ok', database: 'up' });
    await fixture.whenStable();
    vi.useFakeTimers();
    try {
      page().querySelector('button')!.click();
      fixture.detectChanges();
      const req = initialRequest();
      await vi.advanceTimersByTimeAsync(5001);
      fixture.detectChanges();
      expect(req.cancelled).toBe(true);
      expect(page().textContent).toContain('Sin respuesta');
      expect(page().querySelector('button')?.disabled).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
